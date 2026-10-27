import { Router } from 'express';
import {
  getMovies,
  getFeaturedMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  postReview,
  toggleMovieFavorite,
} from '../controllers/movie.controller.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:id', optionalAuth, getMovie);

// Customer authenticated routes
router.post('/:id/reviews', authenticate, postReview);
router.post('/:id/favorite', authenticate, toggleMovieFavorite);

// Admin protected routes
router.post('/', authenticate, requireAdmin, createMovie);
router.put('/:id', authenticate, requireAdmin, updateMovie);
router.delete('/:id', authenticate, requireAdmin, deleteMovie);

export default router;
