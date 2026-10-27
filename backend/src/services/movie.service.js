import Movie from '../models/Movie.js';
import User from '../models/User.js';
import Show from '../models/Show.js';
import { AppError } from '../utils/AppError.js';

export const listMovies = async (query = {}) => {
  const { status, genre, search, language, featured, limit = 20, page = 1 } = query;
  const filter = {};

  if (status) filter.status = status;
  if (featured === 'true' || featured === true) filter.featured = true;
  if (genre && genre !== 'All') filter.genres = genre;
  if (language && language !== 'All') filter.languages = language;

  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { director: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Movie.countDocuments(filter);
  const movies = await Movie.find(filter)
    .sort({ featured: -1, releaseDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    movies,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / parseInt(limit, 10)),
  };
};

export const getMovieById = async (id) => {
  const movie = await Movie.findById(id);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  // Also fetch upcoming shows for this movie
  const now = new Date();
  const shows = await Show.find({
    movie: id,
    startTime: { $gte: now },
    isActive: true,
  })
    .populate('theatre', 'name location identifier amenities')
    .sort({ startTime: 1 });

  return {
    movie,
    shows,
  };
};

export const createMovie = async (movieData) => {
  const movie = await Movie.create(movieData);
  return movie;
};

export const updateMovie = async (id, updateData) => {
  const movie = await Movie.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }
  return movie;
};

export const deleteMovie = async (id) => {
  const movie = await Movie.findByIdAndDelete(id);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }
  // Soft-cancel or remove associated future shows
  await Show.deleteMany({ movie: id, startTime: { $gt: new Date() } });
  return movie;
};

export const addMovieReview = async (movieId, { userId, username, rating, comment }) => {
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  // Check if user already reviewed
  const existingReviewIndex = movie.reviews.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingReviewIndex >= 0) {
    movie.reviews[existingReviewIndex].rating = rating;
    movie.reviews[existingReviewIndex].comment = comment;
    movie.reviews[existingReviewIndex].createdAt = new Date();
  } else {
    movie.reviews.unshift({
      user: userId,
      username,
      rating,
      comment,
      createdAt: new Date(),
    });
  }

  movie.updateRatingSummary();
  await movie.save();
  return movie;
};

export const toggleFavorite = async (movieId, userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const index = user.favorites.indexOf(movieId);
  let isFavorite = false;

  if (index > -1) {
    user.favorites.splice(index, 1);
    isFavorite = false;
  } else {
    user.favorites.push(movieId);
    isFavorite = true;
  }

  await user.save();
  return { isFavorite, favorites: user.favorites };
};

export default {
  listMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  addMovieReview,
  toggleFavorite,
};
