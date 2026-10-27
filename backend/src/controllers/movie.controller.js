import movieService from '../services/movie.service.js';

export const getMovies = async (req, res, next) => {
  try {
    const result = await movieService.listMovies(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedMovies = async (req, res, next) => {
  try {
    const result = await movieService.listMovies({ featured: true, limit: 6 });
    res.status(200).json({
      success: true,
      data: result.movies,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovie = async (req, res, next) => {
  try {
    const result = await movieService.getMovieById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await movieService.deleteMovie(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

export const postReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const movie = await movieService.addMovieReview(req.params.id, {
      userId: req.user.id,
      username: req.user.username,
      rating: Number(rating),
      comment,
    });

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleMovieFavorite = async (req, res, next) => {
  try {
    const result = await movieService.toggleFavorite(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMovies,
  getFeaturedMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  postReview,
  toggleMovieFavorite,
};
