import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-abyss-bg-nav text-white flex flex-col">
      <Navbar />
      <div className="grow flex flex-col items-center justify-center p-4">
        <div className="bg-abyss-bg-selecs border border-abyss-border-input shadow-lg rounded-xl p-8 max-w-md w-full text-center">
          <svg className="w-24 h-24 text-abyss-text-barra-busqueda mx-auto mb-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-white mb-2">404</h1>
          <h2 className="text-xl text-abyss-text-barra-busqueda mb-6">Ruta no encontrada o inexistente</h2>
          <p className="text-abyss-text-name-option mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-abyss-title-selecs hover:bg-abyss-title-selecs/80 text-white font-bold rounded-lg transition-colors shadow-md"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
