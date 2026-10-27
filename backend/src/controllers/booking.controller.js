import bookingService from '../services/booking.service.js';

export const checkout = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const booking = await bookingService.createBooking({
      showId,
      seatIds,
      userId: req.user.id,
    });

    // Broadcast real-time seat update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${showId}`).emit('seats:booked', {
        showId,
        seatIds,
        bookingId: booking.bookingId,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully (Demo simulation transaction)',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.cancelBooking(
      req.params.id,
      req.user.id,
      req.user.role
    );

    // Broadcast released seats
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${result.showId}`).emit('seats:released', {
        showId: result.showId,
        seatIds: result.releasedSeatIds,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Simulated refund processed.',
      data: result.booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingService.listAllBookingsAdmin(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await bookingService.getAdminStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  checkout,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  getStats,
};
