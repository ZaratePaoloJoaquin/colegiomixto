const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    date: {
        type: Date,
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
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema, 'feedback'); 