const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurants');
const { authenticate, authorize } = require('../middlewares/auth');

// Rutas públicas
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticate, authorize('admin'), restaurantController.createRestaurant);
router.put('/:id', authenticate, authorize('admin'), restaurantController.updateRestaurant);
router.delete('/:id', authenticate, authorize('admin'), restaurantController.deleteRestaurant);

module.exports = router;