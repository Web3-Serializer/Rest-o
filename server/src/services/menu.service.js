import Menu from '../models/Menu.js';

export const getAllMenus = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.isAvailable !== undefined) query.isAvailable = filters.isAvailable;

  return await Menu.find(query).sort({ createdAt: -1 });
};

export const getMenuById = async (id) => {
  const menu = await Menu.findById(id);
  if (!menu) throw new Error('Menu not found');
  return menu;
};

export const createMenu = async (menuData) => {
  return await Menu.create(menuData);
};

export const updateMenu = async (id, menuData) => {
  const menu = await Menu.findByIdAndUpdate(id, menuData, { new: true, runValidators: true });
  if (!menu) throw new Error('Menu not found');
  return menu;
};

export const deleteMenu = async (id) => {
  const menu = await Menu.findByIdAndDelete(id);
  if (!menu) throw new Error('Menu not found');
  return menu;
};