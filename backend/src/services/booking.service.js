import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

/**
 * Server-side calculation of pricing, convenience fee, and taxes
 */
export const calculateBookingPrice = (show, selectedSeatsList) => {
  const categoryPriceMap = new Map();
  (show.pricing || []).forEach((p) => {
    categoryPriceMap.set(p.category, p.price);
  });

  const detailedSeats = selectedSeatsList.map((s) => {
    const price = categoryPriceMap.get(s.category) || 200;
    return {
      seatId: s.seatId,
      row: s.row,
      number: s.number,
      category: s.category,
      price,
    };
  });

  const subtotal = detailedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = Math.round(subtotal * 0.08); // 8% fee
  const tax = Math.round((subtotal + convenienceFee) * 0.18); // 18% tax
  const totalAmount = subtotal + convenienceFee + tax;

  return {
    detailedSeats,
    subtotal,
    convenienceFee,
    tax,
    totalAmount,
  };
};

/**
 * Atomically create a booking with server-side validation and simulated demo checkout
 */
export const createBooking = async ({ showId, seatIds, userId }) => {
  if (!seatIds || seatIds.length === 0) {
    throw new AppError('Please select at least one seat to book', 400);
  }

  const show = await Show.findById(showId)
    .populate('movie')
    .populate('theatre');

  if (!show) {
    throw new AppError('Show not found', 404);
  }

  const now = new Date();
  if (show.startTime < now) {
    throw new AppError('Cannot book seats for a show that has already commenced', 400);
  }

  const requestedSet = new Set(seatIds);
  const matchedSeats = [];
  const unavailableSeats = [];

  show.seats.forEach((seat) => {
    if (requestedSet.has(seat.seatId)) {
      matchedSeats.push(seat);

      if (seat.status === 'booked') {
        unavailableSeats.push({ seatId: seat.seatId, reason: 'Already booked' });
      } else if (
        seat.status === 'locked' &&
        seat.lockedUntil &&
        seat.lockedUntil > now &&
        seat.lockedBy?.toString() !== userId.toString()
      ) {
        unavailableSeats.push({ seatId: seat.seatId, reason: 'Temporarily held by another customer' });
      }
    }
  });

  if (matchedSeats.length !== seatIds.length) {
    throw new AppError('One or more selected seats do not exist in this auditorium', 400);
  }

  if (unavailableSeats.length > 0) {
    throw new AppError(
      `Cannot complete booking. The following seats are unavailable: ${unavailableSeats.map((s) => s.seatId).join(', ')}`,
      409,
      unavailableSeats
    );
  }

  // Calculate pricing strictly on the server
  const pricing = calculateBookingPrice(show, matchedSeats);

  // Generate unique booking reference identifier
  const bookingId = `IMV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const transactionId = `SIM-TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  // Create booking record
  const booking = await Booking.create({
    bookingId,
    user: userId,
    show: show._id,
    movie: show.movie._id,
    theatre: show.theatre._id,
    movieSnapshot: {
      title: show.movie.title,
      posterUrl: show.movie.posterUrl,
      durationMinutes: show.movie.durationMinutes,
      certification: show.movie.certification,
    },
    theatreSnapshot: {
      name: show.theatre.name,
      city: show.theatre.location.city,
      screenName: show.screenName,
    },
    showTime: show.startTime,
    seats: pricing.detailedSeats,
    subtotal: pricing.subtotal,
    convenienceFee: pricing.convenienceFee,
    tax: pricing.tax,
    totalAmount: pricing.totalAmount,
    status: 'confirmed',
    paymentDetails: {
      method: 'DEMO_SIMULATION',
      status: 'simulated_paid',
      transactionId,
      paidAt: now,
      disclaimer: 'DEMO SIMULATION: Testing transaction. No real credit card was charged.',
    },
  });

  // Atomic state commit: mark show seats as booked
  show.seats.forEach((seat) => {
    if (requestedSet.has(seat.seatId)) {
      seat.status = 'booked';
      seat.lockedBy = null;
      seat.lockedUntil = null;
      seat.bookingId = booking._id;
    }
  });

  await show.save();

  return booking;
};

