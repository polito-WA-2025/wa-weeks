import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
//import './App.css';
import { Course } from './Course';
import { CourseList } from './CourseList';
import { useEffect, useState } from 'react';
import { Routes, Route, Outlet, useNavigate, Navigate } from 'react-router';
import { ErrorsAlert, MyNavbar, coursesContext, studentContext, spActivitiesContext, checkStudyPlanModified, waitingContext, NotFoundPage } from './Miscellaneous';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { API } from './API';
import { LoginForm, TotpForm } from './LoginForm';
import { StudyPlan } from './StudyPlan';


function App() {
  const navigate = useNavigate();
  
  /** The list of courses */
  const [courses, setCourses] = useState([]);

  /** A list of errors */
  const [errors, setErrors] = useState([]);

  /**
   * Information about the currently logged in student.
   * This is undefined when no student is logged in
   */
  const [student, setStudent] = useState(undefined);

  /**
   * The study plan before any local changes.
   * This is an object like {fullTime: bool, courses: ["..."]}.
   * At any moment, student.spEdited marks the current study plan as modified from this saved one
   */
  const [savedStudyPlan, setSavedStudyPlan] = useState(undefined);

  /** Flag authentication via TOTP performed successfully */
  const [loggedInTotp, setLoggedInTotp] = useState(false);

  /** Flags initial loading of the app */
  const [loading, setLoading] = useState(true);

  /** Network-related waiting, like after pressing save or delete study plan. When waiting all controls are disabled. */
  const [waiting, setWaiting] = useState(false);
  
  useEffect(() => {
    // Load the list of courses and number of students enrolled from the server
    Promise.all([API.fetchCourses(), API.fetchNumStudents()])
      .then(res => {
        const c = res[0]; // Courses
        const n = res[1]; // Num enrolled
        
        setCourses(
          c.map(course => new Course(
            course.code,
            course.name,
            course.cfu,
            n[course.code] || 0,
            course.incompat,
            course.mandatory,
            course.maxStudents
          ))
          .sort((a, b) => a.name.localeCompare(b.name))
        );

        // Loading done
        setLoading(false);
      })
      .catch(err => setErrors(err));

      // Check if the user was already logged in
      API.fetchCurrentStudent()
        .then(student => {
          setStudent(student);
          setSavedStudyPlan({fullTime: student.fullTime, courses: student.studyPlan});
        })
        .catch(err => {
          // Remove eventual 401 Unauthorized errors from the list, those are expected
          setErrors(err.filter(e => e !== "Not authenticated"));
        });
  }, []);

  /**
   * Refetches dynamic content (number of students per course and study plan info)
   * 
   * @returns a Promise that resolves when the refetch is complete
   */
  const refetchDynamicContent = () => {
    // Fetch number of students for each course
    const p1 = API.fetchNumStudents()
      .then(n => setCourses(courses => courses.map(c => ({...c, numStudents: n[c.code] || 0})).sort((a, b) => a.name.localeCompare(b.name))))
      .catch(err => setErrors(err));

    // Fetch student's info
    const p2 = API.fetchCurrentStudent()
      .then(student => {
        setStudent(student);
        setSavedStudyPlan({fullTime: student.fullTime, courses: student.studyPlan});
      })
      .catch(err => {
        // Remove eventual 401 Unauthorized errors from the list, those are expected
        setErrors(err.filter(e => e !== "Not authenticated"));
      });

    return Promise.all([p1, p2]);
  }

  /**
   * Perform the login-totp
   * 
   * @param code TOTP code
   * @param onFinish optional callback to be called on login success or fail
   */
  const loginTotp = (code, onFinish) => {
    API.loginTotp(code)
      .then(() => {
        setLoggedInTotp(true);
        setErrors([]);
        //refetchDynamicContent()
        //  .then(() => navigate("/"));
        navigate("/");
      })
      .catch(err => setErrors(err))
      .finally(() => onFinish?.());  };

  /**
   * Perform the login
   * 
   * @param email email of the student
   * @param password password of the student
   * @param onFinish optional callback to be called on login success or fail
   */
  const login = (email, password, onFinish) => {
    API.login(email, password)
      .then(student => {
        setErrors([]);
        refetchDynamicContent()
          //.then(() => navigate("/"));
      })
      .catch(err => setErrors(err))
      .finally(() => onFinish?.());
  };

  /**
   * Perform the logout
   */
  const logout = () => {
    API.logout()
      .then(() => {
        setStudent(undefined);
        setSavedStudyPlan(undefined);
        setLoggedInTotp(false);
      })
      .catch(err => {
        // Remove eventual 401 Unauthorized errors from the list
        setErrors(err.filter(e => e !== "Not authenticated"));
      });
  };

  /**
   * Create a study plan
   * 
   * @param fullTime boolean
   */
  const createStudyPlan = fullTime => {
    setStudent(student => ({...student, fullTime, studyPlan: [], spEdited: true}));
  };

  /**
   * Delete the current study plan locally and remotely
   * 
   * @returns a Promise that resolves to nothing on success
   */
  const deleteStudyPlan = () => {
    setWaiting(true);
    
    // Only submit the deletion to the server if there was a saved study plan in the first place
    const p = (savedStudyPlan.fullTime !== null && savedStudyPlan.fullTime !== undefined) ?
      API.deleteStudyPlan()
    :
      Promise.resolve();
    
    return p.then(() => refetchDynamicContent())
      .catch(err => setErrors(err))
      .finally(() => setWaiting(false));
  };

  /**
   * Add a course to the study plan. Note that this does no check for the validity of this operation.
   * The caller is supposed to check beforehand.
   * In this case it's ok because the application forbids the user from reaching this function call
   * if doing so violates any constraint.
   * 
   * @param courseCode code of the course to add
   */
  const addCourseToSP = courseCode => {
    setStudent(student => {
      const spLocal = [...student.studyPlan, courseCode];
      const spEdited = checkStudyPlanModified(savedStudyPlan, {fullTime: student.fullTime, courses: spLocal});

      return {...student, studyPlan: spLocal, spEdited};
    });
  };

  /**
   * Remove a course from the study plan. Similar considerations to addCourseToSP apply
   * 
   * @param courseCode code of the course to remove
   */
  const removeCourseFromSP = courseCode => {
    setStudent(student => {
      const spLocal = student.studyPlan.filter(sp => sp !== courseCode);
      const spEdited = checkStudyPlanModified(savedStudyPlan, {fullTime: student.fullTime, courses: spLocal});

      return {...student, studyPlan: spLocal, spEdited};
    });
  };

  /**
   * Save changes made to the study plan, i.e. submit them to the server
   * 
   * @returns a Promise that resolves to nothing on success
   */
  const saveSPChanges = () => {
    setWaiting(true);
    
    const create = () => API.createStudyPlan(student.fullTime, student.studyPlan);
    const edit = () => {
      // Find diff between saved and current study plans
      const add = student.studyPlan.filter(c => !savedStudyPlan.courses.includes(c));
      const rem = savedStudyPlan.courses.filter(c => !student.studyPlan.includes(c));

      return API.editStudyPlan(add, rem);
    };

    // Differentiate between creation of a new study plan and edit of an existing one
    const APICall = (savedStudyPlan.fullTime === null || savedStudyPlan.fullTime === undefined) ?
      create : edit;

    return APICall()
      .then(() => refetchDynamicContent())
      .catch(err => setErrors(err))
      .finally(() => setWaiting(false));
  };

  /**
   * Discard the latest changes made to the study plan, i.e. reset to the server's version
   */
  const discardSPChanges = () => {
    // Rollback to the saved version of the study plan
    setStudent(student => ({...student, fullTime: savedStudyPlan.fullTime, studyPlan: savedStudyPlan.courses, spEdited: false}));
  };

  // Groups all the sp-related functions
  const spActivities = {
    createStudyPlan,
    deleteStudyPlan,
    addCourseToSP,
    removeCourseFromSP,
    saveSPChanges,
    discardSPChanges
  };
  
  return (
    <Routes>
      <Route path="/" element={<Header student={student} loggedInTotp={loggedInTotp} logoutCbk={logout} errors={errors} clearErrors={() => setErrors([])}/>}>
        <Route path="" element={loading ? <LoadingSpinner/> : <HomePage student={student} courses={courses} spActivities={spActivities} errorAlertActive={errors.length > 0} waiting={waiting} loggedInTotp={loggedInTotp} />}/>
        {/* <Route path="login" element={loading ? <LoadingSpinner/> : <LoginForm loginCbk={login} errorAlertActive={errors.length > 0}/>}/> */}
        <Route path="login" element={loading ? <LoadingSpinner/> : <LoginWithTotp loginCbk={login} loginTotpCbk={loginTotp} errorAlertActive={errors.length > 0} loggedInTotp={loggedInTotp} student={student} />}/>
      </Route>

      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  );
}

