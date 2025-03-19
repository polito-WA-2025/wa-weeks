# `qa-server`

The `qa-server` presents some APIs to perform some CRUD (Create, Read, Update, Delete) operations on the answers.

### Summary of the endpoints

`GET /api/questions`  
`GET /api/questions/<id>/answers`  
`POST /api/answers`  
...  

### List Questions

* `GET /api/questions`
* Description: Get all the questions.
* Request body: _None_
* Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
* Response body: An array of objects, each describing a question.

```
[{
    "id": 1,
    "text": "Best way of enumerating an array in JS?",
    "author": "Enrico",
    "date": "2024-02-28",
},
...]
```

### Get all Answers to a given Question (By Id)

* `GET /api/questions/<id>/answers`
* Description: Get all the answers associated to a given question identified by the id `<id>`.
* Request body: _None_
* Response: `200 OK` (success), `404 Not Found` (wrong id), or `500 Internal Server Error` (generic error).
* Response body: An array of objects, each describing an answer.

```
[{
    "id": 1,
    "text": "for of",
    "respondent": "Alice",
    "score": 3,
    "date": "2023-03-07",
    "questionId": 1
},
{
    "id": 5,
    "text": "for i=0,i<N,i++",
    "respondent": "Harry",
    "score": 1,
    "date": "2023-03-04",
    "questionId": 1
},
...]
```


### Add a New Answer

* `POST /api/answers`
* Description: Add a new answer to the list of the answers of a given question.
* Request body: An object representing an answer (Content-Type: `application/json`).

```
{
    "text": "for of",
    "respondent": "Alice",
    "score": 3,
    "date": "2023-03-07",
    "questionId": 1
}
```

* Response: `201 Created` (success) or `503 Service Unavailable` (generic error)
* Response body: the `id` of the newly created element

## Examples of other possible APIs

### Vote an Answer

### Delete an Answer

