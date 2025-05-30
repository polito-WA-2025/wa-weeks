# PRACTICE LESSON - AUTHENTICATION AND AUTHORIZATION with Passport.js

## List of APIs offered by the server

Provide a short description for API with the required parameters, follow the proposed structure.

* [HTTP Method] [URL, with any parameter]
* [One-line about what this API is doing]
* [Sample request, with body (if any)]
* [Sample response, with body (if any)]
* [Error responses, if any]

### Film Management

#### Get film by id

* `GET /api/films/:id`
* Description: Get the film corresponding to the id **if it belongs to the logged in user**
* Request body: _None_
* Response: `200 OK` (success)
* Response body: One object describing the required film:

``` JSON
[
  {
    "id": 2,
    "title": "21 Grams",
    "favorite": 1,
    "watchDate": "2023-03-17",
    "rating": 4,
  }
]
```

* Error responses:  `500 Internal Server Error` (generic error), `404 Not Found` (not present or unavailable)


### User Management

#### Login user

* `POST /api/sessions`
* Description: Create a new session for the user with the provided credentials.
* Request body: username and password in JSON format

``` JSON
{
    "username": "u1@p.it",
    "password": "pwd"
}
```

* Response: `200 OK` (success)
* Response body: the user object saved in thes session, with the following fields:

``` JSON
{
  "id": 1,
  "username": "u1@p.it",
  "name": "John"
}
```

* Error responses: `401 Unauthorized` (wrong username or password), `503 Service Unavailable` (database error)


#### Get current user

* `GET /api/sessions/current`
* Description: Get the user object corresponding to the current session.
* Request body: _None_
* Response: `200 OK` (success)
* Response body: the user object saved in the session

``` JSON
{
  "id": 1,
  "username": "u1@p.it",
  "name": "John"
}
```

* Error responses: `401 Unauthorized` (user not logged in), `503 Service Unavailable` (database error)


#### Logout user

* `DELETE /api/sessions/current`
* Description: Delete this user session, effectively logging out the user.
* Request body: _None_

* Response: `200 OK` (success)
* Response body: _None_ 

* Error responses: `401 Unauthorized` (user not logged in), `503 Service Unavailable` (database error)
