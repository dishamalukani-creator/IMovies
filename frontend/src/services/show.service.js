import api from './api';

export const getShows = async (params = {}) => {
  const res = await api.get('/shows', { params });
  return res.data.data;
};

export const getShow = async (id) => {
  const res = await api.get(`/shows/${id}`);
  return res.data.data;
};

export const lockSeats = async (showId, seatIds) => {
  const res = await api.post(`/shows/${showId}/lock-seats`, { seatIds });
  return res.data.data;
};

export const releaseSeats = async (showId, seatIds) => {
  const res = await api.post(`/shows/${showId}/release-seats`, { seatIds });
  return res.data.data;
};

export const createShow = async (showData) => {
  const res = await api.post('/shows', showData);
  return res.data.data;
};

export const deleteShow = async (id) => {
  const res = await api.delete(`/shows/${id}`);
  return res.data;
};

export default {
  getShows,
  getShow,
  lockSeats,
  releaseSeats,
  createShow,
  deleteShow,
};
