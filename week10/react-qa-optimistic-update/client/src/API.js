/**
 * All the API calls
 */

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

async function getAllQuestions() {
  // call  /api/questions
  const response = await fetch(URL+'/questions');
  const questions = await response.json();
  if (response.ok) {
    return questions.map((e) => ({id: e.id, text:e.text, author:e.author, date: dayjs(e.date)}) )
  } else {
    throw questions;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getQuestion(id) {
    // call  /api/questions/<id>
    const response = await fetch(URL+`/questions/${id}`);
    const question = await response.json();
    if (response.ok) {
        const e = question;
        return {id: e.id, text: e.text, questioner: e.author, date: dayjs(e.date)};
    } else {
        throw question;  // expected to be a json object (coming from the server) with info about the error
    }
}

async function getAnswersByQuestionId(id) {
    // call  /api/questions/<id>/answers
    const response = await fetch(URL+`/questions/${id}/answers`);
    const answers = await response.json();
    if (response.ok) {
        return answers.map( (e) =>
            ({id: e.id, text: e.text, respondent: e.respondent,
                score: e.score, date: dayjs(e.date), questionId: e.questionId})
        );
    } else {
        throw answers;  // expected to be a json object (coming from the server) with info about the error
    }
}


  function voteAnswer(id, delta) {
    // call  POST /api/answers/<id>/vote
    return new Promise((resolve, reject) => {
      fetch(URL+`/answers/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: delta>0?'upvote':'downvote' }),
        //body: JSON.stringify({ vote: 'WRONG' }),
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }
  
  function addAnswer(answer) {
    // call  POST /api/answers
    return new Promise((resolve, reject) => {
      fetch(URL+`/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.assign({}, answer, {date: answer.date.format("YYYY-MM-DD")})),
      }).then((response) => {
        if (response.ok) {
          response.json()
            .then((id) => resolve(id))
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }
  
  function deleteAnswer(id) {
    // call  DELETE /api/answers/<id>
    return new Promise((resolve, reject) => {
      fetch(URL+`/answers/${id}`, {
        method: 'DELETE',
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }
  
  function updateAnswer(answer) {
    // call  PUT /api/answers/<id>
    return new Promise((resolve, reject) => {
      fetch(URL+`/answers/${answer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.assign({}, answer, {date: answer.date.format("YYYY-MM-DD")})),
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }
  
  
const API = {getAllQuestions, getQuestion, getAnswersByQuestionId, voteAnswer, addAnswer, deleteAnswer, updateAnswer};
export default API;
