import api from './api';

export const getTheatres = async (params = {}) => {
  const res = await api.get('/theatres', { params });
  return res.data.data;
};

export const getTheatre = async (id) => {
  const res = await api.get(`/theatres/${id}`);
  return res.data.data;
};

export const createTheatre = async (theatreData) => {
  const res = await api.post('/theatres', theatreData);
  return res.data.data;
};

export const updateTheatre = async (id, theatreData) => {
  const res = await api.put(`/theatres/${id}`, theatreData);
  return res.data.data;
};

export const deleteTheatre = async (id) => {
  const res = await api.delete(`/theatres/${id}`);
  return res.data;
};

export default {
  getTheatres,
  getTheatre,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
