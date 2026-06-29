import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import bgLog from '../assets/bg-log.png';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiamos el error visual al intentar corregir los campos
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor, verifica e inténtalo de nuevo.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        nombre: formData.nombre,
        mail: formData.email,
        contrasena: formData.password
      });

      // Si el registro es exitoso, lo enviamos al login para que inicie sesión
      navigate('/login');
    } catch (err) {
      console.error("Error en registro:", err);
      // Intentamos obtener el mensaje de error del backend de forma segura usando un Type Guard
      if (axios.isAxiosError(err)) {
        const backendMessage = err.response?.data?.message || err.response?.data;
        if (typeof backendMessage === 'string') {
          setError(backendMessage);
          return;
        }
      }
      setError("Error al registrarse. Puede que el email ya pertenezca a otro cultista.");
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
            Un nuevo culto emerge del abismo
          </h1>
          <p className="text-abyss-text-muted font-medium">
            Regístrate
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar Contraseña"
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
          {isLoading ? 'Registrando...' : 'Regístrate'}
        </button>

        <div className="text-center mt-2">
          <Link 
            to="/login" 
            className="text-abyss-text-log font-semibold hover:text-abyss-text-muted transition-colors underline-offset-4 hover:underline"
          >
            ¿Ya perteneces al abismo? Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
