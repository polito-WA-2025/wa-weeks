'use strict';

/*** vscode rest-client plugin configuration ***/
// add this to vscode settings.json to show both request and response
// "rest-client.previewOption": "exchange"

/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');  // logging middleware
const { check, validationResult, oneOf } = require('express-validator'); // validation middleware
const cors = require('cors');

const filmDao = require('./dao-films'); // module for accessing the films table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

/*** Session management middleware ***/

const session = require('express-session');
const my_session_secret = "shhhhh... it's a secret! - change it for the exam!"
app.use(
  session({
    name: 'polito-WA-2025.sid', // custom cookie name
    secret: my_session_secret,
    resave: false,
    saveUninitialized: true, // forced to true to allow session creation on every request even if session is not modified
  })
);


/*** Provisional in memory user table ***/
/*
// WARNING: Just for debugging purpose, never use global variables at the exam or in production
const users = [
  { id: 1, name: 'John Doe', username: 'user', password: 'password' },
  { id: 2, name: 'Antonio Servetti', username: 'u1@p.it', password: 'pwd' },
];

function getUser(username, password) {
  const user = users.find(u => u.username === username && u.password === password)
  return user ? { id: user.id, username: user.username, name: user.name } : null; // copy only relevant properties (not the password)
}

function getUserById(user_id) {
  const user = users.find(u => u.id === user_id);
  return user ? { id: user.id, username: user.username, name: user.name } : null; // copy only relevant properties (not the password)
}
*/

/*** Passport authentication middleware ***/

const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

app.use(passport.initialize());    // initialize passport
app.use(passport.session());       // use passport session: alias for passport.authenticate('session')


/** Set up 'local' authentication strategy to search (in the DB) a user with a matching password.
 * Define verify fuction to be used by passport.authenticate('local') middleware.
 * The function will be called with the username and password provided by the user in the request (i.e., req.body.username, req.body.password).
 * If the user is found, the function will call the callback with null as first argument and the user object as second argument.
 * If the user is not found, the function will call the callback with null as first argument and false as second argument.
 * If there is an error, the function will call the callback with the error as first argument.
 **/
passport.use(
  new LocalStrategy(
    async function verify(username, password, callback) {
      // N.B. this "callback" function is the callback function defined in passport.authenticate('local', function callback (err, user, info) { })
      console.log(`LocalStrategy: username=${username}, password=${password}`);
      const user = await userDao.getUser(username, password)
      // const user = getUserByCredentials(username, password); // synchronous call to in memory provisiona getUser
      if (!user) {
        // continuation by means of the callback
        callback(null, false, { message: 'What the hell is going on? Credentials are not valid!' }); // user not found or invalid password
      } else { 
        // continuation by means of the callback
        callback(null, user);
      }
    }
  )
);

/** Serializing in the session the user object passed by the callback in LocalStrategy verify function.
 * Passport will call this to serialize the user to the session whenever you login a user with req.login(), or whenever a user is authenticated via passport.authenticate().
 * Serialization is done in the callback you invoke as callback(null, serializedUser). 
 * What this is going to do is set req.session.passport.user = serializedUser. 
 **/ 
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  const user_id = user.id; // we store only the id in the session, to save space
  console.log(`serializeUser: user=${JSON.stringify(user_id)}`);
  callback(null, user_id);
});

/**  Deserializing the user from the session information in req.session.passport.user.
 * If only the id is saved in the server session storage, then we may want to retrieve additional properties of the user (e.g., username, name) from the DB.
 * The new user object is then attached to the request object as req.user, so that it can be used in the subsequent middleware.
 * This function is called whenever a request is made with a valid session, and the user is authenticated.
 * If the user is not found, the callback is called with null as first argument and false as second argument.
 * If there is an error, the callback is called with the error as first argument.
*/
passport.deserializeUser(async function (user_id, callback) {  
  try {
    // const user = userDao.getUserById(user_id); // asynchronous call to getUserById
    const user = await userDao.getUserById(user_id); // asyncronous call to the DB
    console.log(`deserializeUser: user_id=${JSON.stringify(user_id)}, user=${JSON.stringify(user)}`);
    if(!user) { 
      callback(null, false, { message: 'User not found' })
    } else {
      // Successfully deserialized user, we can now call callback to attach it to the request object
      return callback(null, user); // this will be available in req.user
    }
  }
  catch (err) {
    // If there is an error, we log it and pass it to the next middleware
    console.error(`deserializeUser: error=${err}`);
    return callback(err); // pass the error to the next middleware
  }
});

