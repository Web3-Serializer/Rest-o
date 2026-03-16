import Restaurant from '../models/Restaurant.js';

export const isRestaurantOpen = async () => {
  try {
    const restaurant = await Restaurant.getSettings();
    
    if (!restaurant.isActive) {
      return { isOpen: false, reason: 'Restaurant is inactive' };
    }
    
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    const todayHours = restaurant.openingHours[dayOfWeek];
    
    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false, reason: 'Restaurant is closed today' };
    }
    
    if (currentTime < todayHours.open || currentTime > todayHours.close) {
      return { 
        isOpen: false, 
        reason: `Restaurant is closed. Open from ${todayHours.open} to ${todayHours.close}` 
      };
    }
    
    return { isOpen: true };
  } catch (error) {
    console.error('Error checking restaurant status:', error);
    return { isOpen: false, reason: 'Error checking restaurant status' };
  }
};

export const getRestaurantStatus = async () => {
  try {
    const restaurant = await Restaurant.getSettings();
    const openStatus = await isRestaurantOpen();
    
    return {
      isActive: restaurant.isActive,
      isOpen: openStatus.isOpen,
      message: openStatus.reason,
      openingHours: restaurant.openingHours,
      name: restaurant.name,
      description: restaurant.description,
      email: restaurant.email,
      phone: restaurant.phone,
      theme: restaurant.theme,
      address: restaurant.address
    };
  } catch (error) {
    console.error('Error getting restaurant status:', error);
    throw error;
  }
};

export const getRestaurantSettings = async () => {
  try {
    return await Restaurant.getSettings();
  } catch (error) {
    console.error('Error getting restaurant settings:', error);
    throw error;
  }
};

export const updateRestaurantSettings = async (updateData) => {
  try {
    let restaurant = await Restaurant.findOne();
    
    const defaultOpeningHours = {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '18:00', isOpen: false },
      sunday: { open: '09:00', close: '18:00', isOpen: false }
    };

    const completeUpdateData = {
      ...updateData,
      openingHours: updateData.openingHours || defaultOpeningHours
    };

    if (!restaurant) {
      restaurant = new Restaurant(completeUpdateData);
    } else {
      restaurant = await Restaurant.findOneAndUpdate(
        {},
        { $set: completeUpdateData },
        { new: true, runValidators: true }
      );
    }
    
    await restaurant.save();
    return restaurant;
  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    throw error;
  }
};

export const isReservationPossible = async (date, time) => {
  try {
    const restaurant = await Restaurant.getSettings();
    
    if (!restaurant.isActive) {
      return { possible: false, reason: 'Restaurant is inactive' };
    }
    
    const reservationDate = new Date(date);
    const dayOfWeek = reservationDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = restaurant.openingHours[dayOfWeek];
    
    if (!dayHours || !dayHours.isOpen) {
      return { possible: false, reason: 'Restaurant is closed on this day' };
    }
    
    if (time < dayHours.open || time > dayHours.close) {
      return { 
        possible: false, 
        reason: `Reservation time must be between ${dayHours.open} and ${dayHours.close}` 
      };
    }
    
    return { possible: true };
  } catch (error) {
    console.error('Error checking reservation possibility:', error);
    return { possible: false, reason: 'Error checking reservation availability' };
  }
};