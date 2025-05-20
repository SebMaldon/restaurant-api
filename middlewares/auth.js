const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar el token JWT
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    
    if (!user) {
      throw new Error();
    }
    
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Por favor autentíquese' });
  }
};

// Middleware para verificar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Verifica si alguno de los roles del usuario coincide con los requeridos
    if (!req.user.auth.roles.some(role => roles.includes(role))) {
      return res.status(403).json({ 
        message: `El usuario no tiene los roles necesarios (requeridos: ${roles.join(', ')})` 
      });
    }
    next();
  };
};