/**
 * Fetch a customer's own bookings
 */
export const getUserBookings = async (userId) => {
  const bookings = await Booking.find({ user: userId })
    .populate('movie', 'title posterUrl genres durationMinutes')
    .populate('theatre', 'name location identifier')
    .sort({ createdAt: -1 });

  return bookings;
};

/**
 * Fetch a specific booking by ID with ownership enforcement
 */
export const getBookingById = async (id, userId, userRole = 'customer') => {
  const query = id.startsWith('IMV-') ? { bookingId: id } : { _id: id };
  const booking = await Booking.findOne(query)
    .populate('movie')
    .populate('theatre')
    .populate('user', 'username email');

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Security rule: users must not access other users' private bookings
  if (userRole !== 'admin' && booking.user._id.toString() !== userId.toString()) {
    throw new AppError('Access forbidden: you do not have permission to view this booking', 403);
  }

  return booking;
};

/**
 * Cancel a booking according to cancellation policy (up to 2 hours before showtime)
 */
export const cancelBooking = async (id, userId, userRole = 'customer') => {
  const booking = await getBookingById(id, userId, userRole);

  if (booking.status === 'cancelled') {
    throw new AppError('This booking is already cancelled', 400);
  }

  const now = new Date();
  const showTime = new Date(booking.showTime);
  const diffHours = (showTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Cancellation rule: at least 2 hours before show
  if (userRole !== 'admin' && diffHours < 2) {
    throw new AppError(
      'Cancellations are only permitted up to 2 hours before the scheduled showtime.',
      400
    );
  }

  // Release seats back to available on the show
  const show = await Show.findById(booking.show);
  if (show) {
    const bookedSeatIds = new Set(booking.seats.map((s) => s.seatId));
    show.seats.forEach((seat) => {
      if (bookedSeatIds.has(seat.seatId) && seat.bookingId?.toString() === booking._id.toString()) {
        seat.status = 'available';
        seat.bookingId = null;
        seat.lockedBy = null;
        seat.lockedUntil = null;
      }
    });
    await show.save();
  }

  // Mark booking as cancelled with simulated refund
  const refundAmount = Math.round(booking.subtotal * 0.85); // 85% refund (15% cancellation fee)
  booking.status = 'cancelled';
  booking.paymentDetails.status = 'refunded';
  booking.cancellation = {
    cancelledAt: now,
    reason: 'Customer initiated cancellation',
    refundAmount,
    refundStatus: 'simulated_refunded',
  };

  await booking.save();
  return { booking, releasedSeatIds: booking.seats.map((s) => s.seatId), showId: booking.show };
};

/**
 * Admin: List all bookings across the platform
 */
export const listAllBookingsAdmin = async (query = {}) => {
  const { status, search, limit = 25, page = 1 } = query;
  const filter = {};

  if (status) filter.status = status;
  if (search && search.trim()) {
    filter.$or = [
      { bookingId: { $regex: search.trim(), $options: 'i' } },
      { 'movieSnapshot.title': { $regex: search.trim(), $options: 'i' } },
      { 'theatreSnapshot.name': { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    bookings,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / parseInt(limit, 10)),
  };
};

/**
 * Admin: Summary statistics for the dashboard
 */
export const getAdminStats = async () => {
  const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
  const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

  // Sum total revenue
  const revenueResult = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const totalMovies = await Movie.countDocuments({ status: { $ne: 'archived' } });
  const totalTheatres = await Theatre.countDocuments({ isActive: true });
  const totalUpcomingShows = await Show.countDocuments({
    startTime: { $gte: new Date() },
    isActive: true,
  });
  const totalUsers = await User.countDocuments();

  const recentBookings = await Booking.find()
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .limit(8);

  return {
    metrics: {
      totalRevenue,
      totalBookings,
      cancelledBookings,
      totalMovies,
      totalTheatres,
      totalUpcomingShows,
      totalUsers,
    },
    recentBookings,
  };
};

export default {
  calculateBookingPrice,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  listAllBookingsAdmin,
  getAdminStats,
};
