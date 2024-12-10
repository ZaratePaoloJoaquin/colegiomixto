const mongoose = require('mongoose');
const Teacher = require('../models/teacher');

const peruvianTeachers = [
    { firstName: 'José', lastName: 'García Mendoza' },
    { firstName: 'María', lastName: 'Torres Huamán' },
    { firstName: 'Juan', lastName: 'Quispe Mamani' },
    { firstName: 'Rosa', lastName: 'Flores Vargas' },
    { firstName: 'Carlos', lastName: 'Huamán Ramos' },
    { firstName: 'Ana', lastName: 'Ramos Condori' },
    { firstName: 'Luis', lastName: 'Mamani Cruz' },
    { firstName: 'Carmen', lastName: 'Vargas Chávez' },
    { firstName: 'Pedro', lastName: 'Condori Quispe' },
    { firstName: 'Martha', lastName: 'Cruz Torres' },
    { firstName: 'Miguel', lastName: 'Chávez García' },
    { firstName: 'Julia', lastName: 'Rojas Huamán' },
    { firstName: 'Fernando', lastName: 'López Flores' },
    { firstName: 'Patricia', lastName: 'Díaz Ramos' },
    { firstName: 'Roberto', lastName: 'Castro Mamani' },
    { firstName: 'Lucía', lastName: 'Mendoza Vargas' },
    { firstName: 'Ricardo', lastName: 'Pérez Quispe' },
    { firstName: 'Teresa', lastName: 'Silva Cruz' },
    { firstName: 'Eduardo', lastName: 'Gonzales Torres' },
    { firstName: 'Susana', lastName: 'Rodríguez Chávez' }
];

async function populateTeachers() {
    try {
        // Connect to your MongoDB
        await mongoose.connect('mongodb://localhost/your_database', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // First, clear existing teachers
        await Teacher.deleteMany({});

        // Insert new teachers
        await Teacher.insertMany(peruvianTeachers);

        console.log('Teachers populated successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error populating teachers:', error);
        mongoose.connection.close();
    }
}

// Run the population
populateTeachers(); 