const Restaurant = require('../models/Restaurant'); // Modelo de restaurante

// Obtener todos los restaurantes
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find(); // Busca todos los restaurantes
    res.json(restaurants); // Devuelve lista de restaurantes
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Obtener restaurante por ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id); // Busca por ID
    if (!restaurant) return res.status(404).json({ message: 'Restaurante no encontrado' }); // No encontrado
    res.json(restaurant); // Devuelve restaurante encontrado
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};

// Crear nuevo restaurante
exports.createRestaurant = async (req, res) => {
  const restaurant = new Restaurant(req.body); // Crea instancia con datos del body
  
  try {
    const newRestaurant = await restaurant.save(); // Guarda en BD
    res.status(201).json(newRestaurant); // Devuelve restaurante creado
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error de validación
  }
};

// Actualizar restaurante
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate( // Busca y actualiza
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Opciones: devuelve doc actualizado y valida
    );
    if (!restaurant) return res.status(404).json({ message: 'Restaurante no encontrado' }); // No encontrado
    res.json(restaurant); // Devuelve restaurante actualizado
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error de validación
  }
};

// Eliminar restaurante
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id); // Busca y elimina
    if (!restaurant) return res.status(404).json({ message: 'Restaurante no encontrado' }); // No encontrado
    res.json({ message: 'Restaurante eliminado' }); // Confirma eliminación
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error del servidor
  }
};