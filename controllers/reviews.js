const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// Obtener todas las reseñas
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('restaurant_id', 'name')
      .populate('user_id', 'profile.name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener reseñas por restaurante
exports.getReviewsByRestaurant = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant_id: req.params.restaurantId })
      .populate('user_id', 'profile.name');
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Crear una nueva reseña
exports.createReview = async (req, res) => {
  const review = new Review({
    restaurant_id: req.params.restaurantId,
    user_id: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
    images: req.body.images
  });

  try {
    // Verificar que el restaurante existe
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante no encontrado' });
    }

    const newReview = await review.save();
    
    // Actualizar el rating promedio del restaurante
    await updateRestaurantRating(req.params.restaurantId);
    
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Actualizar una reseña
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, user_id: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada o no autorizado' });
    }
    
    // Actualizar el rating promedio del restaurante
    await updateRestaurantRating(review.restaurant_id);
    
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      user_id: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada o no autorizado' });
    }
    
    // Actualizar el rating promedio del restaurante
    await updateRestaurantRating(review.restaurant_id);
    
    res.json({ message: 'Reseña eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Función para actualizar el rating promedio de un restaurante
async function updateRestaurantRating(restaurantId) {
  const result = await Review.aggregate([
    { $match: { restaurant_id: restaurantId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (result.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      'rating.average': result[0].average,
      'rating.count': result[0].count
    });
  } else {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
}