/**
 * Authentication component, handling both username/password login and TOTP authentication
 *
 * @param props.loginCbk callback to perform username/password authentication
 * @param props.loginTotpCbk callback to perform TOTP authentication
 * @param props.loggedInTotp boolean, when true TOTP has been successful
 * @param props.student object with all the currently logged in student's info
 * @param props.errorAlertActive true when the error alert on the top is active and showing, false otherwise
 */
function LoginWithTotp(props) {
  if (props.student) {
    if (props.student.canDoTotp) {
        if (props.loggedInTotp) {
        return <Navigate replace to='/' />;
      } else {
        return <TotpForm loginTotpCbk={props.loginTotpCbk} />;
      }
    } else {
      return <Navigate replace to='/' />;
    }
  } else {
    return <LoginForm loginCbk={props.loginCbk} errorAlertActive={props.errorAlertActive} />;
  }
}

/**
 * Proper home page component of the app
 *
 * @param props.courses list of all the Course objects
 * @param props.student object with all the currently logged in student's info
 * @param props.spActivities object with all the study plan related functions
 * @param props.errorAlertActive true when the error alert on the top is active and showing, false otherwise
 * @param props.waiting boolean, when true all controls should be disabled
 */
function HomePage(props) {
  return (
    <coursesContext.Provider value={props.courses}>
      <studentContext.Provider value={props.student}>
        <spActivitiesContext.Provider value={props.spActivities}>
          <waitingContext.Provider value={props.waiting}>
            <Container fluid style={{"paddingLeft": "2rem", "paddingRight": "2rem", "paddingBottom": "1rem", "marginTop": props.errorAlertActive ? "2rem" : "6rem"}}>
              <Row className="justify-content-center">
                <Col lg style={{"borderRight": props.student && "1px solid #dfdfdf", "maxWidth": "70%"}}>
                  <CourseList/>
                </Col>
                {
                  // If a student is logged in, show their study plan
                  props.student ?
                  <Col lg>
                    <StudyPlan loggedInTotp={props.loggedInTotp} />
                  </Col> : false
                }
              </Row>
            </Container>
          </waitingContext.Provider>
        </spActivitiesContext.Provider>
      </studentContext.Provider>
    </coursesContext.Provider>
  );
}

/**
 * Header of the page, containing the navbar and, potentially, the error alert
 * 
 * @param props.errors current list of error strings
 * @param props.clearErrors callback to clear all errors
 * @param props.student object with all the currently logged in student's info
 * @param props.loggedInTotp boolean with TOTP status
 * @param props.logoutCbk callback to perform the student's logout
 */
function Header(props) {
  return (
    <>
      <MyNavbar student={props.student} logoutCbk={props.logoutCbk} loggedInTotp={props.loggedInTotp} />
      {
        props.errors.length > 0 ? <ErrorsAlert errors={props.errors} clear={props.clearErrors}/> : false
      }
      <Outlet/>
    </>
  );
}

/**
 * A loading spinner shown on first loading of the app
 */
function LoadingSpinner() {
  return (
    <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default App;
