import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import bgLog from '../assets/bg-log.png';

interface LoginCredentials {
  email: string;
  password: string;
}

const Login = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiamos el error visual al intentar corregir los campos
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
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

      // Extraemos el token y la información del usuario de la respuesta
      const { token, ...userData } = response.data;
      
      // Guardamos la sesión en Zustand y LocalStorage
      login(token, userData);
      
      // Redirigimos según el rol
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
        navigate('/'); // Fallback
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("El abismo rechaza tus credenciales. Verifica tus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-abyss-bg-png overflow-hidden p-4">
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
      </form>
    </div>
  );
};

export default Login;
