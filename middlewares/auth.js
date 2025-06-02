const jwt = require('jsonwebtoken'); // Para manejar JWT
const User = require('../models/User'); // Modelo de usuario

// Autentica usuario con JWT
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', ''); // Extrae token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica token
    const user = await User.findOne({ _id: decoded._id }); // Busca usuario
    
    if (!user) throw new Error(); // Si no existe usuario
    
    req.token = token; // Agrega token al request
    req.user = user; // Agrega usuario al request
    next(); // Continúa al siguiente middleware
  } catch (err) {
    res.status(401).json({ message: 'Por favor autentíquese' }); // Error de autenticación
  }
};

// Autoriza por roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Verifica si usuario tiene alguno de los roles requeridos
    if (!req.user.auth.roles.some(role => roles.includes(role))) {
      return res.status(403).json({ 
        message: `El usuario no tiene los roles necesarios (requeridos: ${roles.join(', ')})` 
      }); // Error de autorización
    }
    next(); // Si tiene permisos, continúa
  };
};