/** Defining authentication verification middleware isLoggedIn **/
const isLoggedIn = (req, res, next) => {
  console.log(`isLoggedIn: req.isAuthenticated()=${req.isAuthenticated()} req.user=${JSON.stringify(req.user)}`);
  if (req.isAuthenticated() ) { // provided by passport, equivalent to if(req.user)
    next();
  } else {
    res.status(401).json({ error: 'Not authorized' });
  }
}

/*** Debugging middleware to print session and request data. ***/

let count = 0; // WARNING: Just for debugging purpose, never use global variables at the exam or in production
let print_data = (req, res, next) => {
  req.session.count = (req.session.count || 0) + 1; // Use session count or initialize to 1, then increment it
  console.log(`global count: ------------> ${++count}`);
  console.log(`req.session.count : ------> ${req.session.count}`);
  console.log(`req.session.id: ----------> ${req?.session?.id}`);
  console.log(`req.headers.cookie: ------> ${req.headers?.cookie}`);
  console.log(`req.session.passport: ----> ${JSON.stringify(req?.session?.passport)}`); // closure on req
  console.log(`req.user: ----------------> ${JSON.stringify(req?.user)}`); // closure on req
  console.log(`req.body.username --------> ${req.body?.username}`)
  console.log(`req.body.password --------> ${req.body?.password}`)
  /*
  // It is possible to log the session and user data also after the response is finished
  // This is useful to see the final state of the session and user data after all middlewares have been executed
  res.on('finish', () => {
    console.log(`> req.session.passport: ${JSON.stringify(req.session.passport)}`); // closure on req
    console.log(`> req.user: ${JSON.stringify(req.user)}`); // closure on req
  });
  */
  next();
}
app.use(print_data);


/*** Utility Functions ***/

// Make sure to set a reasonable value (not too small!) depending on the application constraints
// It is recommended (but NOT strictly required) to have a limit here or in the DB constraints
// to avoid malicious requests waste space in DB and network bandwidth.
const maxTitleLength = 160;

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** Films APIs (just one for example, see the others in the solution of the correponding lab) ***/

// ** Retrieve a film, given its “id”.
// GET /api/films/<id>
// Given a film id, this route returns the associated film from the library.
// The logged in user (req.user.id) must "own" the film, i.e., the id in the film row must be equal to the req.user.id.
// The request handler calls the filmDao function passing the logged in user id and the film id.
app.get('/api/films/:id', isLoggedIn,
  [check('id').isInt({ min: 1 })],    // check: is the id an integer, and is it a positive integer?
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors); // error message is sent back as a json with the error info
    }
    try {
      const result = await filmDao.getFilm(req.user.id, req.params.id);
      if (result.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      console.log(err);  // Logging errors is expecially useful while developing, to catch SQL errors etc.
      res.status(500).end();
    }
  }
);

// ** Dummy function
// GET /api/touch
// This is a simple test API to check if the server is running
app.get('/api/touch', isLoggedIn, (req, res) => {
  res.status(200).json({ message: "It's working!" });
});

/*** User APIs (just the login API) ***/

// POST /api/sessions 
// This route is used for performing login.

// ** BASIC LOGIN (no error handling, no validation, no custom messages)
// This is the simplest way to use passport.authenticate('local') middleware
// Adds console log message middleware
// Calls passport.authenticate('local') middleware
// If the authentication does not fail, it returns the user object as a json response
/*
app.post(
  '/api/sessions',
  (req, res, next) => { console.log(`POST /api/sessions: username=${req.body.username}, password=${req.body.password}`); next(); },
  passport.authenticate('local'),
  (req, res) => {
    res.json(req.user);
  }
);
*/

// ** ADVANCED LOGIN
// calls passport.authenticate('local') middleware
// defines a callback function to handle the result of the authentication
// console message and returned user object are handled in the callback function

