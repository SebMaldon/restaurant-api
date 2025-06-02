const User = require('../models/User'); // Modelo de usuario
const jwt = require('jsonwebtoken'); // Para manejar JWT

// Obtener todos los usuarios (sin passwords)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-auth.password -auth.salt').lean(); // Excluye datos sensibles
    res.json({ success: true, count: users.length, data: users }); // Devuelve lista segura
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' }); // Error del servidor
  }
};

// Registrar nuevo usuario
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ 'auth.email': email }); // Verifica existencia
    if (userExists) return res.status(400).json({ message: 'El usuario ya existe' }); // Validación
    
    const user = new User({ auth: { email, password }, profile: { name } }); // Crea usuario
    await user.save(); // Guarda en BD
    const token = user.generateAuthToken(); // Genera JWT
    
    res.status(201).json({ token, user: { // Respuesta segura
      _id: user._id,
      profile: user.profile,
      auth: { email: user.auth.email, roles: user.auth.roles }
    }});
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error de validación
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ 'auth.email': email }); // Busca usuario
    if (!user || !(await user.comparePassword(password))) { // Verifica credenciales
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    user.metadata.last_login = Date.now(); // Actualiza último login
    user.metadata.active = true; // Marca como activo
    await user.save();
    
    const token = user.generateAuthToken(); // Genera JWT
    res.json({ token, user: { // Respuesta segura
      _id: user._id,
      profile: user.profile,
      auth: { email: user.auth.email, roles: user.auth.roles }
    }});
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-auth.password -auth.salt'); // Excluye password
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user); // Devuelve perfil seguro
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.profile) { // Solo actualiza campos permitidos
      updates['profile.name'] = req.body.profile.name;
      updates['profile.avatar'] = req.body.profile.avatar;
    }
    
    const user = await User.findByIdAndUpdate( // Actualiza y devuelve nuevo doc
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-auth.password -auth.salt');
    
    res.json(user); // Devuelve perfil actualizado
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error de validación
  }
};

// Desactivar usuario (soft delete)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    // Verifica permisos (admin o propio usuario)
    if (!req.user.auth.roles.includes('admin') && !user._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'No autorizado para esta acción' });
    }
    
    await user.softDelete(); // Marca como inactivo
    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Eliminar usuario permanentemente
exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    // Verifica permisos (admin o propio usuario)
    const isAdmin = req.user.auth.roles.includes('admin');
    const isSelf = userToDelete._id.equals(req.user._id);
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'No tienes permisos' });
    
    await User.findByIdAndDelete(req.params.id); // Eliminación física
    res.json({ success: true, message: 'Usuario eliminado permanentemente' });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
};