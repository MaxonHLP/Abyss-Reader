import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import bgLog from '../assets/bg-log.png';
import Navbar from '../components/Navbar';

interface LoginCredentials {
  email: string;
  password: string;
}

// Tipos de error del sistema demo para mostrar banners diferenciados
type DemoErrorType = 'RATE_LIMIT' | 'CAPACITY_LIMIT' | null;

const Login = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<DemoErrorType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('session_expired') === 'true';

  const { login, loginWithReinit, getReinitToken, clearReinitToken } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDemoError(null);
    
    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { 
        mail: credentials.email, 
        contrasena: credentials.password 
      });

      const { token, ...userData } = response.data;
      login(token, userData);
      
      if (userData.rol === 'LECTOR') {
        navigate('/');
      } else if (userData.rol === 'MASTER') {
        navigate('/master');
      } else if (userData.rol === 'MIEMBRO_ADMIN' || userData.rol === 'MIEMBRO') {
        if (userData.grupoId) {
          navigate(`/grupos/${userData.grupoId}`);
        } else {
          navigate('/master');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("El abismo rechaza tus credenciales. Verifica tus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la creación/reanudación de una cuenta demo efímera.
   *
   * Flujo:
   * 1. Verifica si existe un reinitToken guardado para el rol solicitado.
   * 2. Si existe → envía el token como header X-Demo-Reinit-Token (reutiliza la cuenta).
   * 3. Si no → el backend crea una cuenta nueva.
   * 4. Maneja errores diferenciados: rate limit (429) y capacidad (503).
   */
  const handleDemoCreate = async (rol: string) => {
    setError(null);
    setDemoError(null);
    setIsLoading(true);

    // Verificar si hay un token de reinicio para este rol
    const reinitToken = getReinitToken(rol);

    try {
      const headers: Record<string, string> = {};
      if (reinitToken) {
        headers['X-Demo-Reinit-Token'] = reinitToken;
      }

      const response = await api.post('/auth/demo', { rol }, { headers });
      const { token, reinitToken: nuevoReinitToken, ...userData } = response.data;

      // Si viene reinitToken en la respuesta, usar loginWithReinit
      if (nuevoReinitToken) {
        loginWithReinit(token, userData, nuevoReinitToken);
      } else {
        login(token, userData);
      }

      // Redirigir según el rol recibido
      if (userData.rol === 'LECTOR') {
        navigate('/');
      } else if (userData.rol === 'MASTER') {
        navigate('/master');
      } else if (userData.rol === 'MIEMBRO_ADMIN' || userData.rol === 'MIEMBRO') {
        if (userData.grupoId) {
          navigate(`/grupos/${userData.grupoId}`);
        } else {
          navigate('/master');
        }
      } else {
        navigate('/');
      }

    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
      const status = axiosErr?.response?.status;
      const errorCode = axiosErr?.response?.data?.error;

      if (status === 429 || errorCode === 'RATE_LIMIT') {
        // La IP superó el límite de 6 cuentas en 6 horas
        setDemoError('RATE_LIMIT');
        // Si el reinitToken era inválido (falló), limpiar para próximos intentos
        if (reinitToken) clearReinitToken(rol);

      } else if (status === 503 || errorCode === 'CAPACITY_LIMIT') {
        // Se alcanzaron las 50 cuentas demo globales
        setDemoError('CAPACITY_LIMIT');

      } else {
        // Error genérico
        if (reinitToken) {
          // Si había reinitToken y falló por otro motivo, limpiar y reportar
          clearReinitToken(rol);
          setError("La sesión demo anterior expiró. Intenta nuevamente para crear una cuenta nueva.");
        } else {
          setError("Error al crear la cuenta demo. Inténtalo de nuevo.");
        }
        console.error("Error al crear cuenta demo:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-abyss-bg-png overflow-hidden">
      <Navbar />
      <div className="flex-1 w-full relative flex items-center justify-center p-4">
        {/* Imagen de fondo semitransparente superpuesta al color */}
        <img 
          src={bgLog} 
          alt="Fondo del Abismo" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none" 
        />
      
      {/* Contenedor del formulario */}
      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 bg-abyss-bg-log border border-abyss-text-log rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 shadow-2xl"
      >
        <div className="flex flex-col gap-2 text-center mb-2">
          <h1 className="text-2xl font-bold text-abyss-text-log">
            El abismo observa tu regreso
          </h1>
          <p className="text-abyss-text-muted font-medium">
            Inicia sesión
          </p>
        </div>

        {sessionExpired && (
          <div className="bg-red-900/40 border border-red-500 text-white px-4 py-3 rounded-lg text-center font-bold text-sm">
            Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Usuario / Email"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
        </div>

        {error && (
          <div className="text-red-700 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full bg-abyss-text-log text-abyss-text-input font-bold rounded-xl p-3 transition-opacity mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
        >
          {isLoading ? 'Iniciando sesión...' : 'Inicia sesión'}
        </button>

        <div className="text-center mt-2">
          <Link 
            to="/register" 
            className="text-abyss-text-log font-semibold hover:text-abyss-text-muted transition-colors underline-offset-4 hover:underline"
          >
            ¿El abismo te rechaza? Regístrate
          </Link>
        </div>

        {/* Botones de demostración — ahora crean cuentas dinámicas */}
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-abyss-text-log/30">
          <p className="text-xs text-center text-abyss-text-muted mb-1">
            ¿Quieres explorar sin registrarte?
          </p>

          {/* Banners de error diferenciados para el sistema demo */}
          {demoError === 'RATE_LIMIT' && (
            <div className="flex items-center gap-2 bg-orange-900/50 border border-orange-500 text-orange-200 px-4 py-3 rounded-lg text-sm font-semibold animate-pulse">
              <span>⚠️</span>
              <span>Superaste la creación de cuentas demo. Podrás crear más en unas horas.</span>
            </div>
          )}

          {demoError === 'CAPACITY_LIMIT' && (
            <div className="flex items-center gap-2 bg-blue-900/50 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg text-sm font-semibold">
              <span>🌊</span>
              <span>Actualmente se ha alcanzado el límite de cuentas de prueba, espera a que se liberen espacios.</span>
            </div>
          )}

          <button 
            id="demo-lector-btn"
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoCreate('LECTOR')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Creando acceso...' : '⚡ Acceder como lector demo'}
          </button>
          <button 
            id="demo-miembro-admin-btn"
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoCreate('MIEMBRO_ADMIN')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Creando acceso...' : '⚡ Acceder como Miembro Admin demo'}
          </button>
          <button 
            id="demo-master-btn"
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoCreate('MASTER')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Creando acceso...' : '⚡ Acceder como master demo'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default Login;
