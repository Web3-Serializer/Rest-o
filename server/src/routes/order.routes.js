import express from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { checkRestaurantOpen, checkRestaurantActive } from '../middleware/restaurant.middleware.js';

const router = express.Router();

router.get('/myOrders', authenticate, orderController.getMyOrders);

router.get('/', 
  authenticate, 
  authorize('admin', 'manager', 'staff'),
  orderController.getAll
);

router.get('/:id',
   authenticate,
   authorize('admin', 'manager', 'staff'),
   orderController.getById
);

router.post('/', [
  authenticate,
  body('items').isArray({ min: 1 }).withMessage('Items array required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Valid total amount required'),
  body('tableNumber').notEmpty().withMessage('Table number is required'),
  validate,
  checkRestaurantActive,
  checkRestaurantOpen,
], orderController.create);

router.patch('/:id/status', [
  authenticate,
  body('status').isIn(['pending', 'preparing', 'ready', 'delivered', 'cancelled']).withMessage('Valid status required'),
  validate,
  authorize('admin', 'manager', 'staff')
], orderController.updateStatus);

router.delete('/:id', [
  authenticate,
  authorize('admin', 'manager')
], orderController.remove);

export default router;