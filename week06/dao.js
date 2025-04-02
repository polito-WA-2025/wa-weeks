'use strict';
/* Data Access Object (DAO) module for accessing questions and answers */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('qa.db', (err) => {
  if(err) throw err;
});

// get all questions
exports.listQuestions = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM questions';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const questions = rows.map((e) => ({ id: e.id, text: e.text, author: e.author, date: dayjs(e.date) }));
      resolve(questions);
    });
  });
};

// get the question identified by {id}
exports.getQuestion = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM questions WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Question not found.'});
      } else {
        const question = { id: row.id, text: row.text, author: row.author, date: dayjs(row.date) };
        resolve(question);
      }
    });
  });
};

// get all answers
exports.listAnswers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM answers';

    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const answers = rows.map((e) => (
        {
          id: e.id,
          text: e.text,
          respondent: e.respondent,
          score: e.score,
          date: dayjs(e.date),
          questionId: e.questionId,
        }));

      resolve(answers);
    });
  });
};

// get all answers to a given question
exports.listAnswersByQuestion = (questionId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM answers WHERE questionId = ?';

    db.all(sql, [questionId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      //console.log('rows: '+JSON.stringify(rows));
      const answers = rows.map((e) => (
        {
          id: e.id,
          text: e.text,
          respondent: e.respondent,
          score: e.score,
          date: dayjs(e.date),
          questionId: e.questionId,
        }));

      //console.log('answers: '+JSON.stringify(answers));
      resolve(answers);
    });
  });
};

// get the answer identified by {id}
exports.getAnswer = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM answers WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Answer not found.'});
      } else {
        const answer = 
          {
            id: row.id,
            text: row.text,
            respondent: row.respondent,
            score: row.score,
            date: dayjs(row.date),
            questionId: row.questionId,
          };
        resolve(answer);
      }
    });
  });
};


// add a new answer, return the newly created object, re-read from DB
exports.createAnswer = (answer) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO answers(text, respondent, score, date, questionId) VALUES(?, ?, ?, DATE(?), ?)';
    db.run(sql, [answer.text, answer.respondent, answer.score, answer.date, answer.questionId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(exports.getAnswer(this.lastID));
    });
  });
};

// update an existing answer
exports.updateAnswer = (answer) => {
  //console.log('updateAnswer: '+JSON.stringify(answer));
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE answers SET text=?, respondent=?, score=?, date=DATE(?) WHERE id = ?';
    db.run(sql, [answer.text, answer.respondent, answer.score, answer.date, answer.id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};

// vote an existing answer
exports.voteAnswer = (answerId, vote) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE answers SET score= score + ?  WHERE id = ?';
    const delta = vote==='upvote' ? 1 : -1;
    db.run(sql, [delta, answerId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};


// delete an existing answer
exports.deleteAnswer = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM answers WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
        return;
      } else
        resolve(this.changes);  // return the number of affected rows
    });
  });
}
