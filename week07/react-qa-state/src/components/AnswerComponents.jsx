import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table } from 'react-bootstrap';


function AnswerRow(props) {
    const e = props.answer;
    return (
      <tr>
        <td>{e.date.format("YYYY-MM-DD")}</td>
        <td>{e.text}</td>
        <td>{e.respondent}</td>
        <td>{e.score}</td>
        <td><Button>Vote</Button></td>
      </tr>
    );
  }
  
  function AnswerTable(props) {
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
          {/* the key can be the answer id, if unique */}
                  {props.listOfAnswers.map( (e) => 
                   <AnswerRow key={e.id} answer={e} vote={props.vote} delete={props.delete} /> )
          }
        </tbody>
      </Table>
    )
  }
  
  export { AnswerTable };