import express from 'express';
import { body } from 'express-validator';
import * as restaurantController from '../controllers/restaurant.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/status', restaurantController.getStatus);
router.post('/availability', restaurantController.checkAvailability);

router.get('/settings', [
  authenticate,
  authorize('admin')
], restaurantController.getSettings);

router.put('/settings', [
  authenticate,
  authorize('admin'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  validate
], restaurantController.updateSettings);

export default router;