import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ragconsole.riequation.com/api';

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  }
});

export default axiosInstance;
