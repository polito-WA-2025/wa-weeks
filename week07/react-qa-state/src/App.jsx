import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { Col, Container, Row, Navbar } from 'react-bootstrap';
import './App.css';

import { AnswerTable } from './components/AnswerComponents.jsx';
import { QuestionDescription } from './components/QuestionComponents.jsx';

import { Question } from './QAModels.js';

const question = new Question(1, 'Best way of enumerating an array in JS?', 'Enrico', '2024-03-01');
question.init();
const answers = question.getAnswers();


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



function Main(props) {

  return (<>
    <Row>
      <QuestionDescription question={question} />
    </Row>
    <Row>
      <Col>
        <h2>Current Answers</h2>
      </Col>
    </Row>
    <Row>
      <Col>
        <AnswerTable listOfAnswers={answers} />
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
