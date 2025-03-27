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



// --- Main --- //

// Create data structure
let answerList = ANSWERS.map(e => new Answer(...e));

answerList.forEach(e => console.log(e.str()));

// Populate the list in the HTML ...
// ...

