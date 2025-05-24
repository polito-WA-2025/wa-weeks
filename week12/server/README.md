# `qa-server`

The `qa-server` presents some APIs to perform CRUD (Create, Read, Update, Delete) operations on the answers.

The database has some users:
* username: enrico@test.com, password: "pwd"
* username:  luigi@test.com, password: "pwd"
* username:  alice@test.com, password: "pwd"
* username:  harry@test.com, password: "pwd"
* username:  carol@test.com, password: "pwd"


### Summary of the endpoints

`GET /api/questions`  
`GET /api/questions/<id>`  
`GET /api/questions/<id>/answers`  
`GET /api/answers/<id>`  
`POST /api/answers`  
`PUT /api/answers/<id>`  
`POST /api/answers/<id>/vote`  
`DELETE /api/answers/<id>`  


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
    "authorId": 1,

    "date": "2024-02-28",
},
...]
```

### Get a Question (by Id)

* `GET /api/questions/<id>`
* Description: Get the question identified by the id `<id>`.
* Request body: _None_
* Response: `200 OK` (success), `404 Not Found` (wrong id), or `500 Internal Server Error` (generic error).
* Response body: An object, describing a single question.

```
{
    "id": 1,
    "text": "Best way of enumerating an array in JS?",
    "author": "Enrico",
    "authorId": 1,
    "date": "2023-02-28",
}
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
    "respondentId": 3,
    "score": 3,
    "date": "2023-03-07",
    "questionId": 1
},
{
    "id": 5,
    "text": "for i=0,i<N,i++",
    "respondent": "Harry",
    "respondentId": 4,
    "score": 1,
    "date": "2023-03-04",
    "questionId": 1
},
...]
```


### Get an Answer (By Id)

* `GET /api/answers/<id>`
* Description: Get the answer identified by the id `<id>`.
* Request body: _None_
* Response: `200 OK` (success), `404 Not Found` (wrong id), or `500 Internal Server Error` (generic error).
* Response body: An object, describing a single answer.

```
{
    "id": 1,
    "text": "for of",
    "respondent": "Alice",
    "respondentId": 3,
    "score": 3,
    "date": "2023-03-07",
    "questionId": 1
}
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

* Response: `201 Created` (success) or `503 Service Unavailable` (generic error, e.g., when trying to insert an already existent answer by the same user). If the request body is not valid, `422 Unprocessable Entity` (validation error).
* Response body: An object representing the inserted answer, notably with the newly assigned id by the database (Content-Type: `application/json`).

```
{
    "id": 15,
    "text": "for of",
    "respondent": "Alice",
    "respondentId": 3,
    "score": 3,
    "date": "2023-03-07",
    "questionId": 1
}
```


### Update an Answer

* `PUT /api/answers/<id>`
* Description: Update entirely an existing answer, identified by its id.
* Request body: An object representing the entire answer (Content-Type: `application/json`).

```
{
    "id": 1,
    "text": "for of",
    "respondent": "Alice",
    "score": 3,
    "date": "2023-03-07",
    "questionId": 1
}
```

* Response: `200 OK` (success) or `503 Service Unavailable` (generic error). If the request body is not valid, `422 Unprocessable Entity` (validation error).
* Response body: _None_


### Vote an Answer

* `POST /api/answers/<id>/vote`
* Description: Upvote or downvote an existing answer (i.e., increase or decrease its score by 1), the answer is identified by its id. Vote can be either "upvote" or "downvote".
* Request body: An object representing the action, either upvote or downvote (Content-Type: `application/json`).  

```
{ "vote": "upvote" }
```

* Response: `200 OK` (success) or `503 Service Unavailable` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error).
* Response body: _None_


### Delete an Answer

* `DELETE /api/answers/<id>`
* Description: Delete an existing answer, identified by its id.
* Request body: _None_
* Response: `200 OK` (success) or `503 Service Unavailable` (generic error).
* Response body: _None_


### Create a new session (login)

* POST `/api/sessions`
* Description: Create a new session starting from given credentials.
* Request body: An object with username and password

```
{
  "username": "harry@test.com",
  "password": "pwd"
}
```

* Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
* Response body: _None_


### Get the current session if existing

* GET `/api/sessions/current`
* Description: Verify if the given session is still valid and return the info about the logged-in user. A cookie with a VALID SESSION ID must be provided to get the info of the user authenticated in the current session.
* Request body: _None_ 
* Response: `201 Created` (success) or `401 Unauthorized` (error).
* Response body: An object with user information

```
{
  "username": "harry@test.com",
  "id": 4,
  "name": "Harry"
}
```

### Destroy the current session (logout)

* DELETE `/api/sessions/current`
* Description: Delete the current session. A cookie with a VALID SESSION ID must be provided.
* Request body: _None_
* Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
* Response body: _None_
