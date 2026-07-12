import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
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

    // Interceptar error de protección Demo
    if (
      error.response &&
      error.response.status === 403 &&
      (error.response.data === 'DEMO_RESTRICTION' || error.response.data?.message === 'DEMO_RESTRICTION')
    ) {
      window.dispatchEvent(new CustomEvent('demo:restriction'));
      // Retornar un error modificado para que el catch del componente pueda decidir si mostrar algo más
      return Promise.reject(new Error('Modo Demostración activo. Acción bloqueada.'));
    }

    return Promise.reject(error);
  }
);

export default api;
