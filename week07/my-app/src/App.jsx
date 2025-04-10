
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
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
		</Container>
	);
}


export default App
