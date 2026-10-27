import { Router } from 'express';
import {
  getTheatres,
  getTheatre,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} from '../controllers/theatre.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getTheatres);
router.get('/:id', getTheatre);

// Admin protected routes
router.post('/', authenticate, requireAdmin, createTheatre);
router.put('/:id', authenticate, requireAdmin, updateTheatre);
router.delete('/:id', authenticate, requireAdmin, deleteTheatre);

export default router;
