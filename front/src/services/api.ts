import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:8080/api';
  // Asegura que siempre tenga el sufijo /api, sin importar cómo se haya configurado en Vercel
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Interceptor para inyectar automáticamente el token JWT en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const { user, logout } = useAuthStore.getState();
      if (user && ['MIEMBRO', 'MIEMBRO_ADMIN', 'MASTER'].includes(user.rol)) {
        logout();
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
