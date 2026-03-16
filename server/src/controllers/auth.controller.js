import * as authService from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);
    successResponse(res, { user, token }, 'User registered successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    successResponse(res, { user, token }, 'Login successful');
  } catch (error) {
    errorResponse(res, error.message, 401);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    successResponse(res, { user }, 'Profile retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    };

    const updatedUser = await authService.updateUserProfile(req.user._id, updateData);
    successResponse(res, { user: updatedUser }, 'Profile updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};