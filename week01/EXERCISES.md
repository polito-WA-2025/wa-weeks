# Exercise 1: Better Scores
_Goal: basic handling of JavaScript arrays_

Develop a small JavaScript program to manage a set of scores given to something, e.g., your answers in a question-and-answer website such as StackOverflow. Scores are integer numbers, and they may be negative. You should:
 
- Define an array with all the scores you received. For the moment embed the scores directly in the source code, as an array.
- Duplicate the array, then in the new array:
  - Eliminate all negative scores (call `NN` the number of negative scores that are deleted).
  - Eliminate the two lowest-ranking scores.
  - Add `NN+2` new scores, at the end of the array, with a value equal to the (rounded) average of the existing scores.
- Print both arrays, comparing the scores before and after the modification.

# Exercise 2: My Users' List
_Goal: basic handling of JavaScript strings_

Develop a small JS program to manage a list of people names.

- Define the names as a comma-separated string containing the names, for instance: "Luigi De Russis, Luca Mannella, Fulvio Corno, Juan Pablo Saenz Moreno, Enrico Masala, Antonio Servetti".
- Parse the string and create an array containing one name per array position.
 - Beware: no extra spaces should be present.
- Create a second array by computing the acronyms of the people as the initial letters of the name. Acronyms should be in all-capital letters.
 - For example, Luigi De Russis -> LDR.
- Print the resulting list of acronyms and the full names.
 - Extra: in alphabetical order of acronym.

# Exercise 3: Q&A
_Goal: managing a simple data structure as an array of objects_.

Using JavaScript objects manage objects that contain information about a question and their answers.

Each answer should contain:

- Response (text)
- Respondent name
- Score (integer number, positive or negative)
- Date

Define a constructor function `Answer` to create one or more answers.

A question, instead, is made of:

- Question (text)
- Questioner name
- Date
- List of answers

Define a constructor function `Question` to represent a question. Implement the following methods to manipulate its answers: 

- `add(answer)` // pass a fully-constructed `Answer` object
- `findAll(name)` // returns all the Answers of a given respondent
- `afterDate(date)` // returns an array of Answers after the given date
- `listByDate()` // returns an array of Answers, sorted by increasing date
- `listByScore()` // same as before, by decreasing score

Create an instance of `Question` with at least four `Answer`s in it and test the previous methods.
