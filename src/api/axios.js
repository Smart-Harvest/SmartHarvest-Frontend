import axios from 'axios';

const USER_API = import.meta.env.VITE_USER_API || 'http://localhost:8001';
const CROP_API = import.meta.env.VITE_CROP_API || 'http://localhost:8002';
const MARKET_API = import.meta.env.VITE_MARKET_API || 'http://localhost:8003';

function createApi(baseURL) {
  const instance = axios.create({ baseURL });

  // Attach JWT token to every request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle 401 responses globally
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const userApi = createApi(USER_API);
export const cropApi = createApi(CROP_API);
export const marketApi = createApi(MARKET_API);
