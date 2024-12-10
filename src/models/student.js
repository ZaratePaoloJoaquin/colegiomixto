const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const teacherRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    attendance: {
        type: String,
        enum: ['presente', 'ausente', 'tardanza'],
        required: true
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const assistantRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    attendance: {
        type: String,
        enum: ['presente', 'ausente', 'tardanza'],
        required: true
    },
    uniform: {
        type: String,
        enum: ['correcto', 'incorrecto', 'incompleto'],
        required: true
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const studentSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    dni: {
        type: String,
        required: true,
        unique: true
    },
    age: Number,
    grade: String,
    photo: String,
    password: {
        type: String,
        default: function() {
            return this.dni;
        }
    },
    teacherRecords: [teacherRecordSchema],
    assistantRecords: [assistantRecordSchema],
    feedbackRecords: [{
        date: {
            type: Date,
            required: true
        },
        teacherId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Teacher',
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        teachingQuality: {
            type: String,
            enum: ['siempre', 'a veces', 'nunca'],
            required: true
        },
        classPreparation: {
            type: String,
            enum: ['siempre', 'a veces', 'nunca'],
            required: true
        },
        studentAttention: {
            type: String,
            enum: ['siempre', 'a veces', 'nunca'],
            required: true
        },
        notes: String
    }]
});

studentSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

studentSchema.methods.validPassword = function(password) {
    return password === this.password;
};

module.exports = mongoose.model('Student', studentSchema, 'estudiantes'); 