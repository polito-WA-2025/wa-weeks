import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import { Col, Container, Row, Navbar, Button, Spinner } from 'react-bootstrap';
import { Routes, Route, Outlet, Link } from 'react-router';
import './App.css';

import { AnswerTable } from './components/AnswerComponents.jsx';
import { QuestionDescription } from './components/QuestionComponents.jsx';
import { FormRoute } from './components/FormComponents.jsx';

//import { Question } from './QAModels.js';

import API from './API.js';

//const question = new Question(1, 'Best way of enumerating an array in JS?', 'Enrico', '2024-03-01');
//question.init();
//const initialAnswerList = question.getAnswers();


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


function AnswerRoute(props) {   // former Main component

  // ROUTES 
  // /  = initial page  (list of answers)
  // /add = show the form needed to add a new answer
  // /edit/:id  = show the form to edit an answer  (identified by :id)


  return (<>
    <Row>
      <QuestionDescription question={props.question} />
    </Row>
    <Row>
      <Col>
        <h2>Current Answers</h2>
      </Col>
    </Row>
    <Row>
      <Col>
        <AnswerTable listOfAnswers={props.answers} vote={props.voteAnswer} 
        delete={props.deleteAnswer} />
      </Col>
    </Row>
    <Row>
      <Col>
         <Link to='/add'>
           <Button>Add something</Button>
         </Link>
         </Col>
    </Row> 
  </>
  );
}

function App() {
    // state moved up into App

  const [question, setQuestion] = useState({});
  const [ answers, setAnswers ] = useState([]);

  const [waiting, setWaiting] = useState(true);

  useEffect( ()=> {
    const questionId = 1;
     API.getQuestion(questionId)
       .then(q => setQuestion(q));

     API.getAnswersByQuestionId(questionId)
       .then(answerList => {
        setAnswers(answerList);
        setWaiting(false);
       });
       
  }, []);

  function voteAnswer(id, delta) {
    setAnswers(answerList =>
      answerList.map(e => e.id === id ? Object.assign({}, e, { score: e.score + delta }) : e)
    );
  }

  function deleteAnswer(id) {
    setAnswers(answerList =>
      answerList.filter(e => e.id !== id)
    );
  }


  function addAnswer(answer) {
    setAnswers( 
    // NB: The new answer should have a new id. This will solved by adding it to a database,
    // because in this case the server will return a unique id for the new entry in the table
    // At the moment this limits the possibility to edit the answer
    // To compute a new id on the client side, just do max(all ids)+1. But remember that
    // this is NOT an acceptable solution in a web application since 
    // in general there can be multiple clients, and the server is the place to compute the unique id.
      answerList => 
        [...answerList, answer]
    );
  }

  function saveExistingAnswer(ans) {
    setAnswers( answerList =>
      answerList.map( e => e.id === ans.id ? ans : e)
    );

  }

  return (
    <Routes>
      <Route path='/' element={ <Layout /> } >
        <Route index  element={ waiting ?
        <Row><Col><Spinner /></Col></Row>
        : <AnswerRoute answers={answers} question={question}
          voteAnswer={voteAnswer} deleteAnswer={deleteAnswer} /> } />
        <Route path='/add' element={ <FormRoute addAnswer={addAnswer} /> } />
        <Route path='/edit/:answerId' element={ <FormRoute 
          answerList={answers}
          saveExistingAnswer={saveExistingAnswer}
          /> } />
      </Route>
      <Route path='/*' element={ <DefaultRoute />} />
    </Routes>
  )
}


function Layout(props) {

  return (
    <Container fluid>
      <Row>
        <Col>
          <MyHeader />
        </Col>
      </Row>
      <Outlet />
      <Row>
        <Col>
          <MyFooter />
        </Col>
      </Row>
    </Container>
  )
}

function DefaultRoute(props) {
  return (
    <Container fluid>
      <p className="my-2">No data here: This is not a valid page!</p>
      <Link to='/'>Please go back to main page</Link>
    </Container>
  );
}


export default App
