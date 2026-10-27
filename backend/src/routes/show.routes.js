import { Router } from 'express';
import {
  getShows,
  getShow,
  createShow,
  lockShowSeats,
  releaseShowSeats,
  deleteShow,
} from '../controllers/show.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getShows);
router.get('/:id', getShow);

// Customer reservation routes
router.post('/:id/lock-seats', authenticate, lockShowSeats);
router.post('/:id/release-seats', authenticate, releaseShowSeats);

// Admin protected routes
router.post('/', authenticate, requireAdmin, createShow);
router.delete('/:id', authenticate, requireAdmin, deleteShow);

export default router;
