import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = await User.create(userData);
  const token = generateToken(user._id);

  return { user, token };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);
  return { user, token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};


export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const emailChanged = updateData.email && updateData.email !== user.email;
  const passwordChanged = updateData.newPassword && updateData.newPassword.trim() !== '';

  if (emailChanged) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser) throw new Error('Email is already in use');
  }

  if (!updateData.currentPassword) throw new Error('Current password is required');

  const isPasswordValid = await user.comparePassword(updateData.currentPassword);
  if (!isPasswordValid) throw new Error('Current password is incorrect');
  

  user.name = updateData.name || user.name;
  if (emailChanged) user.email = updateData.email;
  if (passwordChanged) user.password = updateData.newPassword;

  const updatedUser = await user.save();

  const profile = updatedUser.toObject();
  delete profile.password;

  return profile;
};

