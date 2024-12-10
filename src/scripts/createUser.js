const mongoose = require('mongoose');
const User = require('../models/user');

mongoose.connect('mongodb://localhost/colegiomixto', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createUser(email, password) {
  const user = new User({
    email: email,
    password: new User().encryptPassword(password)
  });

  try {
    await user.save();
    console.log('Usuario creado exitosamente');
    mongoose.connection.close();
  } catch (error) {
    console.log('Error creando usuario:', error);
    mongoose.connection.close();
  }
}



//createUser('director@colegiomixto.com', 'contraseña123');
//createUser('profesor1@colegiomixto.com', 'contraseña456');
createUser('paoloelprofe@mixtohuaycan.com', '09842722');

//node src/scripts/createUser.js