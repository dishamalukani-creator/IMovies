import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';
import Movie from '../models/Movie.js';
import { AppError } from '../utils/AppError.js';

/**
 * Generate seat array for a show based on theatre screen layout
 */
export const generateSeatLayout = (screen, pricingOverrides = []) => {
  const seats = [];
  const layout = screen.seatingLayout || {};
  const rows = layout.rows || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = layout.columnsPerRow || 12;
  const seatCategories = layout.seatCategories || [
    { category: 'Platinum', rows: ['A', 'B'], basePrice: 350 },
    { category: 'Gold', rows: ['C', 'D', 'E'], basePrice: 250 },
    { category: 'Silver', rows: ['F', 'G', 'H'], basePrice: 150 },
  ];

  rows.forEach((rowLetter) => {
    // Find category for this row
    let category = 'Standard';
    const catConfig = seatCategories.find((c) => c.rows && c.rows.includes(rowLetter));
    if (catConfig) {
      category = catConfig.category;
    }

    for (let colNum = 1; colNum <= cols; colNum++) {
      seats.push({
        seatId: `${rowLetter}${colNum}`,
        row: rowLetter,
        number: colNum,
        category,
        status: 'available',
        lockedBy: null,
        lockedUntil: null,
        bookingId: null,
      });
    }
  });

  return seats;
};

export const createShow = async (showData) => {
  const { movie: movieId, theatre: theatreId, screenNumber = 1, startTime, endTime, pricing } = showData;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new AppError('Specified movie not found', 404);
  }

  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    throw new AppError('Specified theatre not found', 404);
  }

  const screen = theatre.screens.find((s) => s.screenNumber === parseInt(screenNumber, 10)) || theatre.screens[0];
  if (!screen) {
    throw new AppError(`Screen ${screenNumber} does not exist in theatre '${theatre.name}'`, 400);
  }

  // Calculate end time if not explicitly provided
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date(start.getTime() + (movie.durationMinutes + 30) * 60 * 1000);

  // Check for scheduling collision on the same screen
  const collision = await Show.findOne({
    theatre: theatreId,
    screenNumber: screen.screenNumber,
    isActive: true,
    $or: [
      { startTime: { $lt: end, $gte: start } },
      { endTime: { $gt: start, $lte: end } },
    ],
  });

  if (collision) {
    throw new AppError(
      `Screen ${screen.screenNumber} is already scheduled for another screening between ${collision.startTime.toLocaleTimeString()} and ${collision.endTime.toLocaleTimeString()}`,
      409
    );
  }

  // Generate initial seat availability grid
  const seats = generateSeatLayout(screen, pricing);

  // Fallback pricing from layout categories
  const calculatedPricing = pricing && pricing.length > 0
    ? pricing
    : (screen.seatingLayout.seatCategories || []).map((sc) => ({
        category: sc.category,
        price: sc.basePrice,
      }));

  const show = await Show.create({
    movie: movieId,
    theatre: theatreId,
    screenNumber: screen.screenNumber,
    screenName: screen.name,
    startTime: start,
    endTime: end,
    pricing: calculatedPricing,
    seats,
  });

  return show;
};

export const listShows = async (query = {}) => {
  const { movie, theatre, date, city } = query;
  const filter = { isActive: true };

  if (movie) filter.movie = movie;
  if (theatre) filter.theatre = theatre;

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.startTime = { $gte: startOfDay, $lte: endOfDay };
  } else {
    // Default to future shows only
    filter.startTime = { $gte: new Date() };
  }

  let showsQuery = Show.find(filter)
    .populate('movie', 'title posterUrl durationMinutes certification rating genres')
    .populate('theatre', 'name identifier location amenities screens')
    .sort({ startTime: 1 });

  const shows = await showsQuery;

  // Filter by city if requested
  if (city && city !== 'All') {
    return shows.filter(
      (s) => s.theatre && s.theatre.location && s.theatre.location.city.toLowerCase() === city.toLowerCase()
    );
  }

  return shows;
};

export const getShowById = async (id) => {
  const show = await Show.findById(id)
    .populate('movie')
    .populate('theatre');

  if (!show) {
    throw new AppError('Show not found', 404);
  }

  // Auto-clean expired locks
  const now = new Date();
  let hasExpiredLocks = false;

  show.seats.forEach((seat) => {
    if (seat.status === 'locked' && seat.lockedUntil && seat.lockedUntil < now) {
      seat.status = 'available';
      seat.lockedBy = null;
      seat.lockedUntil = null;
      hasExpiredLocks = true;
    }
  });

  if (hasExpiredLocks) {
    await show.save();
  }

  // Get screen seating layout details for the frontend seat renderer
  const screen = show.theatre.screens.find((s) => s.screenNumber === show.screenNumber) || show.theatre.screens[0];

  return {
    show,
    screenLayout: screen?.seatingLayout || null,
    availability: show.getAvailabilitySummary(),
  };
};

/**
 * Temporarily lock seats for checkout (10-minute hold)
 */
export const lockSeats = async (showId, seatIds, userId, durationMs = 600000) => {
  if (!seatIds || seatIds.length === 0) {
    throw new AppError('At least one seat must be selected', 400);
  }

  const show = await Show.findById(showId);
  if (!show) {
    throw new AppError('Show not found', 404);
  }

  const now = new Date();
  const lockExpires = new Date(now.getTime() + durationMs);

  // Check all requested seats
  const unavailableSeats = [];
  const requestedSeatMap = new Set(seatIds);

  show.seats.forEach((seat) => {
    if (requestedSeatMap.has(seat.seatId)) {
      // Check if already booked
      if (seat.status === 'booked') {
        unavailableSeats.push({ seatId: seat.seatId, reason: 'Already booked' });
      } else if (
        seat.status === 'locked' &&
        seat.lockedUntil &&
        seat.lockedUntil > now &&
        seat.lockedBy?.toString() !== userId.toString()
      ) {
        unavailableSeats.push({ seatId: seat.seatId, reason: 'Reserved by another user' });
      }
    }
  });

  if (unavailableSeats.length > 0) {
    throw new AppError(
      `Some of the selected seats are no longer available: ${unavailableSeats.map((s) => s.seatId).join(', ')}`,
      409,
      unavailableSeats
    );
  }

  // Lock the seats
  show.seats.forEach((seat) => {
    if (requestedSeatMap.has(seat.seatId)) {
      seat.status = 'locked';
      seat.lockedBy = userId;
      seat.lockedUntil = lockExpires;
    }
  });

  await show.save();

  return {
    lockedSeats: seatIds,
    lockedUntil: lockExpires,
  };
};

/**
 * Release seats locked by the current user
 */
export const releaseSeats = async (showId, seatIds, userId) => {
  const show = await Show.findById(showId);
  if (!show) {
    throw new AppError('Show not found', 404);
  }

  const targetSeats = new Set(seatIds);

  show.seats.forEach((seat) => {
    if (
      targetSeats.has(seat.seatId) &&
      seat.status === 'locked' &&
      seat.lockedBy?.toString() === userId.toString()
    ) {
      seat.status = 'available';
      seat.lockedBy = null;
      seat.lockedUntil = null;
    }
  });

  await show.save();
  return { releasedSeats: seatIds };
};

export const deleteShow = async (id) => {
  const show = await Show.findByIdAndDelete(id);
  if (!show) {
    throw new AppError('Show not found', 404);
  }
  return show;
};

export default {
  createShow,
  listShows,
  getShowById,
  lockSeats,
  releaseSeats,
  deleteShow,
  generateSeatLayout,
};
