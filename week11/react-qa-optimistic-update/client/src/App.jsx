import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import { Col, Container, Row, Navbar, Button, Spinner, Alert } from 'react-bootstrap';
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
    {props.errorMsg? <Row><Col><Alert
    variant='danger' dismissible onClose={()=>props.setErrorMsg('')}>
      {props.errorMsg}</Alert></Col></Row> : null}
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

  const [initialLoading, setInitialLoading] = useState(true);

  const [dirty, setDirty] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');


  function handleError(err) {
    console.log(err);
    let errMsg = 'Unkwnown error';
    if (err.errors)
      if (err.errors[0].msg)
        errMsg = err.errors[0].msg;
    else if (err.error)
      errMsg = err.error;
        
    setErrorMsg(errMsg);

    setTimeout(()=>setDirty(true), 2000);  // Fetch the current version from server, after a while
  }


  const questionId = 1;
  useEffect( ()=> {
     API.getQuestion(questionId)
       .then(q => setQuestion(q));
  }, []);

  useEffect(() => {
    if (question.id && dirty)
      API.getAnswersByQuestionId(question.id)
        .then(answerList => {
          setAnswers(answerList);
          setInitialLoading(false);
          setDirty(false);
        });

  }, [question.id, dirty]);

  function voteAnswer(id, delta) {
    setAnswers(answerList =>
      answerList.map(e => e.id === id ? Object.assign({}, e, { score: e.score + delta, status: 'updated' }) : e)
    );
    API.voteAnswer(id, delta)
      .then( ()=> setDirty(true))
      .catch( err => handleError(err));
  }

  function deleteAnswer(id) {
    /*
    setAnswers(answerList =>
      answerList.filter(e => e.id !== id)
    );
    */

    setAnswers(answerList =>
      answerList.map( e => e.id === id ? Object.assign({}, e, {status:'deleted'}) : e)
    );

    API.deleteAnswer(id)
      .then( () => setDirty(true) )
      .catch( err => handleError(err) );
  }


  function addAnswer(answer) {
    setAnswers( 
    // NB: The new answer should have a new id. This will solved by adding it to a database,
    // because in this case the server will return a unique id for the new entry in the table
    // At the moment this limits the possibility to edit the answer
    // To compute a new id on the client side, just do max(all ids)+1. But remember that
    // this is NOT an acceptable solution in a web application since 
    // in general there can be multiple clients, and the server is the place to compute the unique id.
      answerList => {
        answer.questionId = question.id;
        answer.status = 'added';
        return [...answerList, answer];
      }
    );
    API.addAnswer(answer)
      .then( ()=> setDirty(true))
      .catch( err => handleError(err));
  }

  function saveExistingAnswer(ans) {
    setAnswers( answerList =>
      answerList.map( e => e.id === ans.id ? {...ans, status: 'updated'} : e)
    );
    API.updateAnswer(ans)
      .then( ()=>setDirty(true))
      .catch( err => handleError(err));
  }

  return (
    <Routes>
      <Route path='/' element={ <Layout /> } >
        <Route index  element={ initialLoading ?
        <Row><Col><Spinner /></Col></Row>
        : <AnswerRoute answers={answers} question={question}
          voteAnswer={voteAnswer} deleteAnswer={deleteAnswer}
          errorMsg={errorMsg} setErrorMsg={setErrorMsg} /> } />
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
