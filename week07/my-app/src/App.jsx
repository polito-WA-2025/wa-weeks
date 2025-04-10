
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Button, Col, Container, Row, Form } from 'react-bootstrap';
import MyButton from './Button.jsx';

function ShortText(props) {
	const [hidden, setHidden] = useState(true);

	const toggleExpansion = () => {
		setHidden( e => !e ) ;
		}

	return (
		<span>
			{hidden ?
				`${props.text.substr(0, props.maxLength)}...`
				: props.text}
				<a onClick={toggleExpansion}>{hidden ? 'more' : 'less' }</a>
		</span>
	);
}

function SimpleButton (props) {
	return (
		<Button variant={props.selected?'primary':'secondary'}
		   onClick={() => props.choose(props.index)} >{props.name}</Button>
	)
}

function ButtonGroup (props) {
	const [selected, setSelected] = useState(3);

	const chooseButton = (index) => setSelected(index);
	return (
		<Form>
		{
			props.names.map((e,idx) => <SimpleButton
			  name={e} index={idx} key={idx}
			  selected={idx===selected} choose={chooseButton}></SimpleButton>)
		}
		</Form>
	)
}

function App() {
	return (
		<Container fluid>
		<Row>
		<Col>
		Press here: <MyButton lang='it' />
		</Col>
		</Row>
		<Row>
		<Col>
		<ShortText text="My really nice long text" maxLength={5} />
		</Col>
		</Row>
		<Row>
		<Col>
		<ButtonGroup names={['Chess', 'Poker', 'Black Jack', 'Go']} />
		</Col>
		</Row>
		</Container>
	);
}


export default App
