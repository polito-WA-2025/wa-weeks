'use strict';
/*
 * [2023/2024]
 * Web Applications
 */

import { getAllAnswers } from './API.js';

function vote(id) {
    // Modify the score corresponding to the id
    answerList.forEach(e => { if (e.id==id) e.score+=1 } );
    //alternative:
    //answerList = answerList.map(e => e.id==id? Object.assign({}, e, {score: e.score+1}) : e );
 
    // Delete the full list
    clearAnswers();

    // Recreate the full list starting from the data structure
    createAnswerList(answerList);
}

function clearAnswers() {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = "";  // Be careful using innerHTML for XSS, however with constant strings this is safe
}

function createAnswerNode(ans) {

    const newTd1 = document.createElement("td");
    const newContentDate = document.createTextNode(ans.date.format('YYYY-MM-DD'));
    newTd1.appendChild(newContentDate);

    const newTd2 = document.createElement("td");
    newTd2.innerHTML = ans.text;     // Be careful about XSS: value must be sanitized
    //const newContentText = document.createTextNode(ans.text);
    //newTd2.appendChild(newContentText);
    
    const newTd3 = document.createElement("td");
    const newContentRespondent = document.createTextNode(ans.respondent);
    newTd3.appendChild(newContentRespondent);
    
    const newTd4 = document.createElement("td");
    const newContentScore = document.createTextNode(ans.score);
    newTd4.appendChild(newContentScore);

    const newTd5 = document.createElement("td");
    const newButton = document.createElement("button");
    newButton.className = "btn btn-primary";
    newButton.id = ans.id;
    newButton.textContent = "Vote";
    newTd5.appendChild(newButton);

    newButton.addEventListener('click', event => {
        //console.log(event.target);
        vote(event.target.id);
    });

    const newTr = document.createElement("tr");
    newTr.appendChild(newTd1);
    newTr.appendChild(newTd2);
    newTr.appendChild(newTd3);
    newTr.appendChild(newTd4);
    newTr.appendChild(newTd5);

    return newTr;

}

function createAnswerList(answerList) {
    //const tableBody = document.querySelector('tbody');
    const tableBody = document.getElementById('answers');
    for (let ans of answerList) {
        const newRow = createAnswerNode(ans);
        tableBody.appendChild(newRow);
    }
    
}

// --- Main --- //

// Create data structure
let answerList = await getAllAnswers(1);
//let answerList = ANSWERS.map(e => new Answer(...e));

// Populate the list
createAnswerList(answerList);

