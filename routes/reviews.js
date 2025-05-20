const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews');
const { authenticate } = require('../middlewares/auth');

// Rutas públicas
router.get('/', reviewController.getAllReviews);
router.get('/restaurant/:restaurantId', reviewController.getReviewsByRestaurant);

// Rutas protegidas (requieren autenticación)
router.post('/restaurant/:restaurantId', authenticate, reviewController.createReview);
router.put('/:reviewId', authenticate, reviewController.updateReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

module.exports = router;