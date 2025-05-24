import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Col, Button, Form, Table } from 'react-bootstrap';

function QuestionDescription(props) {
    const { question } = props;
    return (
        <>
            <Col xs={9}>
                <p className="question">Q #{question.id}: {question.text}</p>
            </Col>
            <Col xs={3}>
                <p className="question">Author: {question.questioner}</p>
            </Col>
        </>
    );
}

export { QuestionDescription };