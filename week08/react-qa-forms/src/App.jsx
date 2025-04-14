import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { Col, Container, Row, Navbar, Button } from 'react-bootstrap';
import './App.css';

import { AnswerTable } from './components/AnswerComponents.jsx';
import { QuestionDescription } from './components/QuestionComponents.jsx';

import { Question } from './QAModels.js';
import { AnswerForm } from './components/FormComponents.jsx';

const question = new Question(1, 'Best way of enumerating an array in JS?', 'Enrico', '2024-03-01');
question.init();
const initialAnswerList = question.getAnswers();


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

  const [ answers, setAnswers ] = useState(initialAnswerList);

  const [ showForm, setShowForm ] = useState(false);

  const [ editObj, setEditObj ] = useState(undefined);

  function voteAnswer(id, delta) {
    setAnswers( answerList => 
      answerList.map(e => e.id === id ? Object.assign({}, e, {score: e.score+delta}) : e)
    );
  }

  function deleteAnswer(id) {
    setAnswers( answerList =>
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
    setShowForm(false);
  }

  function editAnswer(id) {
    setEditObj( answers.find( e => e.id === id) );
    setShowForm(true);
  }

  function saveExistingAnswer(ans) {
    //console.log('saveExistingAnswer: ', ans);
    setAnswers( answerList =>
      answerList.map( e => e.id === ans.id ? ans : e)
    );

  }

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
        <AnswerTable listOfAnswers={answers} vote={voteAnswer} 
        delete={deleteAnswer} edit={editAnswer} />
      </Col>
    </Row>
    <Row>
      <Col>
        {/* key in AnswerForm is needed to make React re-create the component when editObj.id changes,
            i.e., when the editing form is open and another edit button is pressed. */}
    { showForm ?
         <AnswerForm addAnswer={addAnswer} 
         closeForm={()=>{setShowForm(false); setEditObj(undefined);}}
         editObj={editObj} saveExistingAnswer={saveExistingAnswer} 
         key={editObj ? editObj.id : -1} />
         : <Button onClick={()=>setShowForm(true)}>Add something</Button> }
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
