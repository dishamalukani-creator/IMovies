import api from './api';

export const register = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const adminLogin = async (credentials) => {
  const res = await api.post('/auth/admin/login', credentials);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data.data.account;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Ignore error if session expired
  }
};

export default {
  register,
  login,
  adminLogin,
  getMe,
  logout,
};
