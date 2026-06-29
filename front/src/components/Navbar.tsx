import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import iconCthulhu from '../assets/icono cthulhu.png';
import iconTitle from '../assets/icon tittle.png';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');

  const getRoleNav = () => {
    if (!isAuthenticated || !user || user.rol === 'LECTOR') {
      return { text: 'grupos', url: '/grupos' };
    } else if (user.rol === 'MIEMBRO_ADMIN' || user.rol === 'MIEMBRO') {
      return { text: 'Ver mi grupo', url: `/grupos/${user.grupoId || ''}` };
    } else if (user.rol === 'MASTER') {
      return { text: 'observar mis dominios', url: '/master' };
    }
    return { text: 'grupos', url: '/grupos' };
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/biblioteca?titulo=${encodeURIComponent(search)}`);
    }
  };

  const navInfo = getRoleNav();

  return (
    <>
    <nav className="w-full flex items-center justify-between px-6 py-0.5 shadow-md" style={{ backgroundColor: 'var(--color-abyss-navbar-bg)' }}>
      {/* Izquierda */}
      <div className="flex items-center gap-6">
        <img 
          src={iconCthulhu} 
          alt="Icono Cthulhu" 
          className="h-24 w-auto cursor-pointer"  
          onClick={() => navigate('/')} 
        />
        <button 
          onClick={() => navigate(navInfo.url)}
          className="font-bold cursor-pointer hover:brightness-110 transition uppercase tracking-wide text-sm"
          style={{ color: 'var(--color-abyss-navbar-text)' }}
        >
          {navInfo.text}
        </button>
      </div>

      {/* Centro */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <img 
          src={iconTitle} 
          alt="Title" 
          className="h-20 w-auto cursor-pointer" 
          onClick={() => navigate('/')}
        />
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="buscar ..."
            className="rounded-full px-5 py-3 w-80 md:w-96 lg:w-[500px] outline-none font-medium pr-10 text-base shadow-inner transition-colors focus:ring-2 focus:ring-opacity-50 focus:ring-(--color-abyss-navbar-text-searchbar)"
            style={{ 
              backgroundColor: 'var(--color-abyss-navbar-bg-searchbar)', 
              color: 'var(--color-abyss-navbar-text-searchbar)' 
            }}
          />
          <svg 
            className="w-5 h-5 absolute right-3 pointer-events-none" 
            style={{ color: 'var(--color-abyss-navbar-text-searchbar)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isAuthenticated && user && user.fotoPerfil ? (
          <img 
            src={user.fotoPerfil} 
            alt="Perfil" 
            className="w-11 h-11 rounded-full object-cover cursor-pointer hover:brightness-110 transition shadow-md border-2 border-[var(--color-abyss-navbar-icon-perfil)]"
            onClick={() => navigate('/perfil')}
          />
        ) : (
          <div 
            className="w-11 h-11 flex items-center justify-center rounded-full cursor-pointer hover:brightness-110 transition shadow-md bg-black/10"
            onClick={() => navigate('/perfil')}
          >
            <svg 
              className="w-8 h-8" 
              style={{ color: 'var(--color-abyss-navbar-icon-perfil)' }}
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
