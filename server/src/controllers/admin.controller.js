import * as adminService from '../services/admin.service.js';
import * as restaurantService from '../services/restaurant.service.js';

// Users controllers

export const getUsers = async (req, res) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json({
      success: true,
      message: 'Admin stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Restaurants controllers

export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.getRestaurant();
    res.json({
      success: true,
      message: 'Restaurant settings retrieved successfully',
      data: { restaurant }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.updateRestaurant(req.body);
    res.json({
      success: true,
      message: 'Restaurant settings updated successfully',
      data: { restaurant }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};