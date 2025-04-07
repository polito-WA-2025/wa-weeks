import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Table, Button } from "react-bootstrap";
import dayjs from 'dayjs';
import { Question } from './QAModels';
import './App.css'

const question = new Question(1, 'Best way of enumerating an array in JS?', 'Enrico', '2024-03-01');
question.init();
const answerList = question.getAnswers();
//console.log(answerList);

function Header(props) {
  return (
    <header>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <div>
            <i className="bi bi-lightbulb" style={{ fontSize: "2rem", color: "cornflowerblue" }}></i>
            <a className="navbar-brand" href="#">
              {props.appName  || "HeapOverrun"}
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

function MyTable(props) {
  return (
    <Table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Text</th>
        <th>Author</th>
        <th>Score</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody id="answers">
      {props.list.map( e => 
          <tr key={e.id}>
            <td>{e.date.format("YYYY-MM-DD")}</td>
            <td>{e.text}</td>
            <td>{e.respondent}</td>
            <td>{e.score}</td>
            <td><Button variant="primary">Vote</Button></td>
          </tr>
      )}
    </tbody>
    </Table>
  )
}

function App() {
  return (
    <div className="container-fluid">
    <Header appName="HeapOverrun" />
    <main>
        <div className="row lead mt-4">
            <div className="d-flex justify-content-center">
                <p className="question" id="questionText">Best way of enumerating an array in JS?</p>
                <p className="question ms-5">by <span id="questionAuthorName">Enrico Masala</span></p>
            </div>
        </div>
        <h2>Answers</h2>
        <MyTable list={answerList} />
    </main>
    <footer>
        &copy; Web Applications  <span id="time"></span>
    </footer>
</div>
  )
}

export default App
