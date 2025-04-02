'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const validator = require('validator');

const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');


const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const dao = require('./dao'); // module for accessing the DB.  NB: use ./ syntax for files in the same dir

// init express
const app = express();
const port = 3001;

/*
app.use(expressCspHeader({
  directives: {
      'default-src': [SELF],
      // Add INLINE in script-src to test XSS onerror in <img>
      'script-src': [SELF, 'unpkg.com', 'cdn.jsdelivr.net'],
      'style-src': [SELF, 'cdn.jsdelivr.net'],
      'font-src': [SELF, 'cdn.jsdelivr.net'],
      'img-src': [SELF]
  }
}));
*/


// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

app.use('/static', express.static('./public'));

/*** APIs ***/

// GET /api/questions
app.get('/api/questions', (req, res) => {
  dao.listQuestions()
    .then(questions => res.json(questions))
    .catch(() => res.status(500).end());
});

// GET /api/questions/<id>
app.get('/api/questions/:id', async (req, res) => {
  try {
    const result = await dao.getQuestion(req.params.id);
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/questions/<id>/answers
app.get('/api/questions/:id/answers', async (req, res) => {
  try {
    const resultQuestion = await dao.getQuestion(req.params.id);
    //console.log('Question: ' + JSON.stringify(resultQuestion));
    if (resultQuestion.error)
      res.status(404).json(resultQuestion);   // questionId does not exist
    else {
      const result = await dao.listAnswersByQuestion(req.params.id);
      //console.log("result: "+JSON.stringify(result));
      //console.log("length: "+result.length);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);  // NB: list of answers can also be an empty array
    }
  } catch(err) {
    console.log(err);
    res.status(500).end();
  }
});


// GET /api/answers
app.get('/api/answers', async (req, res) => {
  try {
    const answers = await dao.listAnswers();
    res.json(answers);
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/answers/<id>
app.get('/api/answers/:id', async (req, res) => {
  try {
    const result = await dao.getAnswer(req.params.id);
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});


// POST /api/answers
app.post('/api/answers', [
  check('score').isInt(),
  check('respondent').isLength({min: 1}),   // as an example
  check('date').isDate({format: 'YYYY-MM-DD', strictMode: true})
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const questionId = req.body.questionId;
  const resultQuestion = await dao.getQuestion(questionId);  // db consistency: make sure questionId already exists
  if (resultQuestion.error)
    res.status(404).json(resultQuestion);   // questionId does not exist, please insert the question before the answer
  else {
    const answer = {
      questionId: questionId,
      score: req.body.score,
      date: req.body.date,
      text: req.body.text,
      respondent: req.body.respondent,
    };

    try {
      const newAnswer = await dao.createAnswer(answer);
      res.status(201).json(newAnswer);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of answer ${answer.text} by ${answer.respondent}.` });
    }
  }
});


// PUT /api/answers/<id>
app.put('/api/answers/:id', [
  check('score').isInt(),
  check('respondent').isLength({min: 1}),   // as an example
  check('date').isDate({format: 'YYYY-MM-DD', strictMode: true}),
  check('id').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const answer = req.body;
  // you can also check here if the id passed in the URL matches with the id in req.body,
  // and decide which one must prevail, or return an error
  answer.id = req.params.id;

  try {
    const numRowChanges = await dao.updateAnswer(answer);
    res.json(numRowChanges);
    //res.status(200).end();
  } catch(err) {
    res.status(503).json({error: `Database error during the update of answer ${req.params.id}.`});
  }

});


// POST /api/answers/<id>/vote
// NOTE: this is a POST, not a PUT, since it is NOT idempotent
app.post('/api/answers/:id/vote', [
  check('id').isInt(),
  check('vote').isIn(['upvote','downvote'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  try {
    const numRowChanges = await dao.voteAnswer(req.params.id, req.body.vote);
    // number of changed rows is sent to client as an indicator of success
    res.json(numRowChanges);
  } catch (err) {
    res.status(503).json({ error: `Database error while voting answer ${req.params.id}.` });
  }

});


// DELETE /api/answers/<id>
app.delete('/api/answers/:id', [
  check('id').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  try {
    const numRowChanges = await dao.deleteAnswer(req.params.id);  
    // NOTE: if there is no element with the specified id, the delete operation is considered successful
    // since the final status of the server is that the element with that id does not exist.
    // This is also consistent with the fact that DELETE should be idempotent.
    // However, for easier debugging, we send the number of affected (changed) rows to the client.
    res.json(numRowChanges);
  } catch(err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the deletion of answer ${req.params.id}.`});
  }
});


/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`qa-server listening at http://localhost:${port}`);
});
