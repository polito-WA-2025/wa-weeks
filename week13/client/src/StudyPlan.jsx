import { useContext, useState } from "react";
import { Badge, Button, Col, Form, ListGroup, OverlayTrigger, Popover, Row, Spinner, Tooltip } from "react-bootstrap";
import { checkCourseConstraints, coursesContext, spActivitiesContext, studentContext, waitingContext } from "./Miscellaneous";

/**
 * Component that shows the study plan for the logged in student and allows them to edit it
 */
function StudyPlan(props) {
  const courses = useContext(coursesContext);
  const student = useContext(studentContext);

  // Get the list of Courses in the study plan
  const studyPlanCourses = courses.filter(c => student.studyPlan?.includes(c.code));
  
  return (
    <>
    <Toolbar state={student.studyPlan === undefined ? "create" : "edit"} edited={student.spEdited} canDelete={props.loggedInTotp} />
    {
      student.studyPlan === undefined ?
        <>
          <Row className="justify-content-center" style={{"color": "grey"}}>
            <Col md="auto">
              <i className="bi bi-code-slash" style={{"fontSize": "3rem"}}/>
            </Col>
          </Row>
          <Row className="justify-content-center" style={{"color": "grey"}}>
            <Col md="auto">
              <em>No study plan yet :)</em>
            </Col>
          </Row>
        </>
      :
        <Row style={{"marginLeft": "0px", "marginTop": "0.8rem"}}>
          <StudyPlanList courses={studyPlanCourses}/>
        </Row>
    }
    </>
  );
}

/**
 * A nice toolbar shown at the top of the StudyPlan component with contextually useful buttons
 * 
 * @param props.state specifies the state of this toolbar. Possible values: "create" - show Create button,
 *                    "edit" - shows Save and Cancel buttons, together with the current amount of credits
 * @param props.edited when state="edit", this means that the study plan has been edited, thus
 *                     the Save button must be enabled
 */
