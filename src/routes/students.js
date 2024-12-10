const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const multer = require('multer');
const Teacher = require('../models/teacher');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.render('students', { 
            students,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.render('students', { 
            students: [],
            messages: {
                error: ['Error al cargar estudiantes']
            }
        });
    }
});

// Register new student
router.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const newStudent = new Student({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dni: req.body.dni,
            age: req.body.age,
            grade: req.body.grade,
            photo: req.file ? req.file.path : null
        });

        // Set password same as DNI
        newStudent.password = newStudent.generateHash(req.body.dni);

        await newStudent.save();
        req.flash('success', 'Estudiante registrado exitosamente');
        res.redirect('/students');
    } catch (error) {
        console.error('Error al registrar estudiante:', error);
        req.flash('error', 'Error al registrar estudiante');
        res.redirect('/students');
    }
});

// Get single student
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            req.flash('message', 'Estudiante no encontrado');
            return res.redirect('/students');
        }
        res.render('studentDetail', { student, user: req.user });
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        req.flash('message', 'Error al obtener detalles del estudiante');
        res.redirect('/students');
    }
});

// Delete student
router.post('/:id/delete', async (req, res) => {
    try {
        // Find and delete the student
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        
        if (!deletedStudent) {
            req.flash('error', 'Estudiante no encontrado');
            return res.redirect('/students');
        }

        // If there's a photo, you might want to delete it from the uploads folder
        if (deletedStudent.photo) {
            const fs = require('fs');
            const path = require('path');
            const photoPath = path.join(__dirname, '..', '..', deletedStudent.photo);
            
            // Delete the photo file if it exists
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        console.log('Estudiante eliminado:', deletedStudent);
        req.flash('success', 'Estudiante eliminado exitosamente');
        res.redirect('/students');
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        req.flash('error', 'Error al eliminar estudiante');
        res.redirect('/students');
    }
});

// GET route for edit form
router.get('/:id/edit', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            req.flash('message', 'Estudiante no encontrado');
            return res.redirect('/students');
        }
        res.render('studentEdit', { student });
    } catch (error) {
        console.error('Error al obtener estudiante para editar:', error);
        req.flash('message', 'Error al cargar el formulario de edición');
        res.redirect('/students');
    }
});

// POST route to handle the edit form submission
router.post('/:id/edit', upload.single('photo'), async (req, res) => {
    try {
        const { firstName, lastName, dni, age, grade } = req.body;
        const updateData = {
            firstName,
            lastName,
            dni,
            age,
            grade
        };

        // Only update photo if a new one was uploaded
        if (req.file) {
            updateData.photo = req.file.path;
        }

        await Student.findByIdAndUpdate(req.params.id, updateData);
        req.flash('message', 'Estudiante actualizado exitosamente');
        res.redirect('/students');
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        req.flash('message', 'Error al actualizar estudiante');
        res.redirect('/students');
    }
});

// Add teacher record
router.post('/:id/teacher-record', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            req.flash('error', 'Estudiante no encontrado');
            return res.redirect(`/students/${req.params.id}`);
        }

        // Adjust the date to handle timezone correctly
        const recordDate = new Date(req.body.date);
        recordDate.setHours(recordDate.getHours() + 24);

        const newRecord = {
            date: recordDate,
            subject: req.body.subject,
            attendance: req.body.attendance,
            notes: req.body.notes
        };

        student.teacherRecords.push(newRecord);
        await student.save();

        req.flash('success', 'Registro guardado exitosamente');
        res.redirect(`/students/${req.params.id}`);
    } catch (error) {
        console.error('Error al guardar registro:', error);
        req.flash('error', 'Error al guardar registro');
        res.redirect(`/students/${req.params.id}`);
    }
});

// Get teacher records with filtering
router.get('/:id/teacher-records', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        let records = student.teacherRecords;

        // Apply filters
        const { subject, date, attendance } = req.query;

        if (subject) {
            records = records.filter(record => record.subject === subject);
        }

        if (date) {
            // Convert the filter date to UTC
            const filterDate = new Date(date);
            // Adjust for timezone offset
            filterDate.setHours(filterDate.getHours() + 24);
            
            records = records.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.toISOString().split('T')[0] === filterDate.toISOString().split('T')[0];
            });
        }

        if (attendance) {
            records = records.filter(record => record.attendance === attendance);
        }

        // Sort records by date (most recent first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(records);
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
});

