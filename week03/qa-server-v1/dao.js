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

// add a new answer, return the newly created ID from DB
exports.createAnswer = (answer) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO answers(text, respondent, score, date, questionId) VALUES(?, ?, ?, DATE(?), ?)';
    db.run(sql, [answer.text, answer.respondent, answer.score, answer.date, answer.questionId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};
