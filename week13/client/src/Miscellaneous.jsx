import { createContext } from "react";
import { Alert, Button, Container, Nav, Navbar, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useNavigate } from "react-router";

/** Context used to propagate the list of courses */
const coursesContext = createContext();

/** Context used to propagate the user object */
const studentContext = createContext();

/** Context used to propagate all the study plan related functions */
const spActivitiesContext = createContext();

/** Context used to propagate the waiting state to everything that might need it */
const waitingContext = createContext();

/**
 * The navigation bar at the top of the app.
 * This is meant to be inserted as a parent route to pretty much the entire app
 * 
 * @param props.student object with all the currently logged in student's info
 * @param props.loggedInTotp boolean with TOTP status
 */
function MyNavbar(props) {
  const navigate = useNavigate();
  
  return (
    <>
      <Navbar className="shadow" fixed="top" bg="light" style={{"marginBottom": "2rem"}}>
        <Container>
          <Navbar.Brand href="/" onClick={event => {event.preventDefault(); navigate("/");}}>
            <i className="bi bi-card-list"/>
            {" "}
            Study Plan
          </Navbar.Brand>
          <Nav>
            {
              props.student ?
                <Navbar.Text>
                  Logged in {props.loggedInTotp ? '(2FA)' : ''} as: {props.student.name} | <a href="/logout" onClick={event => {event.preventDefault(); props.logoutCbk();}}>Logout</a>
                </Navbar.Text>
                :
                <Nav.Link href="/login" active={false} onClick={event => {event.preventDefault(); navigate("/login");}}>
                  Login
                  {" "}
                  <i className="bi bi-person-fill"/>
                </Nav.Link>
            }
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

/**
 * Informs the user that the route is not valid
 */
function NotFoundPage() {
  return <>
    <div style={{"textAlign": "center", "paddingTop": "5rem"}}>
      <h1>
        <i className="bi bi-exclamation-circle-fill"/>
        {" "}
        The page cannot be found
        {" "}
        <i className="bi bi-exclamation-circle-fill"/>
      </h1>
      <br/>
      <p>
        The requested page does not exist, please head back to the <Link to={"/"}>app</Link>.
      </p>
    </div>
  </>;
}

/**
 * Bootstrap's Alert component used to show errors
 * 
 * @param props.errors list of error strings to show
 * @param props.clear callback to clear all errors
 */
function ErrorsAlert(props) {
  return (
    <Alert variant="danger" dismissible onClose={props.clear} style={{"margin": "2rem", "marginTop": "6rem"}}>
      {props.errors.length === 1 ? props.errors[0] : ["Errors: ", <br key="br"/>, <ul key="ul">
      {
        props.errors.map((e, i) => <li key={i + ""}>{e}</li>)
      }
      </ul>]}
    </Alert>
  );
}

/**
 * Exactly what you may expect.
 * 
 * @param props.inner contents of the button
 * @param props.variant variant of the bootstrap Button
 * @param props.tooltip text to show on hover. Disabled if empty
 * @param props.disabled whether the button is disabled or not
 * @param props.onClick callback on click of the button
 */
 function SmallRoundButton(props) {
  const button = <Button variant={props.variant} disabled={props.disabled} className="rounded-pill" onClick={props.onClick} style={{
      "width": "30px",
      "height": "30px",
      "textAlign": "center",
      "padding": "0px"
    }}>
      {props.inner}
    </Button>;

  if (props.tooltip) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={"tooltip2"}>{props.tooltip}</Tooltip>
        }
      >
        <div>{/* The div allows the tooltip to be shown on disabled buttons */ button}</div>
      </OverlayTrigger>
    );
  } else {
    return button;
  }
}

/**
 * Checks the compatibility of the specified Course with the provided study plan
 * 
 * @param course the Course object to test
 * @param studyPlan a list of all the course codes currently in the study plan
 * @param courses all the courses
 * @param fullTime boolean, full or part time
 * 
 * @returns an object like {result: <boolean>, reason: "..."}, where reason, in case result is false,
 *          contains a user-appropriate explaination for why this course is not compatible
 */
function checkCourseConstraints(course, studyPlan, courses, fullTime) {
  // Is this addition or removal?
  if (studyPlan.includes(course.code)) {
    // Removal
    // Check if there's any other course in the study plan that needs this one
    let needy = studyPlan
      .map(sp => courses.find(c => c.code === sp))
      .filter(c => c.mandatory === course.code);

    if (needy.length > 0) {
      return {
        result: false,
        reason: "This course is needed by " + needy
          .map(n => `${n.code}: ${n.name}`)
          .reduce((previous, current) => previous + ", " + current)
      };
    }
  } else {
    // Addition
    // Check mandatory
    if (course.mandatory && !studyPlan.includes(course.mandatory)) {
      return {
        result: false,
        reason: `This course requires ${course.mandatory}: ${courses.find(c => c.code === course.mandatory)?.name || "Unknown course"}`
      };
    }

    // Check incompatibilities
    let incompats = [];
    for (const i of course.incompat) {
      if (studyPlan.includes(i)) {
        incompats.push(i);
      }
    }

    if (incompats.length > 0) {
      return {
        result: false,
        reason: "This course is incompatible with " + incompats
          .map(i => `${i}: ${courses.find(c => c.code === i)?.name || "Unknown course"}`)
          .reduce((previous, current) => previous + ", " + current)
      };
    }

    // Check number of students
    if (course.maxStudents && course.numStudents >= course.maxStudents) {
      return {
        result: false,
        reason: "This course has reached the maximum amount of students"
      }
    }

    // Check cfu
    const currentCfu = studyPlan
      .map(sp => courses.find(c => c.code === sp))
      .reduce((previous, current) => previous + current.cfu, 0);

    const maxCfu = fullTime ? 80 : 40;

    if (currentCfu + course.cfu > maxCfu) {
      return {
        result: false,
        reason: "Adding this course would exceed the maximum number of credits for your career type"
      }
    }
  }

  // If everything else was ok, return successful
  return {
    result: true
  };
}

/**
 * Checks whether the current study plan contains local changes vs the saved version
 * 
 * @param saved saved version of the study plan
 * @param current current study plan
 * 
 * @returns true if the study plan has been modified, false if they are equal
 */
function checkStudyPlanModified(saved, current) {
  // This function will only be called if a current study plan exists
  if (saved.fullTime !== current.fullTime) return true;

  // Check if the two study plans contain the same number of courses
  if (saved.courses.length !== current.courses.length) return true;

  for (const c of saved.courses) {
    if (!current.courses.includes(c))
      return true;
  }

  return false;
}

export {
  MyNavbar,
  NotFoundPage,
  ErrorsAlert,
  coursesContext,
  studentContext,
  spActivitiesContext,
  waitingContext,
  SmallRoundButton,
  checkCourseConstraints,
  checkStudyPlanModified
};