app.post('/api/sessions',
  // custom middleware overrides the default behavior of passport.authenticate('local') 
  (req, res, next) => {
    // req.user not defined yet, it will be set by passport.authenticate('local')
    // just returns a middleware function, does nothing if not called
    const middleware = passport.authenticate('local', function callback (err, user, info) {
      // req, res, next are visible here because of closure
      if (err) {
        console.error(`Error during authentication: ${err}`);
        next(err); // pass the error to the next middleware
        return;    // interrupt the function execution
      }
      if (!user) {
        // display wrong login messages
        console.log(`Authentication failed: ${JSON.stringify(info)}`);
        res.status(401).json({ error: info });
        return ; // interrupt the function execution
      }
      // success, perform the login and establish a login session
      console.log(`Authentication successful. user: ${JSON.stringify(user)}, req.user: ${JSON.stringify(req.user)}`);
      // if you redefine the callback you are REQUIRED to call req.login(user, cb) to establish a login session
      req.login(user, (err) => {
        if (err) {
          console.error(`Error during login: ${err}`);
          next(err); // pass the error to the next middleware
          return;    // interrupt the function execution
        }
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStrategy Verify Fn
        console.log(`User logged in successfully: req.user: ${JSON.stringify(req.user)}`);
        res.json(req.user);  
        return; // interrupt the function execution
      });
      
    });
    
    middleware(req, res, next); // call the middleware
  }
);


// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
  req.logout(() => {
    res.status(200).end(); // end the session and remove the user from the session
  });
});

// Activating the server
const PORT = 3001;
// Activate the server
app.listen(PORT, (err) => {
  if (err)
    console.log(err);
  else
    console.log(`Server listening at http://localhost:${PORT}`);
}); 

