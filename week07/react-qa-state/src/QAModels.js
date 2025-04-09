'use strict';

import dayjs from "dayjs";

function Answer(id, text, respondent, score, date, questionId) {
    this.id = id;
    this.text = text;
    this.respondent = respondent;
    this.score = score;
    this.date = dayjs(date);
    this.questionId = questionId;

    this.str = function() { return `${this.id}: ${this.text} (by ${this.respondent}) on ${this.date.format('YYYY-MM-DD')}, score: ${this.score}, questionId: ${this.questionId}`}
}

function Question(id, text, questioner, date) {
    this.id = id;
    this.text = text;
    this.questioner = questioner;
    this.date = date;
    this.answers = [];

    this.addAnswer = (ans) => {
        this.answers.push(ans);
    }

    this.getAnswers = () => {
        return [...this.answers];
      }

    this.init = () => {
        this.answers.push(
            new Answer(1, 'for of', 'Alice', 3, dayjs('2024-03-07')),
            new Answer(2, 'for i=0,i<N,i++', 'Harry', 1, dayjs('2024-03-04')),
            new Answer(3, 'for in', 'Harry', -2, dayjs('2024-03-02')),
            new Answer(4, 'i=0 while(i<N)', 'Carol', -1, dayjs('2024-03-01'))
        );
    }

    this.str = function() { return `${this.text} asked by ${this.questioner} on ${this.date.format("YYYY-MM-DD")}`};
}

export { Question, Answer };