function Toolbar(props) {
  /**
   * Type of study plan (for creation of a new study plan):
   *   true - full time
   *   false - part time
   */
  const [fullTime, setFullTime] = useState(true);

  /** Used for the delete study plan button to toggle its active state */
  const [deleteButtonActive, setDeleteButtonActive] = useState(false);

  /** Waiting for the save study plan callback to resolve */
  const [saving, setSaving] = useState(false);

  /** Waiting for the delete study plan callback to resolve */
  const [deleting, setDeleting] = useState(false);

  const courses = useContext(coursesContext);
  const student = useContext(studentContext);
  const spa = useContext(spActivitiesContext);
  const waiting = useContext(waitingContext);

  /** Callback attached to the Save button */
  const saveSP = () => {
    setSaving(true);
    spa.saveSPChanges()
      .then(() => setSaving(false));
  };
  
  /** Callback attached to the Delete button */
  const deleteSP = () => {
    setDeleteButtonActive(false);
    setDeleting(true);
    spa.deleteStudyPlan()
      .then(() => setDeleting(false));
  };

  /** Main content of the toolbar */
  let content;
  
  switch (props.state) {
    case "create":
      content = (
        <>
          <Col sm className="align-self-center">
            <Form.Switch
              checked={fullTime}
              label={fullTime ? "Full Time" : "Part Time"}
              onChange={event => setFullTime(event.target.checked)}
            />
          </Col>
          <Col sm="auto" style={{"padding": "0px"}}>
            <Button className="rounded-pill" onClick={() => spa.createStudyPlan(fullTime)}>
              Create new Study Plan
            </Button>
          </Col>
        </>);
      break;

    case "edit":
    default:
      const curCfu = student.studyPlan
        .map(sp => courses.find(c => c.code === sp))
        .reduce((previous, current) => previous + (current?.cfu || 0), 0);

      const minCfu = student.fullTime ? 60 : 20;
      const maxCfu = student.fullTime ? 80 : 40;

      const oobCfu = curCfu < minCfu || curCfu > maxCfu; // Out-of-bounds?
      
      content = (
        <>
          <Col sm="auto" className="align-self-center">
            <Badge pill bg="secondary">{ student.fullTime ? "full" : "part" }-time</Badge>
          </Col>
          <Col>
            <nobr>
              <em style={{"color": "grey", "verticalAlign": "middle"}}>{minCfu}<span style={{"fontSize": "1.5rem"}}> 
              | <span style={{"color": oobCfu ? "red" : "black"}}>{curCfu}</span> 
              | </span>{maxCfu}
              </em>
            </nobr>
          </Col>
          <Col md="auto" style={{"padding": "0px"}}>
            <Button variant="success" className="rounded-pill" disabled={!props.edited || oobCfu || waiting} style={{"height": "100%", "marginRight": "4px", "minWidth": "100px"}} onClick={saveSP}>
              {
                saving ?
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">Saving...</span>
                  </>
                : "Save"
              }
            </Button>
            <Button variant="danger" className="rounded-pill" disabled={!props.edited || waiting} style={{"height": "100%", "marginRight": "15px", "minWidth": "100px"}} onClick={() => spa.discardSPChanges()}>
              Cancel
            </Button>
            <OverlayTrigger show={deleteButtonActive} placement="bottom" overlay={
              <Popover>
                <Popover.Header as="h3">Are you sure?</Popover.Header>
                <Popover.Body>
                  <Row className="mb-3" style={{"paddingLeft": "10px", "paddingRight": "10px"}}>This action can not be undone.<br/>Do you want to proceed anyway?</Row>
                  <Row style={{"marginBottom": "0px"}}><Button variant="danger" disabled={waiting} onClick={deleteSP}>Yes, delete the study plan</Button></Row>
                </Popover.Body>
              </Popover>
            }>
              <Button variant="outline-danger" className="rounded-pill" disabled={waiting || !props.canDelete} active={deleteButtonActive} onClick={() => setDeleteButtonActive(cur => !cur)} style={{"height": "100%", "minWidth": "100px"}}>
                {
                  deleting ?
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Deleting...</span>
                    </>
                  :
                    <>
                      <i className="bi bi-exclamation-circle"/>
                      {" "}
                      Delete
                      {" "}
                      <i className="bi bi-exclamation-circle"/>
                    </>
                }
              </Button>
            </OverlayTrigger>
          </Col>
        </>);
  }
  
  return (
    <Row className="justify-content-end rounded-pill mb-1" style={{
      "backgroundColor": "#f8f9fA",
      "margin": "0px",
      "paddingTop": "0.2rem",
      "paddingBottom": "0.2rem",
      "paddingLeft": "1rem",
      "paddingRight": "4px"
    }}>
      {
        content
      }
    </Row>
  );
}

/**
 * Displays the list of courses in the study plan
 * 
 * @param props.courses the list of Course objects in the study plan
 */
function StudyPlanList(props) {
  return (
    <ListGroup>
      {
        props.courses.map(c => <ListGroup.Item key={c.code}><StudyPlanListItem course={c}/></ListGroup.Item>)
      }
    </ListGroup>
  );
}

/**
 * Single list item for the StudyPlanList
 * 
 * @param props.course Course object
 */
function StudyPlanListItem(props) {
  const courses = useContext(coursesContext);
  const student = useContext(studentContext);
  const spa = useContext(spActivitiesContext);
  const waiting = useContext(waitingContext);

  // Check if course can be removed
  const constraints = student?.studyPlan && checkCourseConstraints(
    props.course,
    student.studyPlan,
    courses,
    student.fullTime
  );
  const constrOk = constraints !== undefined ? constraints.result : true;

  const removeButton = <Button
    variant="link"
    disabled={!constrOk || waiting}
    style={{"fontSize": "0.8rem"}}
    onClick={() => spa.removeCourseFromSP(props.course.code)}
  >remove</Button>;
  
  return (
    <Row>
      <Col md="auto" className="align-self-center">
        <Badge bg="secondary">
          <tt>{props.course.code}</tt>
        </Badge>
      </Col>
      <Col className="align-self-center" style={{"borderLeft": "1px solid grey"}}>
        {props.course.name}
        {" "}
        <Badge bg="light" pill style={{"color": "black"}}>
          CFU: {props.course.cfu}
        </Badge>
      </Col>
      <Col md="auto" className="align-self-center">
        {
          constrOk ?
            removeButton
          :
            <OverlayTrigger overlay={<Tooltip>{constraints.reason}</Tooltip>}>
              <div>{removeButton}</div>
            </OverlayTrigger>
        }
      </Col>
    </Row>
  );
}

export { StudyPlan };
