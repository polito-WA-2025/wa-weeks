'use strict';

const express = require('express');
const morgan = require('morgan');
const {check, validationResult} = require('express-validator');

const dao = require('./dao'); // module for accessing the DB.  NB: use ./ syntax for files in the same dir

const app = express();

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());  // To automatically decode incoming json

app.get('/', (req, res) => {
    res.send('Hello!');
});

/*** APIs ***/

// GET /api/questions
app.get('/api/questions', (req, res) => {
    dao.listQuestions()
      .then(questions => res.json(questions))
      .catch(() => res.status(500).end());
  });


// GET /api/questions/<id>/answers
app.get('/api/questions/:id/answers', async (req, res) => {
  try {
    const result = await dao.listAnswersByQuestion(req.params.id);
    //console.log("result: "+JSON.stringify(result));
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);  // NB: list of answers can also be an empty array
  } catch (err) {
    res.status(500).end();
  }
});

  
// POST /api/answers
app.post('/api/answers', async (req, res) => {
  const answer = {
    questionId: req.body.questionId,
    score: req.body.score,
    date: req.body.date,
    text: req.body.text,
    respondent: req.body.respondent,
  };

  try {
    const newId = await dao.createAnswer(answer);
    res.status(201).json(newId);  // could also be the whole object including the newId
  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of the answer` });
  }
}
);

// DELETE /api/answers/<id>
app.delete('/api/answers/:id', [
  check('id').isInt()
] , async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({errors: errors.array()});
  } else {
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
  } else {
    try {
      const numRowChanges = await dao.voteAnswer(req.params.id, req.body.vote);
      // number of changed rows is sent to client as an indicator of success
      res.json(numRowChanges);
    } catch (err) {
      res.status(503).json({ error: `Database error while voting answer ${req.params.id}.` });
    }
  }
});

app.listen(3001, ()=>{console.log('Server ready');})