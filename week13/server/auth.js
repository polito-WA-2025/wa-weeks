"use strict"

const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;

/**
 * Helper function to initialize passport authentication with the LocalStrategy
 * 
 * @param app express app
 * @param db instance of an active Database object
 */
function initAuthentication(app, db) {
  // Setup passport
  passport.use(new LocalStrategy((email, password, done) => {
    db.authUser(email.toLowerCase(), password)
      .then(student => {
        if (student) done(null, student);
        else         done({status: 401, msg: "Incorrect username and/or password"}, false);
      })
      .catch(() => /* db error */ done({status: 500, msg: "Database error"}, false));
  }));

  // Serialization and deserialization of the student to and from a cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    db.getStudent(id)
      .then(user => done(null, user))
      .catch(e => done(e, null));
  });

  // Initialize express-session
  app.use(session({
    secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191",
    resave: false,
    saveUninitialized: false
  }));

  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}

/**
 * Express middleware to check if the user is authenticated.
 * Responds with a 401 Unauthorized in case they're not.
 */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({errors: ["Not authenticated"]});
}

module.exports = { initAuthentication, isLoggedIn };
