import api from './api';

export const getMovies = async (params = {}) => {
  const res = await api.get('/movies', { params });
  return res.data.data;
};

export const getFeaturedMovies = async () => {
  const res = await api.get('/movies/featured');
  return res.data.data;
};

export const getMovie = async (id) => {
  const res = await api.get(`/movies/${id}`);
  return res.data.data;
};

export const createMovie = async (movieData) => {
  const res = await api.post('/movies', movieData);
  return res.data.data;
};

export const updateMovie = async (id, movieData) => {
  const res = await api.put(`/movies/${id}`, movieData);
  return res.data.data;
};

export const deleteMovie = async (id) => {
  const res = await api.delete(`/movies/${id}`);
  return res.data;
};

export const addReview = async (movieId, reviewData) => {
  const res = await api.post(`/movies/${movieId}/reviews`, reviewData);
  return res.data.data;
};

export const toggleFavorite = async (movieId) => {
  const res = await api.post(`/movies/${movieId}/favorite`);
  return res.data.data;
};

export default {
  getMovies,
  getFeaturedMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  addReview,
  toggleFavorite,
};
