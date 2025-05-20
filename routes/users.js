const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { authenticate, authorize } = require('../middlewares/auth');

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas (requieren autenticación)
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.delete('/logout/:id', authenticate, userController.deactivateUser);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;