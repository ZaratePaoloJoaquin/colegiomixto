const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const StudentUser = require('../models/studentUser');

// Login route
router.post('/', passport.authenticate('local-login', {
  successRedirect: '/students',
  failureRedirect: '/',
  failureFlash: true
}));

// Protected route example
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// Student login page
router.get('/estudiante', (req, res) => {
    res.render('estudiante', {
        mensaje: req.flash('loginMessage')
    });
});

// Student login process
router.post('/estudiante', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        
        const student = await StudentUser.findOne({ studentId });
        
        if (!student) {
            req.flash('loginMessage', 'No se encontró el estudiante');
            return res.redirect('/estudiante');
        }

        if (!student.validPassword(password)) {
            req.flash('loginMessage', 'Contraseña incorrecta');
            return res.redirect('/estudiante');
        }

        // Create session for student
        req.session.student = {
            id: student._id,
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade
        };

        // Redirect to student dashboard or view
        res.redirect('/student-portal');

    } catch (error) {
        console.error('Error en login de estudiante:', error);
        req.flash('loginMessage', 'Error al iniciar sesión');
        res.redirect('/estudiante');
    }
});

// Protected student route example
router.get('/student-portal', isStudent, (req, res) => {
    res.render('student-portal', {
        student: req.session.student
    });
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Middleware to check if user is logged in as student
function isStudent(req, res, next) {
    if (req.session.student) {
        return next();
    }
    res.redirect('/estudiante');
}

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;