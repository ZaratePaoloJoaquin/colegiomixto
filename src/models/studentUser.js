const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const studentUserSchema = new mongoose.Schema({
    studentId: {  // DNI or school ID
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    grade: String
});

// Generate hash
studentUserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if password is valid
studentUserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('StudentUser', studentUserSchema, 'student_users'); 