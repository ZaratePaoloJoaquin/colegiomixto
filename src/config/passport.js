const LocalStrategy = require('passport-local').Strategy;
const Admin = require('../models/user');
const StudentUser = require('../models/studentUser');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await Admin.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async function (req, email, password, done) {
    try {
      const user = await Admin.findOne({ email: email });
      if (!user) {
        return done(null, false, req.flash('loginMessage', 'Usuario no encontrado'));
      }
      if (!user.comparePassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Contraseña incorrecta'));
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.use('student-login', new LocalStrategy({
    usernameField: 'studentId',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, studentId, password, done) => {
    try {
      const student = await StudentUser.findOne({ studentId });
      
      if (!student) {
        return done(null, false, req.flash('loginMessage', 'No se encontró el estudiante'));
      }

      if (!student.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Contraseña incorrecta'));
      }

      return done(null, student);
    } catch (error) {
      return done(error);
    }
  }));
}
