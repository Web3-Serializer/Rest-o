import * as menuService from '../services/menu.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAll = async (req, res) => {
  try {
    const menus = await menuService.getAllMenus(req.query);
    successResponse(res, { menus }, 'Menus retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const menu = await menuService.getMenuById(req.params.id);
    successResponse(res, { menu }, 'Menu retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

export const create = async (req, res) => {
  try {
    const menu = await menuService.createMenu(req.body);
    successResponse(res, { menu }, 'Menu created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const update = async (req, res) => {
  try {
    const menu = await menuService.updateMenu(req.params.id, req.body);
    successResponse(res, { menu }, 'Menu updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const remove = async (req, res) => {
  try {
    await menuService.deleteMenu(req.params.id);
    successResponse(res, null, 'Menu deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};