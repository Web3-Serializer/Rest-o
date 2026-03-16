import * as restaurantService from '../services/restaurant.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getStatus = async (req, res) => {
  try {
    const status = await restaurantService.getRestaurantStatus();
    successResponse(res, status, 'Restaurant status retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getSettings = async (req, res) => {
  try {
    const restaurant = await restaurantService.getRestaurantSettings();
    successResponse(res, { restaurant }, 'Restaurant settings retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const updateSettings = async (req, res) => {
  try {
    const restaurant = await restaurantService.updateRestaurantSettings(req.body);
    successResponse(res, { restaurant }, 'Restaurant settings updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.body;
    
    if (!date || !time) {
      return errorResponse(res, 'Date and time are required', 400);
    }
    
    const availability = await restaurantService.isReservationPossible(date, time);
    successResponse(res, availability, 'Availability checked successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};