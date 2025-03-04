"use strict";
const dayjs = require('dayjs');

// # Exercise 3: Q&A

/*
Each answer should contain:
  Response (text)
  Respondent name
  Score (integer number, positive or negative)
  Date
*/

function Answer(text, respondent, score, date) {
    // calling the constructor with "new"
    // a new object is created, it is named "this"
    this.text = text;
    this.respondent = respondent;
    this.score = score;
    this.date = dayjs(date);
}

/*
A question, instead, is made of:
  Question (text)
  Questioner name
  Date
  List of answers
*/

function Question(text, questioner, date) {
    this.text = text;
    this.questioner = questioner;
    this.date = dayjs(date);
    this.list = []; // array for listing the answers

    this.add = (ans) => this.list.push(ans);

    // this.findAll = () => this.list; // returns a reference to the SAME list
    // this.findAll = () => [...this.list]; // returns a new array [a1, a2, ...]
    // this.findAll = () => [this.list]; // returns a reference to the SAME list, inside an array
 
    /*
    # Example of filtering with your own callback

    function myfilter(vett, callback) {
        const ret = [];
        for (const a of vett) {
            // a the answer object
            // check: the respondent is equal to <name>
            if ( callback(a) ) ret.push(a) // add to a list
            // nothing otherwise
        }
        return ret;
    }

    this.findAll = (name) => myfilter( this.list,  (a) => a.respondent === name  )
    */

    // filtering with Array filter method and callback
    this.findAll = (name) => this.list.filter( (a) => a.respondent === name ) 


    this.afterDate = (date) => this.list.filter( (a) => a.date.isAfter(date) )
    this.listByDate = () => [...this.list].sort( (a,b) => a.date.diff(b.date)  ) // make a copy and sort

    
    this.listByScore = () => {
        const newList = [...this.list];
        return newList.sort( (a,b) => b.score - a.score );
    }
}

const q1 = new Question("How are you today?", 'enrico', "2025-03-02");

const answers_text = [
    ["hello world", 'antonio', '0', "2025-03-03"], // a1
    ["hello world 2", 'enrico', '0', "2025-03-03"],  // a2
    ["fine", 'antonio', '1', "2025-03-02"]  // a3
]

// const answers_obj = [];
for (let i = 0; i < answers_text.length; i++) {
    const ans = answers_text[i];
    const a = new Answer(ans[0], ans[1], ans[2], ans[3]);
    q1.add(a);
}

// const a1 = new Answer("hello world", 'antonio', '0', "2025-03-03");
// const a2 = new Answer("hello world 2", 'antonio 2', '0', "2025-03-03");


// console.log('a1', a1)
// q1.add(a1);

console.log('q1', q1)

// find all answers to q1 with respondent equal to 'antonio'
console.log('q1 findAll', q1.findAll('antonio'))

// find all answers to q1 that have respondent equal to 'antonio'
// transform the array of Answers into an array of strings, i.e., the answer response text
console.log('q1 answer text',
    q1.findAll('antonio').map( (a) => 'Answer: text ' + a.text )
)

// find all answers to q1 that have a date after yesterday
console.log(
    q1.afterDate(dayjs().subtract(1,'day'))
)

console.log('listByDate',
    q1.listByDate()
)

console.log('listByScore',
    q1.listByScore()
)