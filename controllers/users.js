const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-auth.password -auth.salt')
      .lean();

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// Registrar un nuevo usuario
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Verificar si el usuario ya existe
    let user = await User.findOne({ 'auth.email': email });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Crear nuevo usuario
    user = new User({
      auth: {
        email,
        password
      },
      profile: {
        name
      }
    });
    
    await user.save();
    
    // Generar token JWT
    const token = user.generateAuthToken();
    
    res.status(201).json({ token, user: {
      _id: user._id,
      profile: user.profile,
      auth: {
        email: user.auth.email,
        roles: user.auth.roles
      }
    }});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ 'auth.email': email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    // Actualizar last_login
    user.metadata.last_login = Date.now();

    // Actualizar estatus activo
    user.metadata.active = true;
    await user.save();
    
    // Generar token JWT
    const token = user.generateAuthToken();
    
    res.json({ token, user: {
      _id: user._id,
      profile: user.profile,
      auth: {
        email: user.auth.email,
        roles: user.auth.roles
      }
    }});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-auth.password -auth.salt');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar perfil de usuario
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    
    if (req.body.profile) {
      updates['profile.name'] = req.body.profile.name;
      updates['profile.avatar'] = req.body.profile.avatar;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-auth.password -auth.salt');
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Desactivar un usuario 
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo admins o el propio usuario pueden desactivar su cuenta
    if (!req.user.auth.roles.includes('admin') && !user._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'No autorizado para esta acción' });
    }

    // Soft delete (marcar como inactivo)
    await user.softDelete();
    
    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Eliminación física de usuario
exports.deleteUser = async (req, res) => {
  try {
    // Verificar que el usuario existe
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validar permisos (solo admin o el propio usuario)
    const isAdmin = req.user.auth.roles.includes('admin');
    const isSelf = userToDelete._id.equals(req.user._id);
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ 
        message: 'No tienes permisos para realizar esta acción' 
      });
    }

    // Eliminar todas las reseñas del usuario primero (opcional desactivado)
    // await Review.deleteMany({ user_id: req.params.id });

    // Eliminación física del usuario
    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Usuario y datos relacionados eliminados permanentemente'
    });

  } catch (err) {
    console.error('Error eliminando usuario:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar usuario',
      error: err.message 
    });
  }
};