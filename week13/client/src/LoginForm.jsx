import { useState } from "react";
import { Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import validator from "validator";

/**
 * The TOTP authentication page displayed on "/login"
 * 
 * @param props.loginTotpCbk callback to perform the actual TOTP authentication
 * @param props.errorAlertActive true when the error alert on the top is active and showing, false otherwise
 */
function TotpForm(props) {
  const [totpCode, setTotpCode] = useState('');

  const [codeError, setCodeError] = useState("");
  const [waiting, setWaiting] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();

    // Validate form
    const trimmedCode = totpCode.trim();
    const codeError = validator.isEmpty(trimmedCode) ? "Code must not be empty" : (
      trimmedCode.length != 6 ? "Code must be 6 characters" : ""
    );

    if (!codeError) {
      setWaiting(true);
      props.loginTotpCbk(totpCode, () => { setWaiting(false); setTotpCode("");} );
    } else {
      setCodeError(codeError);
    }
  };
  
  return (
    <Container fluid style={{"marginTop": props.errorAlertActive ? "2rem" : "6rem"}}>
    <Row className="justify-content-evenly">
    <Col md="3" style={{"paddingLeft": "3rem"}}>
      <Link to="/"><i className="bi bi-arrow-left"/>back</Link>
    </Col>
    <Col style={{"maxWidth": "50rem", "minWidth": "30rem"}}>
    <Card>
      <Card.Header as="h2">Second Factor Authentication</Card.Header>
      <Container style={{"marginTop": "0.5rem", "padding": "1rem"}}>
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col}>
              <Form.Label>Code from your device</Form.Label>
              <Form.Control isInvalid={!!codeError}
                            type="text"
                            placeholder="nnnnnn"
                            value={totpCode}
                            autoFocus
                            onChange={event => {setTotpCode(event.target.value); setCodeError("");}}/>
              <Form.Control.Feedback type="invalid">
                {codeError}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Button type="submit" disabled={waiting}>
            {
              waiting ? 
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                  {" "}
                </>
              : false
            }
            Validate 
          </Button>
          <Link to='/'><Button className='mx-2' variant='secondary'>Skip</Button></Link>
        </Form>
      </Container>
    </Card>
    </Col>
    <Col md="3"/>
    </Row>
    </Container>
    )
   
}

/**
 * The login page displayed on "/login"
 * 
 * @param props.loginCbk callback to perform the actual login
 * @param props.errorAlertActive true when the error alert on the top is active and showing, false otherwise
 */
function LoginForm(props) {
  const [email, setEmail] = useState("s123456@studenti.polito.it");
  const [password, setPassword] = useState("password");

  const [emailError, setEmailError] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [waiting, setWaiting] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();

    // Validate form
    const trimmedEmail = email.trim();
    const emailError = validator.isEmpty(trimmedEmail) ? "Email must not be empty" : (
      !validator.isEmail(trimmedEmail) ? "Not a valid email" : ""
    );
    const passwordValid = !validator.isEmpty(password);

    if (!emailError && passwordValid) {
      setWaiting(true);
      props.loginCbk(email, password, () => setWaiting(false));
    } else {
      setEmailError(emailError);
      setPasswordValid(passwordValid);
    }
  };

  return (
    <Container fluid style={{"marginTop": props.errorAlertActive ? "2rem" : "6rem"}}>
    <Row className="justify-content-evenly">
    <Col md="3" style={{"paddingLeft": "3rem"}}>
      <Link to="/"><i className="bi bi-arrow-left"/>back</Link>
    </Col>
    <Col style={{"maxWidth": "50rem", "minWidth": "30rem"}}>
    <Card>
      <Card.Header as="h2">Login</Card.Header>
      <Container style={{"marginTop": "0.5rem", "padding": "1rem"}}>
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col}>
              <Form.Label>Email</Form.Label>
              <Form.Control isInvalid={!!emailError}
                            type="email"
                            placeholder="mail@provider.com"
                            value={email}
                            autoFocus
                            onChange={event => {setEmail(event.target.value); setEmailError("");}}/>
              <Form.Control.Feedback type="invalid">
                {emailError}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col}>
              <Form.Label>Password</Form.Label>
              <Form.Control isInvalid={!passwordValid}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={event => {setPassword(event.target.value); setPasswordValid(true);}}/>
              <Form.Control.Feedback type="invalid">
                Password must not be empty
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Button type="submit" disabled={waiting}>
            {
              waiting ? 
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                  {" "}
                </>
              : false
            }
            Login
          </Button>
        </Form>
      </Container>
    </Card>
    </Col>
    <Col md="3"/>
    </Row>
    </Container>
  );
}

export { LoginForm, TotpForm };
