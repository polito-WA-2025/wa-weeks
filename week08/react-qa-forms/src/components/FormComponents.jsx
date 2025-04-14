import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';


function AnswerForm(props) {

    const [text, setText ] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        console.log("Answer text: "+text);
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Label>Text</Form.Label>
            <Form.Control type="text" name="text" value={text} 
               onChange={(event) => setText(event.target.value)} />
            <Button type="submit">Save</Button>
        </Form>
    )
}

export { AnswerForm };