import { Router } from 'express';
import {
  checkout,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  getStats,
} from '../controllers/booking.controller.js';
import { authenticate, requireAdmin, requireCustomer } from '../middleware/auth.js';

const router = Router();

// Customer booking flows
router.post('/checkout', authenticate, requireCustomer, checkout);
router.get('/my-bookings', authenticate, getMyBookings);
router.get('/:id', authenticate, getBooking);
router.post('/:id/cancel', authenticate, cancelBooking);

// Admin-only metrics and global bookings
router.get('/admin/stats', authenticate, requireAdmin, getStats);
router.get('/admin/all', authenticate, requireAdmin, getAllBookings);

export default router;
