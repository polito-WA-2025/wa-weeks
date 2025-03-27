'use strict';
/*
 * [2024/2025]
 * Web Applications
 */

const ANSWERS = [
    // id, text, respondent, score, date, questionId
    [1,'for of','Alice',3,'2024-03-06',1],
    [2,'for i=0,i<N,i++','Harry',1,'2024-03-04',1],
    [3,'for in','Harry',-2,'2024-03-02',1],
    [4,'i=0 while(i<N)','Carol',-1,'2024-03-01',1]
];

function Answer(id, text, respondent, score, date, questionId) {
    this.id = id;
    this.text = text;
    this.respondent = respondent;
    this.score = score;
    this.date = dayjs(date);
    this.questionId = questionId;

    this.str = function() { return `${this.id}: ${this.text} (by ${this.respondent}) on ${this.date.format('YYYY-MM-DD')}, score: ${this.score}, questionId: ${this.questionId}`}
}

function vote(id) {

}


function createAnswerNode(ans) {

    const newTd1 = document.createElement("td");
    const newContentDate = document.createTextNode(ans.date.format('YYYY-MM-DD'));
    newTd1.appendChild(newContentDate);

    const newTd2 = document.createElement("td");
    // newTd2.innerText = ans.text;
    const newContentText = document.createTextNode(ans.text);
    newTd2.appendChild(newContentText);
    
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

    newButton.addEventListener('click', event =>  {
        console.log('button pressed, id '+ans.id);
        //vote(event.target.id);
        newTd4.innerText = parseInt(newTd4.innerText)+1;
    })


    const newTr = document.createElement("tr");
    newTr.appendChild(newTd1);
    newTr.appendChild(newTd2);
    newTr.appendChild(newTd3);
    newTr.appendChild(newTd4);
    newTr.appendChild(newTd5);

    return newTr;

}

// --- Main --- //

// Create data structure
let answerList = ANSWERS.map(e => new Answer(...e));

answerList.forEach(e => console.log(e.str()));

const tableBody = document.getElementById('answers');

for (let ans of answerList) {
    const newRow = createAnswerNode(ans);
    tableBody.appendChild(newRow);
}

// Populate the list in the HTML ...

/*
let text = 'for of';
let respondent = answerList[0].respondent;

const newTr = document.createElement('tr');
const newTd1 = document.createElement('td');
newTd1.innerText = text;
const newTd2 = document.createElement('td');
newTd2.innerText = respondent;

const tableBody = document.getElementById('answers');
tableBody.appendChild(newTr);
newTr.appendChild(newTd1);
newTr.appendChild(newTd2);
*/


