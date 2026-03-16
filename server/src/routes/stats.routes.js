import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as statsController from '../controllers/stats.controller.js';

const router = express.Router();

router.get(
  '/',
  authenticate,
  statsController.getStats
);

export default router;
