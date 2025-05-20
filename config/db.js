const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Intentando conectar a:', process.env.MONGODB_URI);
    await mongoose.connect('mongodb+srv://admin:basedatos@books.q2vkhb7.mongodb.net/?retryWrites=true&w=majority&appName=books', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;