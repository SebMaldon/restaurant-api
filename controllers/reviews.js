const Review = require('../models/Review'); // Modelo de reseñas
const Restaurant = require('../models/Restaurant'); // Modelo de restaurantes

// Obtener todas las reseñas con datos poblados
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('restaurant_id', 'name') // Población de datos del restaurante
      .populate('user_id', 'profile.name'); // Población de datos del usuario
    res.json(reviews); // Devuelve todas las reseñas
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Obtener reseñas de un restaurante específico
exports.getReviewsByRestaurant = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant_id: req.params.restaurantId })
      .populate('user_id', 'profile.name'); // Población de datos del usuario
    res.json(reviews); // Devuelve reseñas del restaurante
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Crear nueva reseña
exports.createReview = async (req, res) => {
  const review = new Review({ // Crea nueva reseña
    restaurant_id: req.params.restaurantId,
    user_id: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
    images: req.body.images
  });

  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId); // Verifica existencia del restaurante
    if (!restaurant) return res.status(404).json({ message: 'Restaurante no encontrado' });
    
    const newReview = await review.save(); // Guarda la reseña
    await updateRestaurantRating(req.params.restaurantId); // Actualiza rating del restaurante
    res.status(201).json(newReview); // Devuelve la nueva reseña
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error de validación
  }
};

// Actualizar reseña existente
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate( // Busca y actualiza
      { _id: req.params.reviewId, user_id: req.user._id }, // Solo del usuario
      req.body,
      { new: true, runValidators: true } // Devuelve el documento actualizado
    );
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada o no autorizado' });
    
    await updateRestaurantRating(review.restaurant_id); // Actualiza rating del restaurante
    res.json(review); // Devuelve reseña actualizada
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error de validación
  }
};

// Eliminar reseña
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ // Busca y elimina
      _id: req.params.reviewId, 
      user_id: req.user._id // Solo del usuario
    });
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada o no autorizado' });
    
    await updateRestaurantRating(review.restaurant_id); // Actualiza rating del restaurante
    res.json({ message: 'Reseña eliminada' }); // Confirma eliminación
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Actualiza el rating promedio de un restaurante
async function updateRestaurantRating(restaurantId) {
  const result = await Review.aggregate([ // Agregación para calcular promedio
    { $match: { restaurant_id: restaurantId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  await Restaurant.findByIdAndUpdate(restaurantId, { // Actualiza restaurante
    'rating.average': result[0]?.average || 0, // Promedio o 0 si no hay reseñas
    'rating.count': result[0]?.count || 0 // Conteo o 0 si no hay reseñas
  });
}