
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row } from 'react-bootstrap';
import MyButton from './Button.jsx';
function App() {
	return (
		<Container>
		<Row>
		<Col>
		Press here: <MyButton lang='it' />
		</Col>
		</Row>
		</Container>
	);
}
