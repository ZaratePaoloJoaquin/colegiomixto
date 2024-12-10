const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Feedback = require('../models/feedback');

// Login page route
router.get('/', (req, res) => {
    res.render('estudiante', {
        mensaje: req.flash('loginMessage') || ''
    });
});

// Login POST route
router.post('/', async (req, res) => {
    try {
        const { dni, password } = req.body;
        console.log('Login attempt with:', { dni, password }); // Debug log

        const student = await Student.findOne({ dni });
        console.log('Found student:', student); // Debug log

        if (!student) {
            req.flash('loginMessage', 'DNI no encontrado');
            return res.redirect('/estudiante');
        }

        // Since we want the password to be the same as DNI
        if (dni === password) {
            // Login successful
            req.session.student = {
                id: student._id,
                dni: student.dni,
                firstName: student.firstName,
                lastName: student.lastName,
                grade: student.grade
            };
            return res.redirect('/estudiante/portal');
        } else {
            req.flash('loginMessage', 'Contraseña incorrecta');
            return res.redirect('/estudiante');
        }

    } catch (error) {
        console.error('Error en login:', error);
        req.flash('loginMessage', 'Error al iniciar sesión');
        res.redirect('/estudiante');
    }
});

// Portal route
router.get('/portal', async (req, res) => {
    try {
        if (!req.session.student) {
            return res.redirect('/estudiante');
        }

        // Fetch teachers
        const teachers = await Teacher.find({}).sort('lastName');
        
        res.render('student-portal', {
            student: req.session.student,
            teachers: teachers,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error loading portal:', error);
        req.flash('error', 'Error al cargar el portal');
        res.redirect('/estudiante');
    }
});

// Feedback submission route
router.post('/feedback', async (req, res) => {
    try {
        if (!req.session.student) {
            req.flash('error', 'Sesión no válida');
            return res.redirect('/estudiante');
        }

        // Log the data being saved
        console.log('Saving feedback:', {
            studentId: req.session.student._id,
            teacherId: req.body.teacherId,
            date: req.body.date,
            subject: req.body.subject,
            teachingQuality: req.body.teachingQuality,
            classPreparation: req.body.classPreparation,
            studentAttention: req.body.studentAttention,
            notes: req.body.notes
        });

        const feedback = new Feedback({
            studentId: req.session.student._id,
            teacherId: req.body.teacherId,
            date: req.body.date,
            subject: req.body.subject,
            teachingQuality: req.body.teachingQuality,
            classPreparation: req.body.classPreparation,
            studentAttention: req.body.studentAttention,
            notes: req.body.notes
        });

        await feedback.save();
        
        req.flash('success', 'Registro guardado exitosamente');
        res.redirect('/estudiante/portal');
    } catch (error) {
        console.error('Error saving feedback:', error);
        req.flash('error', 'Error al guardar el registro: ' + error.message);
        res.redirect('/estudiante/portal');
    }
});

// Add this route to get all feedback records
router.get('/feedback/records', async (req, res) => {
    try {
        if (!req.session.student) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        // Log the query parameters
        console.log('Fetching records for student:', req.session.student._id);
        console.log('Query params:', req.query);

        const { teacherId, subject, date } = req.query;
        let query = { studentId: req.session.student._id };

        if (teacherId) query.teacherId = teacherId;
        if (subject) query.subject = subject;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const records = await Feedback.find(query)
            .populate('teacherId', 'firstName lastName')
            .sort({ date: -1 });

        // Log the found records
        console.log('Found records:', records);

        const formattedRecords = records.map(record => ({
            date: record.date,
            teacherName: record.teacherId ? `${record.teacherId.firstName} ${record.teacherId.lastName}` : '-',
            subject: record.subject,
            teachingQuality: record.teachingQuality,
            classPreparation: record.classPreparation,
            studentAttention: record.studentAttention,
            notes: record.notes
        }));

        res.json(formattedRecords);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Error al cargar los registros' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/estudiante');
    });
});

router.post('/estudiante/feedback', async (req, res) => {
    try {
        // Debug log
        console.log('Received request body:', req.body);
        console.log('Student ID from request:', req.body.studentId);
        
        const feedback = new Feedback({
            studentId: req.body.studentId,
            teacherId: req.body.teacherId,
            date: req.body.date,
            subject: req.body.subject,
            teachingQuality: req.body.teachingQuality,
            classPreparation: req.body.classPreparation,
            studentAttention: req.body.studentAttention,
            notes: req.body.notes || ''
        });

        await feedback.save();
        
        res.json({
            success: true,
            message: 'Feedback saved successfully'
        });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/estudiante/feedback/records', async (req, res) => {
    try {
        if (!req.session.student) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        // Log the query parameters
        console.log('Fetching records for student:', req.session.student._id);
        console.log('Query params:', req.query);

        const { teacherId, subject, date } = req.query;
        let query = { studentId: req.session.student._id };

        if (teacherId) query.teacherId = teacherId;
        if (subject) query.subject = subject;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const records = await Feedback.find(query)
            .populate('teacherId', 'firstName lastName')
            .sort({ date: -1 });

        // Log the found records
        console.log('Found records:', records);

        const formattedRecords = records.map(record => ({
            date: record.date,
            teacherName: record.teacherId ? `${record.teacherId.firstName} ${record.teacherId.lastName}` : '-',
            subject: record.subject,
            teachingQuality: record.teachingQuality,
            classPreparation: record.classPreparation,
            studentAttention: record.studentAttention,
            notes: record.notes
        }));

        res.json(formattedRecords);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Error al cargar los registros' });
    }
});

router.get('/estudiante/portal', async (req, res) => {
    try {
        // Get the student from the session
        const student = req.session.user; // or req.user depending on your auth setup
        
        // Debug log to verify student data
        console.log('Student data:', student);
        
        if (!student) {
            console.log('No student found in session');
            return res.redirect('/login');
        }

        // Get teachers list
        const teachers = await Teacher.find({});
        
        // Render the page with student and teachers data
        res.render('student-portal', {
            student: student,
            teachers: teachers,
            messages: req.flash() // if you're using connect-flash
        });

    } catch (error) {
        console.error('Error loading student portal:', error);
        req.flash('error', 'Error al cargar el portal');
        res.redirect('/login');
    }
});

module.exports = router; 


/* import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;


public class gui extends JFrame {
    private JPanel mainPanel;

    private JButton exitButton;

    public gui(String title) {
        super(title);

        exitButton = new JButton("Exit");
        exitButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                System.exit(0);
            }
        });

        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.setContentPane(mainPanel);
        this.pack();
    }
    public static void main(String[] args) {
        JFrame frame = new gui("Emro GUI");
        frame.setVisible(true);
    }
} */