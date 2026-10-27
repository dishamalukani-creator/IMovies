import api from './api';

export const checkoutBooking = async (checkoutData) => {
  const res = await api.post('/bookings/checkout', checkoutData);
  return res.data.data;
};

export const getMyBookings = async () => {
  const res = await api.get('/bookings/my-bookings');
  return res.data.data;
};

export const getBooking = async (id) => {
  const res = await api.get(`/bookings/${id}`);
  return res.data.data;
};

export const cancelBooking = async (id) => {
  const res = await api.post(`/bookings/${id}/cancel`);
  return res.data;
};

export const getAllBookingsAdmin = async (params = {}) => {
  const res = await api.get('/bookings/admin/all', { params });
  return res.data.data;
};

export const getAdminStats = async () => {
  const res = await api.get('/bookings/admin/stats');
  return res.data.data;
};

export default {
  checkoutBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookingsAdmin,
  getAdminStats,
};
