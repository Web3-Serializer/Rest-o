import express from 'express';
import { body } from 'express-validator';
import * as reservationController from '../controllers/reservation.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { checkRestaurantActive, checkRestaurantOpen } from '../middleware/restaurant.middleware.js';

const router = express.Router();

router.get('/', [
  authenticate,
  authorize('admin', 'manager', 'staff'),
], reservationController.getAll);

router.get('/myReservations', [
  authenticate
], reservationController.getMyReservations);

router.get('/:id', [
  authenticate,
  authorize('admin', 'manager', 'staff'),
], reservationController.getById);

router.post('/', [
  authenticate,
  body('customerName').notEmpty().withMessage('Customer name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').notEmpty().withMessage('Phone required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('time').notEmpty().withMessage('Time required'),
  body('numberOfGuests').isInt({ min: 1 }).withMessage('Valid number of guests required'),
  validate,
  checkRestaurantActive,
  checkRestaurantOpen,
], reservationController.create);

router.put('/:id', [
  authenticate,
  authorize('admin', 'manager', 'staff'),
  validate
], reservationController.update);

router.delete('/:id', [
  authenticate,
  authorize('admin', 'manager')
], reservationController.remove);

export default router;