/*** Example session logging output ***/
/*
DEBUG="express-session" nodemon index.js
Debugger listening on ws://127.0.0.1:61051/2fcb5033-90d9-4b56-873d-138f385c8f99
For help, see: https://nodejs.org/en/docs/inspector
Debugger attached.
[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`
Debugger listening on ws://127.0.0.1:61056/1bf710f9-d58d-4c8e-b413-000b621672af
For help, see: https://nodejs.org/en/docs/inspector
Debugger attached.
Server listening at http://localhost:3001
  express-session fetching wVNPnTok4tfAAgwKFlebAVfgG8jss09f +0ms
  express-session no session found +1ms
global count: ------------> 1
req.session.count : ------> 1
req.session.id: ----------> rg8CBEudMiortST8TuNPjKdYtGna7VQK
req.headers.cookie: ------> polito-WA-2025.sid=s%3AwVNPnTok4tfAAgwKFlebAVfgG8jss09f.NxSx6gENOOvB8gKsJHG%2FVWAEu4FkEhR46%2F3UJ1vsDtc
req.session.passport: ----> undefined
req.user: ----------------> undefined
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=false req.user=undefined
  express-session saving rg8CBEudMiortST8TuNPjKdYtGna7VQK +4ms
  express-session set-cookie polito-WA-2025.sid=s%3Arg8CBEudMiortST8TuNPjKdYtGna7VQK.PwWRNOWJ2v6WoE5bIcpVNt5vo2%2FMuxPXM0mBxMliKt0; Path=/; HttpOnly +1ms
  express-session split response +1ms
GET /api/touch 401 7.499 ms - 26
  express-session fetching rg8CBEudMiortST8TuNPjKdYtGna7VQK +3s
  express-session session found +0ms
global count: ------------> 2
req.session.count : ------> 2
req.session.id: ----------> rg8CBEudMiortST8TuNPjKdYtGna7VQK
req.headers.cookie: ------> polito-WA-2025.sid=s%3Arg8CBEudMiortST8TuNPjKdYtGna7VQK.PwWRNOWJ2v6WoE5bIcpVNt5vo2%2FMuxPXM0mBxMliKt0
req.session.passport: ----> undefined
req.user: ----------------> undefined
req.body.username --------> u1@p.it
req.body.password --------> 123
LocalStrategy: username=u1@p.it, password=123
Authentication failed: {"message":"What the hell is going on? Credentials are not valid!"}
  express-session saving rg8CBEudMiortST8TuNPjKdYtGna7VQK +36ms
  express-session split response +1ms
POST /api/sessions 401 45.347 ms - 77
  express-session fetching rg8CBEudMiortST8TuNPjKdYtGna7VQK +2s
  express-session session found +0ms
global count: ------------> 3
req.session.count : ------> 3
req.session.id: ----------> rg8CBEudMiortST8TuNPjKdYtGna7VQK
req.headers.cookie: ------> polito-WA-2025.sid=s%3Arg8CBEudMiortST8TuNPjKdYtGna7VQK.PwWRNOWJ2v6WoE5bIcpVNt5vo2%2FMuxPXM0mBxMliKt0
req.session.passport: ----> undefined
req.user: ----------------> undefined
req.body.username --------> u1@p.it
req.body.password --------> pwd
LocalStrategy: username=u1@p.it, password=pwd
Authentication successful. user: {"id":1,"username":"u1@p.it","name":"John"}, req.user: undefined
serializeUser: user=1
User logged in successfully: req.user: {"id":1,"username":"u1@p.it","name":"John"}
  express-session set-cookie polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18; Path=/; HttpOnly +34ms
  express-session split response +0ms
POST /api/sessions 200 35.259 ms - 43
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +2s
  express-session session found +1ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 4
req.session.count : ------> 1
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +1ms
  express-session split response +1ms
GET /api/touch 200 2.344 ms - 27
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +4s
  express-session session found +1ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 5
req.session.count : ------> 2
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +1ms
  express-session split response +0ms
GET /api/sessions/current 200 2.110 ms - 43
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +2s
  express-session session found +1ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 6
req.session.count : ------> 3
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
getFilm: user=1 id=2
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +4ms
  express-session split response +1ms
GET /api/films/2 200 5.499 ms - 76
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +1s
  express-session session found +0ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 7
req.session.count : ------> 4
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
getFilm: user=1 id=2
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +3ms
  express-session split response +0ms
GET /api/films/2 200 3.286 ms - 76
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +1s
  express-session session found +0ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 8
req.session.count : ------> 5
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
getFilm: user=1 id=3
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +3ms
  express-session split response +0ms
GET /api/films/3 200 3.277 ms - 72
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +778ms
  express-session session found +1ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 9
req.session.count : ------> 6
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
getFilm: user=1 id=1
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +2ms
  express-session split response +0ms
GET /api/films/1 200 2.941 ms - 80
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +783ms
  express-session session found +1ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 10
req.session.count : ------> 7
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
getFilm: user=1 id=4
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +2ms
  express-session split response +0ms
GET /api/films/4 404 2.690 ms - 27
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +1s
  express-session session found +1ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 11
req.session.count : ------> 8
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
getFilm: user=1 id=2
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +1ms
  express-session split response +0ms
GET /api/films/2 200 2.298 ms - 76
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +730ms
  express-session session found +0ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 12
req.session.count : ------> 9
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
getFilm: user=1 id=5
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +3ms
  express-session split response +0ms
GET /api/films/5 404 3.431 ms - 27
  express-session fetching AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +2s
  express-session session found +0ms
deserializeUser: user_id=1, user={"id":1,"username":"u1@p.it","name":"John"}
global count: ------------> 13
req.session.count : ------> 10
req.session.id: ----------> AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X
req.headers.cookie: ------> polito-WA-2025.sid=s%3AAqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X.szFJA%2FW0WsTMGbeqCvi7eCV0FdTQJT8IDQDFt9MpY18
req.session.passport: ----> {"user":1}
req.user: ----------------> {"id":1,"username":"u1@p.it","name":"John"}
req.body.username --------> undefined
req.body.password --------> undefined
isLoggedIn: req.isAuthenticated()=true req.user={"id":1,"username":"u1@p.it","name":"John"}
  express-session saving AqTpCCNev-Dkw_Xqy56hm5_QVNOyeo4X +1ms
  express-session set-cookie polito-WA-2025.sid=s%3A-iHuoHCso2skMNWNORtTxjaL4nmdWnSh.HvSU1k5lsrMHjU6ID%2FO3GCrq0ShznzGonC9W9D815x0; Path=/; HttpOnly +1ms
  express-session split response +0ms
DELETE /api/sessions/current 200 2.275 ms - 2
*/