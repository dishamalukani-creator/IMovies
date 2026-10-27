import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import { AppError } from '../utils/AppError.js';

export const listTheatres = async (query = {}) => {
  const { city, search, activeOnly = 'true' } = query;
  const filter = {};

  if (activeOnly === 'true') filter.isActive = true;
  if (city && city !== 'All') filter['location.city'] = { $regex: city, $options: 'i' };

  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { 'location.city': { $regex: search.trim(), $options: 'i' } },
      { identifier: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const theatres = await Theatre.find(filter).sort({ name: 1 });
  return theatres;
};

export const getTheatreById = async (id) => {
  const theatre = await Theatre.findById(id);
  if (!theatre) {
    throw new AppError('Theatre not found', 404);
  }

  // Also fetch today/upcoming shows
  const now = new Date();
  const shows = await Show.find({
    theatre: id,
    startTime: { $gte: now },
    isActive: true,
  })
    .populate('movie', 'title posterUrl genres durationMinutes certification rating')
    .sort({ startTime: 1 });

  return {
    theatre,
    shows,
  };
};

export const createTheatre = async (theatreData) => {
  // Check for unique identifier
  if (theatreData.identifier) {
    const existing = await Theatre.findOne({ identifier: theatreData.identifier.toUpperCase() });
    if (existing) {
      throw new AppError(`Theatre identifier '${theatreData.identifier}' already exists`, 409);
    }
  }

  // Setup default screen if none provided
  if (!theatreData.screens || theatreData.screens.length === 0) {
    theatreData.screens = [
      {
        screenNumber: 1,
        name: 'Screen 1 - Standard',
        seatingLayout: {
          rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
          columnsPerRow: 12,
          aisles: [4, 8],
          seatCategories: [
            { category: 'Platinum', rows: ['A', 'B'], basePrice: 350 },
            { category: 'Gold', rows: ['C', 'D', 'E'], basePrice: 250 },
            { category: 'Silver', rows: ['F', 'G', 'H'], basePrice: 150 },
          ],
        },
      },
    ];
  }

  const theatre = await Theatre.create(theatreData);
  return theatre;
};

export const updateTheatre = async (id, updateData) => {
  const theatre = await Theatre.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!theatre) {
    throw new AppError('Theatre not found', 404);
  }
  return theatre;
};

export const deleteTheatre = async (id) => {
  const theatre = await Theatre.findByIdAndDelete(id);
  if (!theatre) {
    throw new AppError('Theatre not found', 404);
  }
  await Show.deleteMany({ theatre: id, startTime: { $gt: new Date() } });
  return theatre;
};

export default {
  listTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
