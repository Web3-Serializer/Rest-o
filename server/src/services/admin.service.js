import User from '../models/User.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import Menu from '../models/Menu.js';

export const getUsers = async (filters = {}) => {
  const { search, role, isActive, page = 1, limit = 10 } = filters;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role && role !== 'all') {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await User.countDocuments(query);
  
  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const createUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Email already exists');
  }
  
  const user = new User(userData);
  await user.save();
  
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  
  return userWithoutPassword;
};

export const updateUser = async (userId, updateData) => {
  if (updateData.email) {
    const existingUser = await User.findOne({ 
      email: updateData.email, 
      _id: { $ne: userId } 
    });
    if (existingUser) {
      throw new Error('Email already exists');
    }
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const getAdminStats = async () => {
  const [
    totalUsers,
    totalOrders,
    totalReservations,
    totalMenus,
    totalRevenue,
    usersByRole,
    recentUsers
  ] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Reservation.countDocuments(),
    Menu.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.find().sort({ createdAt: -1 }).limit(5).select('-password')
  ]);
  
  return {
    totalUsers,
    totalOrders,
    totalReservations,
    totalMenus,
    totalRevenue: totalRevenue[0]?.total || 0,
    usersByRole: usersByRole.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    recentUsers
  };
};
