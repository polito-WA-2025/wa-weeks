import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Col, Container, Row, Button, Form, Table, Navbar } from 'react-bootstrap';
import './App.css';

import { Question } from './QAModels.js';

const question = new Question(1, 'Best way of enumerating an array in JS?', 'Enrico', '2024-03-01');
question.init();
const answerList = question.getAnswers();


function MyHeader(props) {
	return (
		<Navbar bg="primary" variant="dark">
      <Navbar.Brand className="mx-2">
      <i className="bi bi-collection-play" />
      {/* props.appName just in case you want to set a different app name */}
			{props.appName || "HeapOverrun"}
      </Navbar.Brand>
		</Navbar>
	);
}


function MyFooter(props) {
  return (<footer>
    <p>&copy; Web Applications</p>
    <div id="time"></div>
  </footer>);
}

function AnswerRow(props) {
  const e = props.answer;
  return (
    <tr>
      <td>{e.date.format("YYYY-MM-DD")}</td>
      <td>{e.text}</td>
      <td>{e.respondent}</td>
      <td>{e.score}</td>
      <td><Button variant="primary">Vote</Button></td>
    </tr>
  );
}

function MyTable(props) {
  return (
    <Table>
      {/* <Table striped bordered hover> */}
    <thead>
      <tr>
        <th>Date</th>
        <th>Text</th>
        <th>Author</th>
        <th>Score</th>
        <th>Action</th>
      </tr>
    </thead>
      <tbody>        
        {/* the key can also be the answer id, if unique */}
				{props.listOfAnswers.map( (e) => 
				 <AnswerRow key={e.id} answer={e} /> )
        }
    </tbody>
    </Table>
  )
}

function Main(props) {
  return (<>
    <Row>
      <Col xs={9}>
        <p className="question">Best way of enumerating an array in JS?</p>
      </Col>
      <Col xs={3}>
        <p className="question">Author: Enrico</p>
      </Col>
    </Row>
    <Row>
      <Col>
        <h2>Current Answers</h2>
      </Col>
    </Row>
    <Row>
      <Col>
        <MyTable listOfAnswers={answerList} />
      </Col>
    </Row>
  </>
  );
}



function App() {

  return (
    <Container fluid>
      <Row>
        <Col>
          <MyHeader />
        </Col>
      </Row>
      <Main />
      <Row>
        <Col>
          <MyFooter />
        </Col>
      </Row>
    </Container>
  )
}


export default App
