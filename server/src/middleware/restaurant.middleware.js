import  * as restaurantService from '../services/restaurant.service.js';
import Restaurant from '../models/Restaurant.js';

export const checkRestaurantOpen = async (req, res, next) => {
  try {
    const status = await restaurantService.isRestaurantOpen();
    
    if (!status.isOpen) {
      return res.status(403).json({
        success: false,
        message: status.reason
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking restaurant status'
    });
  }
};

export const checkRestaurantActive = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.getSettings();
    
    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Restaurant is currently inactive'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking restaurant status'
    });
  }
};