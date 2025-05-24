import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import API from '../API';

function TotpForm(props) {
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('') ;

  const navigate = useNavigate();

  const doTotpVerify = () => {
    API.totpVerify(totpCode)
      .then( () => {
        setErrorMessage('');
        props.totpSuccessful();
        navigate('/');
      })
      .catch( () => {
        // NB: Generic error message
        setErrorMessage('Wrong code, please try again');
      })
  }

  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');

      // Some validation
      let valid = true;
      if (totpCode === '' || totpCode.length !== 6)
          valid = false;
      
      if (valid) {
        doTotpVerify(totpCode);
      } else {
        setErrorMessage('Invalid content in form: either empty or not 6-char long');
      }
  };
  
  return (
      <Container>
          <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                  <h2>Second Factor Authentication</h2>
                  <h5>Please enter the code that you read on your device</h5>
                  <Form onSubmit={handleSubmit}>
                      {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                      <Form.Group controlId='totpCode'>
                          <Form.Label>Code</Form.Label>
                          <Form.Control type='text' value={totpCode} onChange={ev => setTotpCode(ev.target.value)} />
                      </Form.Group>
                      <Button className='my-2' type='submit'>Validate</Button>
                      <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
                  </Form>
              </Col>
              <Col xs={3}></Col>
          </Row>
      </Container>
    )
   
}

function LoginForm(props) {
  const [username, setUsername] = useState('harry@test.com');
  const [password, setPassword] = useState('pwd');
  const [errorMessage, setErrorMessage] = useState('') ;

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        setErrorMessage('');
        props.loginSuccessful(user);
        navigate('/');
      })
      .catch(err => {
        // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
        setErrorMessage('Wrong username or password');
      })
  }
  
  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };

      // SOME VALIDATION, ADD MORE if needed (e.g., check if it is an email if an email is required, etc.)
      let valid = true;
      if(username === '' || password === '')
          valid = false;
      
      if(valid)
      {
        doLogIn(credentials);
      } else {
        // TODO: show a better explanation depending on the error.
        setErrorMessage('Invalid content in form.')
      }
  };

  return (
      <Container>
          <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                  <h2>Login</h2>
                  <Form onSubmit={handleSubmit}>
                      {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                      <Form.Group controlId='username'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                      </Form.Group>
                      <Form.Group controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button className='my-2' type='submit'>Login</Button>
                      <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
                  </Form>
              </Col>
              <Col xs={3}></Col>
          </Row>
      </Container>
    )
}

export { LoginForm, TotpForm };
