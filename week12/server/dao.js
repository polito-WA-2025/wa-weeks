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
    const sql = 'SELECT questions.id,text,name AS author,users.id AS authorId,date FROM questions JOIN users ON questions.authorId = users.id';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const questions = rows.map((e) => ({ id: e.id, text: e.text, author: e.author, authorId: e.authorId, date: dayjs(e.date) }));
      resolve(questions);
    });
  });
};

// get the question identified by {id}
exports.getQuestion = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT questions.id,text,name AS author,users.id AS authorId,date FROM questions JOIN users ON questions.authorId = users.id WHERE questions.id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Question not found.'});
      } else {
        const question = { id: row.id, text: row.text, author: row.author, authorId: row.authorId, date: dayjs(row.date) };
        resolve(question);
      }
    });
  });
};

// get all answers
exports.listAnswers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answers.id AS id, text, name AS respondent, users.id AS respondentId, score, date, questionId FROM answers JOIN users ON answers.respondentId = users.id';

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
          respondentId: e.respondentId,
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
    const sql = 'SELECT answers.id AS id, text, name AS respondent, users.id AS respondentId, score, date, questionId FROM answers JOIN users ON answers.respondentId = users.id WHERE questionId = ?';

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
          respondentId: e.respondentId,
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
    const sql = 'SELECT answers.id AS id, text, name AS respondent, users.id AS respondentId, score, date, questionId FROM answers JOIN users ON answers.respondentId = users.id WHERE answers.id=?';
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
            respondentId: row.respondentId,
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
    const sql = 'INSERT INTO answers(text, score, date, questionId, respondentId) VALUES(?, ?, DATE(?), ?, ?)';
    db.run(sql, [answer.text, answer.score, answer.date, answer.questionId, answer.respondentId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(exports.getAnswer(this.lastID));
    });
  });
};

// update an existing answer
exports.updateAnswer = (answer, userId) => {
  //console.log('updateAnswer: '+JSON.stringify(answer));
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE answers SET text=?, score=?, date=DATE(?) WHERE id = ? AND respondentId = ?';  
    // It is MANDATORY to check that the answer belongs to the userId
    db.run(sql, [answer.text, answer.score, answer.date, answer.id, userId], function (err) {
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
exports.deleteAnswer = (id, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM answers WHERE id = ? AND respondentId = ?';  // Double-check that the answer belongs to the userId
    // It is MANDATORY to check that the answer belongs to the userId
    db.run(sql, [id, userId], function (err) {
      if (err) {
        reject(err);
        return;
      } else
        resolve(this.changes);  // return the number of affected rows
    });
  });
}
