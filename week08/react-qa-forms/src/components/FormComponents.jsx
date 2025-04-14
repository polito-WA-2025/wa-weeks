import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

import dayjs from 'dayjs';


function AnswerForm(props) {

    const [text, setText ] = useState(props.editObj? props.editObj.text : '');
    const [date, setDate ] = useState(props.editObj? 
        props.editObj.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
    const [score, setScore] = useState(props.editObj ? props.editObj.score : 0);
    const [respondent, setRespondent] = useState(props.editObj? props.editObj.respondent : '');

    const [errorMsg, setErrorMsg ] = useState('');


    function handleSubmit(event) {
        event.preventDefault();
        //console.log('Submit was clicked');

        // Form validation
        if (date === '')
            setErrorMsg('Invalid date');
        else if (isNaN(parseInt(score)))
            setErrorMsg('Invalid score');
        else if (parseInt(score) < 0) {
            setErrorMsg('Negative scores are invalid');
        } else if (!text) {
                setErrorMsg("Text field is empty");
        } else {

            const ans = {
                text: text,
                score: parseInt(score),
                respondent: respondent,
                date: dayjs(date)
            }

            if(props.editObj) {  // decide if this is an edit or an add
                ans.id = props.editObj.id;
                props.saveExistingAnswer(ans);
            } else
                props.addAnswer(ans);
            //console.log("Answer text: "+text);
        }
    }

    function handleScore(event) {
        setScore(event.target.value); // NOTE: Cannot do parseInt here otherwise the single minus sign cannot be written
    }

    return (
        <>
        {errorMsg? <Alert variant='danger'  dismissible onClose={()=>{setErrorMsg('')}} >{errorMsg}</Alert> : false}
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

            <Button type="submit">{props.editObj? 'Save edit':'Add'}</Button>
            <Button variant='secondary' onClick={()=>props.closeForm()}>Cancel</Button>

        </Form>
        </>
    )
}

export { AnswerForm };