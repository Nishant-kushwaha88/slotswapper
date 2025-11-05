import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  signup: (name: string, email: string, password: string) =>
    api.post('/auth/signup', { name, email, password }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Event APIs
export const eventAPI = {
  getMyEvents: () => api.get('/events'),
  
  createEvent: (title: string, startTime: string, endTime: string, status: string) =>
    api.post('/events', { title, startTime, endTime, status }),
  
  updateEvent: (id: string, data: any) =>
    api.put(`/events/${id}`, data),
  
  deleteEvent: (id: string) =>
    api.delete(`/events/${id}`),
};

// Swap APIs
export const swapAPI = {
  getSwappableSlots: () => api.get('/swappable-slots'),
  
  getMySwappableSlots: () => api.get('/my-swappable-slots'),
  
  createSwapRequest: (mySlotId: string, theirSlotId: string) =>
    api.post('/swap-request', { mySlotId, theirSlotId }),
  
  getIncomingRequests: () => api.get('/incoming'),
  
  getOutgoingRequests: () => api.get('/outgoing'),
  
  respondToSwapRequest: (requestId: string, accept: boolean) =>
    api.post(`/swap-response/${requestId}`, { accept }),
};

export default api;