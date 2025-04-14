import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

import dayjs from 'dayjs';


function AnswerForm(props) {

    const [text, setText ] = useState('');
    const [date, setDate ] = useState(dayjs().format('YYYY-MM-DD'));
    const [score, setScore] = useState(0);
    const [respondent, setRespondent] = useState('');


    function handleSubmit(event) {
        event.preventDefault();
        const ans = {
            text: text,
            score: score,
            respondent: respondent,
            date: dayjs(date)
        }
        props.addAnswer(ans);
        //console.log("Answer text: "+text);
    }

    function handleScore(event) {
        setScore(event.target.value);
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="date" value={date} onChange={(event) => {
                    setDate(event.target.value); }} />
            </Form.Group>

            <Form.Group>
                <Form.Label>Text</Form.Label>
                <Form.Control type="text" name="text" value={text}
                    onChange={(event) => setText(event.target.value)} />
            </Form.Group>

            <Form.Group>
                <Form.Label>Respondent</Form.Label>
                <Form.Control type="text" name="respondent" value={respondent} onChange={(event) => setRespondent(event.target.value)} />
            </Form.Group>

            <Form.Group>
                <Form.Label>Score</Form.Label>
                <Form.Control type="number" name="score" value={score} onChange={handleScore} />
            </Form.Group>

            <Button type="submit">Save</Button>

        </Form>
    )
}

export { AnswerForm };