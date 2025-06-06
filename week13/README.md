# Exam #1: "Study Plan"
## Student: sXXXXXX PRIVACY REDACTED

## React Client Application Routes

- Route `/`: Home page, shows the list of all courses. Logged in users can also see and edit their study plan.
- Route `/login`: Login form, allows users to login. After a successful login, the user is redirected to the main route ("/").
- Route `*`: Page for nonexisting URLs (_Not Found_ page) that redirects to the home page.

## API Server

* **GET `/api/courses`**: Get all the courses as a JSON list.
  - **Response body**: JSON object with the list of courses, or description of the error(s):
    ```
    [ { "code": "02LSEOV", "name": "Computer architectures", "cfu": 12,
    "mandatory": null, "maxStudents": null, "incompat": [ "02GOLOV" ] }, ... ]
    ```
  - Codes: `200 OK`, `500 Internal Server Error`.


* **GET `/api/courses/num-students`**: Get the number of enrolled students for each course.
  - **Response body**: JSON object like: {course_code1: num_students1, course_code2:  num_students2, ...} (courses that do not appear in this object have zero enrolled students), or description of the error(s):
    ```
    { "01NYHOV": 1, "01OTWOV": 3,
      "01OUZPD": 1, "01SQJOV": 3 }
    ```
  - Codes: `200 OK`, `500 Internal Server Error`.

* **DELETE `/api/study-plan`**: Delete the study plan for the logged in user. 
  - **Response body**: Empty on success, otherwise a JSON object with the error.
  - Codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.
	

* **POST `/api/study-plan`** : Create a new study plan for the logged in user.
  - **Request**: JSON object with _fullTime_ (boolean specifying the career type) and _courses_ (list of course codes):   
    ```
    { "fullTime": false,
      "courses": [ "01NYHOV", "01OTWOV" ] }
    ```
  - **Response body**: Empty on success, or a JSON object with error description:
    ```
    { "errors": [ "Study plan already present" ] }
    ```
  - Codes: `200 OK`, `401 Unauthorized`, `400 Bad Request` (invalid request body), `422 Unprocessable Entity` (the requested action can not be performed), `500 Internal Server Error`.


* **POST `/api/study-plan-modifications`**: Edit the existing study plan for the logged in user.
  - **Request**: JSON object with _add_ (list of course codes to add to the current study plan) and _rem_ (list of course codes to remove from the current study plan):  
    ```
    { "add": [], "rem": [ "01NYHOV" ] }
    ```
  - **Response body**: Empty on success, otherwise a JSON object with error description:
    ```
    { "errors": [ "Student doesn't currently have a study plan" ] }
    ```
  - Codes: `200 OK`, `401 Unauthorized`, `400 Bad Request` (invalid request body), `422 Unprocessable Entity` (the requested action can not be performed), `500 Internal Server Error`.

### Authentication APIs

* **POST `/api/session`**: Authenticate and login the user.
  - **Request**: JSON object with _username_ equal to email:   
    ```
    { "username": "a@p.it", "password": "password" }
    ```
  - **Response body**: JSON object with the student's info and, if the user has a study plan, studyPlan; or a description of the errors:   
    ```
    { "email": "a@p.it", "name": "Luigi Verdi",
      "fullTime": false,
      "studyPlan": [ "01OTWOV", "01URSPD", "01NYHOV", "01TYMOV", "01SQJOV" ] }
    ```
  - Codes: `200 OK`, `401 Unauthorized` (incorrect email and/or password), `400 Bad Request` (invalid request body), `500 Internal Server Error`.


* **DELETE `/api/session`**: Logout the user.
  - Codes: `200 OK`, `401 Unauthorized`.

* **GET `/api/session/current`**: Get info on the logged in user.
  - Codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.
  - **Response body**: JSON object with the same info as in login:   
    ```
    { "email": "a@p.it", "name": "Luigi Verdi",
      "fullTime": false,
      "studyPlan": [ "01OTWOV", "01URSPD", "01NYHOV", "01TYMOV", "01SQJOV" ] }
    ```
    
* **POST `/api/login-totp`**: Perform the 2FA through TOTP.
  - **Request**: JSON object with the _code_:   
    ```
    { "code": "123456" }
    ```
  - **Response body**: fixed JSON object in case of success
  - Codes: `200 OK`, `401 Unauthorized` (incorrect code).



## Database Tables

- Table `students`: _name_, _email_, _autogenerated_id_, _hash_, _salt_, _full_time_, _secret_.   
  _full_time_: type of study plan (NULL: no study plan yet, 0: part-time, 1: full-time).
- Table `courses`: _code_, _name_, _cfu_, _max_students_, _mandatory_.     
  _max_students_: NULLable; _mandatory_: a NULLable course code referencing an eventual preparatory course.
- Table `incompats`: _course_, _incompat_.   
  _incompat__ references course codes, allow to reconstruct the incompatibility relationships between courses.
- Table `course_in_studyplan`: _course_, _student_.   
  A row of this table means that the specified course is in the student's study plan.

## Main React Components

- `Main` (in `App.js`): technically a component, takes the role of App and is rendered inside a Router to be able to use the useNavigate hook. This maintains most of the state of the app.
- `HomePage` (in `App.js`): proper home page, contains the list of courses and, when a student is logged in, their study plan as well. This component injects all the Contexts used throughout the app with their respective values.
- `CourseList` (in `CourseList.js`): the list of all courses. It is a wrapper around a Bootstrap Accordion component.
- `CourseItem` (in `CourseList.js`): a single course in the CourseList. When collapsed it shows the course's code, name, credits and current and maximum number of students. It can be expanded to reveal the course's constraints. When in a study plan editing session, this puts a small round button next to the accordion item to add/remove the course to/from the study plan, and is responsible for checking if doing so is valid.
- `CourseItemDetails` (in `CourseList.js`): the body of a CourseItem's accordion item. Shows the course's constraints as _CourseCodeHoverables_ and, during a study plan editing session, if the corresponding course can not be added or removed, it shows the reason.
- `StudyPlan` (in `StudyPlan.js`): when a student is logged in, this renders their study plan as a toolbar plus list of courses (or just the toolbar if no study plan has been created yet), and allows them to edit it.
- `Toolbar` (in `StudyPlan.js`): shows important information on the current study plan (like the number of credits) and the buttons that the student can use to save the changes, discard them, or delete the study plan altogether.
- `StudyPlanList` (in `StudyPlan.js`): the proper list of courses in the study plan (as a Bootstrap ListGroup component).
- `LoginForm` (in `LoginForm.js`): the login form that students can use to login into the app. This is responsible for the client-side validation of the login credentials (valid email and non-empty password).

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

| email | password | name | career type |
|-------|----------|------|-------------|
| s123456@studenti.polito.it | password | Mario Rossi | full-time |
| a@p.it | password | Luigi Verdi | part-time |
| b@p.it | password | Maria Bianchi | part-time |
| c@p.it | password | Francesca Neri | full-time |
| d@p.it | password | John Doe | none |
