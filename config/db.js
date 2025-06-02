const mongoose = require('mongoose'); // Importa Mongoose para MongoDB

const connectDB = async () => {
  try {
    console.log('Intentando conectar a:', process.env.MONGODB_URI); // Log de URI de conexión
    
    await mongoose.connect('mongodb+srv://admin:basedatos@books.q2vkhb7.mongodb.net/?retryWrites=true&w=majority&appName=books', { // Conexión al cluster MongoDB
      useNewUrlParser: true,      // Habilita nuevo parser de URL
      useUnifiedTopology: true,   // Usa nuevo motor de topología
    });
    
    console.log('MongoDB Connected...'); // Confirmación de conexión exitosa
    
  } catch (err) {
    console.error('Database connection error:', err.message); // Log de error
    process.exit(1); // Termina proceso con código de error
  }
};

module.exports = connectDB; // Exporta la función de conexión    