import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from 'react-router';
import { Button, Table } from 'react-bootstrap';

function AnswerActions(props) {
  const navigate = useNavigate();

  return (
    <>
      <Button className="mx-1" variant="primary" onClick={props.upvote}><i className="bi bi-arrow-up"></i></Button>
      <Button className="mx-1" variant="primary" onClick={props.downvote}><i className="bi bi-arrow-down"></i></Button>
      <Button className="mx-1" variant="danger" onClick={props.delete} disabled={props.disableUserActions}><i className="bi bi-trash"></i></Button>
      <Button className="mx-1" variant="warning" onClick={()=>navigate(`/edit/${props.editId}`)} disabled={props.disableUserActions}><i className="bi bi-pencil"></i></Button>
    </>
  );
}

function AnswerRow(props) {
  const e = props.answer;
    
  let statusClass = null;

  switch(e.status) {
    case 'added':
      statusClass = 'table-success';
      break;
    case 'deleted':
      statusClass = 'table-danger';
      break;
    case 'updated':
      statusClass = 'table-warning';
      break;
    default:
      break;
  }

  return (
      <tr className={statusClass}>
        <td>{e.date.format("YYYY-MM-DD")}</td>
        <td>{e.text}</td>
        <td>{e.respondent}</td>
        <td>{e.score}</td>
        <td><AnswerActions upvote={()=>props.vote(e.id, 1)} downvote={()=>props.vote(e.id, -1)}
                delete={()=>props.delete(e.id)} editId={e.id}
                disableUserActions={e.respondentId != props.userId} /></td>
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
          {/* the key can also be the answer id, if unique */}
                  {props.listOfAnswers.map( (e,index) => 
                   <AnswerRow key={index} answer={e} vote={props.vote} delete={props.delete} edit={props.edit}
                   userId={props.user && props.user.id } /> )
          }
        </tbody>
      </Table>
    )
  }
  
  export { AnswerTable };