// Add assistant record
router.post('/:id/assistant-record', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            req.flash('error', 'Estudiante no encontrado');
            return res.redirect(`/students/${req.params.id}`);
        }

        const recordDate = new Date(req.body.date);
        recordDate.setHours(recordDate.getHours() + 24);

        const newRecord = {
            date: recordDate,
            attendance: req.body.attendance,
            uniform: req.body.uniform,
            notes: req.body.notes
        };

        student.assistantRecords.push(newRecord);
        await student.save();

        req.flash('success', 'Registro guardado exitosamente');
        res.redirect(`/students/${req.params.id}`);
    } catch (error) {
        console.error('Error al guardar registro:', error);
        req.flash('error', 'Error al guardar registro');
        res.redirect(`/students/${req.params.id}`);
    }
});

// Get assistant records
router.get('/:id/assistant-records', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        let records = student.assistantRecords;

        const { date, attendance, uniform } = req.query;

        if (date) {
            const filterDate = new Date(date);
            filterDate.setHours(filterDate.getHours() + 24);
            
            records = records.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.toISOString().split('T')[0] === filterDate.toISOString().split('T')[0];
            });
        }

        if (attendance) {
            records = records.filter(record => record.attendance === attendance);
        }

        if (uniform) {
            records = records.filter(record => record.uniform === uniform);
        }

        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(records);
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
});

// Add feedback record
router.post('/estudiante/feedback', async (req, res) => {
    try {
        console.log('Received feedback data:', req.body); // Debug line

        if (!req.body.studentId) {
            return res.status(400).json({
                success: false,
                message: 'El ID del estudiante es requerido'
            });
        }

        const newFeedback = new Feedback({
            studentId: req.body.studentId,
            teacherId: req.body.teacherId,
            date: new Date(req.body.date),
            subject: req.body.subject,
            teachingQuality: req.body.teachingQuality,
            classPreparation: req.body.classPreparation,
            studentAttention: req.body.studentAttention,
            notes: req.body.notes
        });

        console.log('New feedback object:', newFeedback); // Debug line

        await newFeedback.save();
        res.json({ 
            success: true, 
            message: 'Registro guardado exitosamente' 
        });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error al guardar el registro' 
        });
    }
});

// Get feedback records
router.get('/feedback/records', async (req, res) => {
    try {
        const student = await Student.findById(req.user._id)
            .populate('feedbackRecords.teacherId', 'firstName lastName');
        
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        let records = student.feedbackRecords.map(record => ({
            date: record.date,
            teacherId: record.teacherId?._id,
            teacherName: record.teacherId ? 
                `${record.teacherId.firstName} ${record.teacherId.lastName}` : 
                'Profesor no disponible',
            subject: record.subject,
            teachingQuality: record.teachingQuality,
            classPreparation: record.classPreparation,
            studentAttention: record.studentAttention,
            notes: record.notes
        }));

        // Apply filters if they exist
        const { teacherId, subject, date } = req.query;

        if (teacherId) {
            records = records.filter(record => record.teacherId.toString() === teacherId);
        }

        if (subject) {
            records = records.filter(record => record.subject === subject);
        }

        if (date) {
            const filterDate = new Date(date);
            filterDate.setHours(filterDate.getHours() + 24);
            
            records = records.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.toISOString().split('T')[0] === filterDate.toISOString().split('T')[0];
            });
        }

        // Sort records by date (most recent first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(records);
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
});

// Add this route to handle the student portal view
router.get('/portal', async (req, res) => {
    try {
        // Assuming you have the student ID in req.user._id from authentication
        const student = await Student.findById(req.user._id);
        const teachers = await Teacher.find({}, 'firstName lastName'); // Get all teachers

        if (!student) {
            req.flash('error', 'Estudiante no encontrado');
            return res.redirect('/login');
        }

        // Debug log
        console.log('Student data being passed to view:', {
            id: student._id,
            name: student.firstName
        });

        res.render('student-portal', {
            student: student,
            teachers: teachers,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error loading student portal:', error);
        req.flash('error', 'Error al cargar el portal');
        res.redirect('/login');
    }
});

module.exports = router; 