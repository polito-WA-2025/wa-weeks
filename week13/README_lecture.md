# Exam #1: "Study Plan"
## Student: s999999 MASALA ENRICO 

## React Client Application Routes

- Route `/`: home, list of courses, anybody can access it
- Route `/login`: login form (including TOTP form needed)
- Route `/studyplan`: list of courses with the study plan

## API Server

- GET `/api/courses`
  - returns the list of all courses, with the details (constraints, enrolled students, max)
  - response body: [{"code":"02LSEOV", "name":"Web Applications", "CFU":8,
      "preparatory": null, "incompat": ["02GOLOV", ...], "maxStudents": null }, ...]
- POST `/api/session`
  - authenticates the user, return user information (studyplan?)
- GET `/api/studyplan`  (Authenticated API)
  - returns the studyplan of the authenticated user
  - response body: {"courses": ["02LSEOV", "02ABCOV", ...], "fullTime": false}
- POST `/api/studyplan`  (Authenticated API)
  - create or save(overwrite) the studyplan
  - request body: {"courses": ["02LSEOV", "02ABCOV", ...], "fullTime": false}
- DELETE `/api/studyplan`  (Authenticated API, requires TOTP)
  - deletes the studyplan

- GET `/api/session/current`
  - returns info about authenticated user (id), (+studyplan?)
- DELETE `/api/session/current`
- POST `/api/totp-login`

## Database Tables

- Table `users` - (id), name, email, hash, salt, fulltime, secret
- Table `studyplan` - (course_id, user_id)
- Table `courses` - (course_id), name, cfu, maxstudents, preparatory
- Table `incompats` - (course_id, incompat_course_id)

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.png)

## Users Credentials

- username, password (plus any other requested info which depends on the text)
- username, password (plus any other requested info which depends on the text)

