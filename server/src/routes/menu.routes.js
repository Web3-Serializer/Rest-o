import express from 'express';
import { body } from 'express-validator';
import * as menuController from '../controllers/menu.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// theses are publics.
router.get('/', menuController.getAll);
router.get('/:id', menuController.getById);

// 5 mb after decoding img!
function validateBase64Image(base64String) {
  if (!base64String.startsWith('data:image/')) return false;
  const sizeInBytes = Buffer.from(base64String.split(',')[1], 'base64').length;
  return sizeInBytes <= 5 * 1024 * 1024;
}

// theses are authenticateds
router.post('/', [
  authenticate,
  authorize('admin', 'manager'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('image').custom((value) => validateBase64Image(value)).withMessage('Invalid image'),
  body('category').isIn(['appetizer', 'main', 'dessert', 'drink', 'other']).withMessage('Valid category required'),
  validate
], menuController.create);

router.put('/:id', [
  authenticate,
  authorize('admin', 'manager'),
  validate
], menuController.update);

router.delete('/:id', [
  authenticate,
  authorize('admin', 'manager')
], menuController.remove);

export default router;