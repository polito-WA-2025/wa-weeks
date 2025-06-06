/**
 * The Course type, used throughout the app.
 * This is a constructor function, meant to be called with "new".
 *
 * @param code the course code, a 7 character string. This must be unique
 * @param name the course name
 * @param cfu how many CFUs this course is worth
 * @param numStudents how many students are enrolled for this course
 * @param incompat list of every course code this course is not compatible with
 * @param mandatory optional string of the course code that's mandatory for this one
 * @param maxStudents optional integer
 */
function Course(
  code,
  name,
  cfu,
  numStudents,
  incompat = [],
  mandatory = null,
  maxStudents = undefined
) {
  this.code = code;
  this.name = name;
  this.cfu = cfu;
  this.numStudents = numStudents;
  this.incompat = incompat;
  this.mandatory = mandatory;
  this.maxStudents = maxStudents;
}

export {Course};
