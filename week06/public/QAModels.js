'use strict';

function Answer(id, text, respondent, score, date, questionId) {
    this.id = id;
    this.text = text;
    this.respondent = respondent;
    this.score = score;
    this.date = dayjs(date);
    this.questionId = questionId;

    this.str = function() { return `${this.id}: ${this.text} (by ${this.respondent}) on ${this.date.format('YYYY-MM-DD')}, score: ${this.score}, questionId: ${this.questionId}`}
}

export { Answer }; 