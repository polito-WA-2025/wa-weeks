const SERVER_HOST = "http://localhost";
const SERVER_PORT = 3001;

const SERVER_BASE = `${SERVER_HOST}:${SERVER_PORT}/api/`;

/**
 * Generic API call
 *
 * @param endpoint API endpoint string to fetch
 * @param method HTTP method
 * @param body HTTP request body string
 * @param headers additional HTTP headers to be passed to 'fetch'
 * @param expectResponse wheter to expect a non-empty response body
 * 
 * @returns whatever the specified API endpoint returns
 */
const APICall = async (endpoint, method = "GET", body = undefined, headers = undefined, expectResponse = true) => {
  let errors = [];

  try {
    const response = await fetch(new URL(endpoint, SERVER_BASE), {
        method,
        body,
        headers,
        credentials: "include"
    });

    if (response.ok) {
      if (expectResponse) return await response.json();
    }
    else {
      try {
        const parsedResponse = await response.json();
        errors = parsedResponse.errors; 
      } catch {
        errors = ["Authorization error"];  // Generic, no properly formatted json in the server response
      }
    }
  } catch {
    const err = ["Failed to contact the server"];
    throw err;
  }

  if (errors.length !== 0)
    throw errors;
};

/**
 * Fetches all the courses from the server
 *
 * @returns list of courses
 */
const fetchCourses = async () => await APICall("courses");

/**
 * Fetches the number of enrolled student for each course from the server
 *
 * @returns an object like: {course_code1: num_students1, course_code2: num_students2, ...}.
 *          Courses that do not appear in this object have no enrolled students
 */
const fetchNumStudents = async () => await APICall("courses?filter=enrolled");

const deleteStudyPlan = async () => await APICall(
  "study-plan",
  "DELETE",
  undefined,
  undefined,
  false
);

const createStudyPlan = async (fullTime, courses) => await APICall(
  "study-plan",
  "POST",
  JSON.stringify({fullTime, courses}),
  { "Content-Type": "application/json" },
  false
);

const editStudyPlan = async (add, rem) => await APICall(
  "study-plan-modifications",
  "POST",
  JSON.stringify({add, rem}),
  { "Content-Type": "application/json" },
  false
);

/**
 * Attempts to perform login-totp
 * 
 * @param code the TOTP code
 */
const loginTotp = async (code) => await APICall(
  "login-totp",
  "POST",
  JSON.stringify({code: code}),
  { "Content-Type": "application/json" }
);

/**
 * Attempts to login the student
 * 
 * @param email email of the student
 * @param password password of the student
 */
const login = async (email, password) => await APICall(
  "session",
  "POST",
  JSON.stringify({username: email, password}),
  { "Content-Type": "application/json" }
);

/**
 * Logout.
 * This function can return a "Not authenticated" error if the student wasn't authenticated beforehand
 */
const logout = async () => await APICall(
  "session",
  "DELETE",
  undefined,
  undefined,
  false
);

/**
 * Fetches the currently logged in student's info
 */
const fetchCurrentStudent = async () => await APICall("session/current");

const API = {
  fetchCourses,
  fetchNumStudents,
  deleteStudyPlan,
  createStudyPlan,
  editStudyPlan,
  login,
  loginTotp,
  logout,
  fetchCurrentStudent
};

export { API };
