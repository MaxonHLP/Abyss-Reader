import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { obtenerGrupos } from '../services/masterService';

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  portada?: string;
}

export default function Groups() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    obtenerGrupos()
      .then(data => setGrupos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--color-abyss-bg-principal)' }}>
      <Navbar />

      <main className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 space-y-12">
        <h1 
          className="text-4xl font-black text-center tracking-wider"
          style={{ color: 'var(--color-abyss-text-titles-principal)' }}
        >
          Grupos de Traducción
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-abyss-text-title-Master"></div>
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center text-xl font-medium opacity-80" style={{ color: 'var(--color-abyss-text-titles-principal)' }}>
            No hay grupos disponibles por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {grupos.map(grupo => (
              <div 
                key={grupo.id} 
                onClick={() => navigate(`/grupos/${grupo.id}`)}
                className="relative border-2 border-abyss-border-card-gp rounded-2xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300 h-[300px] group cursor-pointer"
              >
                {grupo.portada ? (
                  <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ backgroundImage: `url(${grupo.portada})` }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                    <span className="text-abyss-text-card-gp font-medium opacity-70">Sin Portada</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#012533]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                <div className="absolute bottom-0 left-0 w-full h-[85px] py-3 px-5 bg-abyss-bg-text-card-gp/65 backdrop-blur-sm flex flex-col justify-center z-10 border-t border-abyss-border-card-gp/30">
                  <h3 className="text-lg font-bold mb-1 text-abyss-text-card-gp truncate drop-shadow-md">
                    {grupo.nombre}
                  </h3>
                  <p className="text-abyss-text-card-gp text-sm font-medium line-clamp-2 truncate drop-shadow-md">
                    {grupo.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
