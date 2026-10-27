import api from './api';

export const getHealthStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    // If backend returns 503 degraded, the response data is still in error.data
    if (error.data) {
      return error.data;
    }
    throw error;
  }
};

export default {
  getHealthStatus,
};
