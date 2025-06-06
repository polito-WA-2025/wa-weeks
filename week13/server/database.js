"use strict"

const sqlite = require("sqlite3");
const crypto = require("crypto");

/**
 * Wrapper around db.all
 */
const dbAllAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else     resolve(rows);
  });
});

/**
 * Wrapper around db.run
 */
const dbRunAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, err => {
    if (err) reject(err);
    else     resolve();
  });
});

/**
 * Wrapper around db.get
 */
const dbGetAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else     resolve(row);
  });
});

/**
 * Interface to the sqlite database for the application
 *
 * @param dbname name of the sqlite3 database file to open
 */
function Database(dbname) {
  this.db = new sqlite.Database(dbname, err => {
    if (err) throw err;
  });

  /**
   * Retrieve the list of all courses from the db
   *
   * @returns a Promise that resolves to the list of course
   *          objects as: {code, name, cfu, incompat: [...], (mandatory), (maxStudents)}
   */
  this.getCourses = async () => {
    // Note: perform the conversion from the db "max_students" to js' "maxStudents" in the SQL query
    const courses = (await dbAllAsync(this.db, "select code, name, cfu, mandatory, max_students as maxStudents from courses"))
      .map(c => ({...c, incompat: []})); // Add incompat list 
    const incompats = await dbAllAsync(this.db, "select * from incompats");

    for (const {course, incompat} of incompats) {
      // Append incompatibility to the correct course
      const main = courses.find(c => c.code === course);
      if (!main) throw "DB inconsistent";

      main.incompat.push(incompat);
    }

    return courses;
  };

  /**
   * Retrieve the number of enrolled students for each course.
   * 
   * @returns a Promise that resolves to an object like: {course1: num_students1, course2: num_students2, ...}
   *          Note: courses that do not appear in this object have zero enrolled students
   */
  this.getNumStudents = async () => {
    const enrolled = await dbAllAsync(
      this.db,
      `select course, count(*) as numStudents
       from course_in_studyplan
       group by course`
    );

    // Convert to a single object
    const res = {};
    for (const {course, numStudents} of enrolled) {
      res[course] = numStudents;
    }

    return res;
  };

  /**
   * Retrieve the list of courses in the student's study plan
   * 
   * @param studentId the numeric id of the student whose study plan is to be returned
   * 
   * @returns a Promise that resolves to a list of course code strings
   */
  this.getStudyPlan = async studentId => {
    return (await dbAllAsync(
      this.db,
      "select course from course_in_studyplan where student = ?",
      [studentId]
    )).map(c => c.course);
  };

  /**
   * Delete the specified student's study plan
   * 
   * @param studentId the id of the student whose study plan is to be deleted
   * 
   * @returns a Promise that resolves to nothing when the study plan has been deleted
   */
  this.deleteStudyPlan = studentId => Promise.all([
    dbRunAsync(
      this.db,
      "update students set full_time = null where id = ?",
      [studentId]
    ),
    dbRunAsync(
      this.db,
      "delete from course_in_studyplan where student = ?",
      [studentId]
    )
  ]);

  /**
   * Create a new study plan for the specified student.
   * This function assumes the input to be correct, please validate it beforehand with 'checkStudyPlan'.
   * 
   * @param fullTime boolean, distinguishes beetween full-time and part-time
   * @param sp list of course code strings that make up the study plan
   * @param studentId id of the student
   * 
   * @returns a Promise that resolves to nothing on success
   */
  this.createStudyPlan = (fullTime, sp, studentId) => {
    // Set full_time param for the student
    const p1 = dbRunAsync(this.db, "update students set full_time = ? where id = ?", [fullTime ? 1 : 0, studentId]);

    // Insert the courses in the study plan
    let p2;

    if (sp.length > 0) {
      const sql = "insert into course_in_studyplan (course, student) values " + sp
        .map((c, i, a) => "(?, ?)" + (i < a.length - 1 ? "," : ""))
        .reduce((prev, cur) => prev + cur);
      const values = sp.flatMap(c => [c, studentId]);

      p2 = dbRunAsync(this.db, sql, values);
    } else
      p2 = Promise.resolve();

    return Promise.all([p1, p2]);
  };

  /**
   * Edit the current study plan for the specified student by adding and removing the given courses
   * 
   * @param add list of course codes to be added to the study plan
   * @param rem list of course codes to be removed from the study plan
   * @param studentId id of the student
   */
  this.editStudyPlan = (add, rem, studentId) => {
    // Add
    let pAdd;
    
    if (add.length > 0) {
      const sql = "insert into course_in_studyplan (course, student) values " + add
        .map((c, i, a) => "(?, ?)" + (i < a.length - 1 ? "," : ""))
        .reduce((prev, cur) => prev + cur);
      const values = add.flatMap(c => [c, studentId]);

      pAdd = dbRunAsync(this.db, sql, values);
    } else
      pAdd = Promise.resolve();

    // Remove
    const pRem = rem.map(c => dbRunAsync(this.db, "delete from course_in_studyplan where student = ? and course = ?", [studentId, c]));

    return Promise.all([pAdd, pRem].flat());
  };

  /**
   * Authenticate a user from their email and password
   * 
   * @param email email of the user to authenticate
   * @param password password of the user to authenticate
   * 
   * @returns a Promise that resolves to the user object {id, username, name, fullTime}
   */
  this.authUser = (email, password) => new Promise((resolve, reject) => {
    // Get the student with the given email
    dbGetAsync(
      this.db,
      "select * from students where email = ?",
      [email]
    )
      .then(student => {
        // If there is no such student, resolve to false.
        // This is used instead of rejecting the Promise to differentiate the
        // failure from database errors
        if (!student) resolve(false);

        // Verify the password
        crypto.scrypt(password, student.salt, 32, (err, hash) => {
          if (err) reject(err);

          if (crypto.timingSafeEqual(hash, Buffer.from(student.hash, "hex")))
            resolve({id: student.id, username: student.email, name: student.name, secret: student.secret, fullTime: student.full_time === null ? null : Boolean(student.full_time)}); // Avoid full_time = null being cast to false
          else resolve(false);
        });
      })
      .catch(e => reject(e));
  });

  /**
   * Retrieve the student with the specified id
   * 
   * @param id the id of the student to retrieve
   * 
   * @returns a Promise that resolves to the user object {id, username, name, fullTime}
   */
  this.getStudent = async id => {
    const student = await dbGetAsync(
      this.db,
      "select email as username, name, full_time as fullTime, secret from students where id = ?",
      [id]
    );

    return {...student, id, fullTime: student.fullTime === null ? null : Boolean(student.fullTime)};
  };

  /**
   * Check the validity of the provided study plan for the given student
   * 
   * @param fullTime boolean, distinguishes beetween full-time and part-time
   * @param sp list of course code strings that make up the study plan
   * @param studentId id of the student
   * 
   * @returns a list of error strings. When empty, the study plan is considered valid
   */
  this.checkStudyPlan = async (fullTime, sp, studentId) => {
    // The student has been authenticated, so it's safe to assume it exists
    
    // To check every constraint, we need the list of all courses with the respective number of students.
    // Also, let's get the current study plan for the student to compare
    let [c, n, curSP] = await Promise.all([
      this.getCourses(),
      this.getNumStudents(),
      this.getStudyPlan(studentId)
    ]);

    // Convert courses list to an object for better efficiency
    const courses = {};
    for (const {code, ...course} of c) {
      courses[code] = {...course, numStudents: n[code] || 0};
    }

    const errors = [];
    let cfu = 0;

    // Perform actual checks
    for (const code of sp) {
      const course = courses[code];
      
      // Does the course exist?
      if (course === undefined)
        errors.push(`Course "${code}" does not exist`);

      // Max number of students
      if (course.maxStudents && course.numStudents >= course.maxStudents && !curSP.includes(code))
        errors.push(`Course "${code}" has reached the maximum number of students`);

      // Mandatory
      if (course.mandatory && !sp.find(c => c === course.mandatory))
        errors.push(`Course "${code}"'s mandatory constraint is not respected`);

      // Incompatible
      for (const i of course.incompat) {
        if (sp.find(c => c === i))
          errors.push(`"${code}" incompatible with "${i}"`);
      }

      cfu += course.cfu;
    }

    // Total number of cfu within bounds?
    const cfuBounds = fullTime ? [60, 80] : [20, 40];

    if (cfu < cfuBounds[0])
      errors.push("Too few CFUs");
    else if (cfu > cfuBounds[1])
      errors.push("Too many CFUs");

    return errors;
  };
}

module.exports = Database;
