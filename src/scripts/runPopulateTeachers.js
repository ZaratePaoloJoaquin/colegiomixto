const mongoose = require('mongoose');
const populateTeachers = require('./populateTeachers');

// Connect to your MongoDB
mongoose.connect('your_mongodb_connection_string', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Run the populate script
populateTeachers().then(() => {
    console.log('Teachers populated successfully');
    mongoose.connection.close();
}).catch(error => {
    console.error('Error populating teachers:', error);
    mongoose.connection.close();
}); 