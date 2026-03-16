import express from 'express';
import { body } from 'express-validator';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Users 

router.get('/users', [
  authenticate,
  authorize('admin', 'manager')
], adminController.getUsers);

router.get('/users/:id', [
  authenticate,
  authorize('admin', 'manager')
], adminController.getUserById);

router.post('/users', [
  authenticate,
  authorize('admin', 'manager'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'manager', 'staff', 'user']).withMessage('Valid role required'),
  validate
], adminController.createUser);

router.put('/users/:id', [
  authenticate,
  authorize('admin', 'manager'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['admin', 'manager', 'staff', 'user']).withMessage('Valid role required'),
  validate
], adminController.updateUser);

router.delete('/users/:id', [
  authenticate,
  authorize('admin')
], adminController.deleteUser);

router.get('/stats', [
  authenticate,
  authorize('admin', 'manager')
], adminController.getAdminStats);

export default router;