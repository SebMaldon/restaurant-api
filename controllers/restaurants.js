const Restaurant = require('../models/Restaurant');

// Obtener todos los restaurantes
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un restaurante por ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante no encontrado' });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Crear un nuevo restaurante
exports.createRestaurant = async (req, res) => {
  const restaurant = new Restaurant(req.body);
  
  try {
    const newRestaurant = await restaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Actualizar un restaurante
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante no encontrado' });
    }
    
    res.json(restaurant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar un restaurante
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante no encontrado' });
    }
    
    res.json({ message: 'Restaurante eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};