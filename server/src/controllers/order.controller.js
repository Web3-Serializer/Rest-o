import * as orderService from '../services/order.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { notifyKitchen } from '../routes/kitchen.routes.js';

export const getAll = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query, req.user);
    successResponse(res, { orders }, 'Orders retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders({ createdBy: req.user._id });
    successResponse(res, { orders }, 'Your orders retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    successResponse(res, { order }, 'Order retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

export const create = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body, req.user._id);

    const populatedOrder = await orderService.getOrderById(order._id, req.user);
    notifyKitchen('order_created', { order: populatedOrder });

    successResponse(res, { order }, 'Order created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user);
    
    const populatedOrder = await orderService.getOrderById(order._id, req.user);
    notifyKitchen('order_updated', { order: populatedOrder });

    successResponse(res, { order }, 'Order status updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const remove = async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id, req.user);

    notifyKitchen('order_deleted', { orderId: req.params.id });

    successResponse(res, null, 'Order deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};
