import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import api from '../services/api';

interface Caracteristica {
  id: number;
  nombre: string;
}

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  portada?: string;
  likes: number;
  vistas: number;
  tipo?: Caracteristica;
  demografia?: Caracteristica;
  generos?: Caracteristica[];
  ultimosCapitulos?: {numero: number, createdAt: string}[];
}

export default function Home() {
  const navigate = useNavigate();

  // Estados de datos
  const [topLikes, setTopLikes] = useState<Obra[]>([]);
  const [generos, setGeneros] = useState<Caracteristica[]>([]);
  const [selectedGeneroId, setSelectedGeneroId] = useState<number | null>(null);
  const [obrasGenero, setObrasGenero] = useState<Obra[]>([]);
  const [obrasRecientes, setObrasRecientes] = useState<Obra[]>([]);
  
  // Paginación recientes
  const [recientesPage, setRecientesPage] = useState(0);
  const [hasMoreRecientes, setHasMoreRecientes] = useState(true);

  // 1. Cargar top likes
  useEffect(() => {
    api.get('/catalogo?sort=likes,desc&size=10')
      .then(res => setTopLikes(res.data.content || res.data))
      .catch(console.error);
  }, []);

  // 2. Cargar lista de géneros
  useEffect(() => {
    api.get('/generos')
      .then(res => {
        const gen = res.data || [];
        setGeneros(gen);
        if (gen.length > 0) {
          setSelectedGeneroId(gen[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // 3. Cargar top por género cuando cambia el género seleccionado
  useEffect(() => {
    if (selectedGeneroId === null) return;
    api.get(`/catalogo?generoId=${selectedGeneroId}&sort=vistas,desc&size=10`)
      .then(res => setObrasGenero(res.data.content || res.data))
      .catch(console.error);
  }, [selectedGeneroId]);

  // 4. Cargar recientes (con paginación)
  const fetchRecientes = (page: number) => {
    api.get(`/obras/recientes?page=${page}&size=20`)
      .then(async res => {
        const newObras = res.data.content || [];
        
        const obrasConCapitulos = await Promise.all(newObras.map(async (obra: Obra) => {
          try {
            const capRes = await api.get(`/obras/${obra.id}/capitulos`);
            const capitulos = capRes.data || [];
            const ultimos2 = capitulos.sort((a: {numero: number}, b: {numero: number}) => b.numero - a.numero).slice(0, 2);
            return { ...obra, ultimosCapitulos: ultimos2 };
          } catch {
            return { ...obra, ultimosCapitulos: [] };
          }
        }));

        if (page === 0) {
          setObrasRecientes(obrasConCapitulos);
        } else {
          setObrasRecientes(prev => [...prev, ...obrasConCapitulos]);
        }
        setHasMoreRecientes(!res.data.last);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRecientes(0);
  }, []);

  const handleVerMasRecientes = () => {
    const nextPage = recientesPage + 1;
    setRecientesPage(nextPage);
    fetchRecientes(nextPage);
  };

  const handleScrollGeneros = (direction: 'left' | 'right') => {
    const container = document.getElementById('generos-scroll-container');
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  // Renderizador de card reutilizable
  const renderObraCard = (obra: Obra) => (
    <div 
      key={obra.id} 
      onClick={() => navigate(`/obra/${obra.titulo}`)}
      className="bg-abyss-bg-card-gp rounded-xl overflow-hidden border border-abyss-border-card-gp hover:shadow-[0_0_20px_rgba(0,168,157,0.4)] transition-all duration-300 group cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-abyss-bg-selecs">
        {obra.portada ? (
          <img 
            src={obra.portada} 
            alt={obra.titulo} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-abyss-text-muted bg-abyss-bg-selecs/50">
            <span className="text-sm font-medium">Sin portada</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#012533]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {obra.tipo && (
            <span className="bg-abyss-bg-text-card-gp/90 text-abyss-text-card-gp text-xs font-black px-2.5 py-1 rounded shadow backdrop-blur-sm tracking-wide">
              {obra.tipo.nombre}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between bg-abyss-bg-card-gp relative z-10">
        <div>
          <h3 className="font-bold text-abyss-text-barra-busqueda line-clamp-2 text-sm md:text-base leading-snug mb-1 group-hover:text-white transition-colors">
            {obra.titulo}
          </h3>
          {obra.demografia && (
            <span className="text-xs text-abyss-text-name-option/90 font-medium">
              {obra.demografia.nombre}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecienteCard = (obra: Obra) => (
    <div 
      key={`reciente-${obra.id}`} 
      onClick={() => navigate(`/obra/${obra.titulo}`)}
      className="bg-abyss-bg-card-gp rounded-xl overflow-hidden border border-abyss-border-card-gp hover:shadow-[0_0_20px_rgba(0,168,157,0.4)] transition-all duration-300 group cursor-pointer flex h-[160px] transform hover:-translate-y-1"
    >
      <div className="w-1/3 relative overflow-hidden bg-abyss-bg-selecs h-full flex-shrink-0">
        {obra.portada ? (
          <img 
            src={obra.portada} 
            alt={obra.titulo} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-abyss-text-muted bg-abyss-bg-selecs/50">
            <span className="text-xs">Sin portada</span>
          </div>
        )}
      </div>
      <div className="w-2/3 p-4 flex flex-col bg-abyss-bg-card-gp relative z-10">
        <h3 className="font-bold text-abyss-text-barra-busqueda line-clamp-2 text-sm md:text-base leading-snug mb-2 group-hover:text-white transition-colors">
          {obra.titulo}
        </h3>
        <div className="flex-grow flex flex-col justify-end space-y-2">
          {obra.ultimosCapitulos && obra.ultimosCapitulos.length > 0 ? (
            obra.ultimosCapitulos.map((cap, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-abyss-text-name-option/90 font-medium bg-abyss-bg-item-select/50 px-2 py-0.5 rounded border border-abyss-border-item-select/50">
                  Cap. {cap.numero}
                </span>
                <span className="text-abyss-text-muted font-medium ml-1 truncate">
                  {new Date(cap.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-abyss-text-muted">Sin capítulos</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-abyss-bg-principal)' }}>
      <Navbar />

      <main className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 space-y-20">
        
        {/* SECCIÓN 1: Los más gustados */}
        <section>
          <h1 
            className="text-4xl font-black mb-8 text-center tracking-wider"
            style={{ color: 'var(--color-abyss-text-titles-principal)' }}
          >
            Los mas gustados
          </h1>
          <Carousel obras={topLikes} />
        </section>

        {/* SECCIÓN 2: Los más vistos de su género */}
        <section>
          <h1 
            className="text-4xl font-black mb-8 text-center tracking-wider"
            style={{ color: 'var(--color-abyss-text-titles-principal)' }}
          >
            Los mas vistos de su genero
          </h1>
          
          {/* Scroll horizontal de géneros */}
          <div className="relative mb-8 flex items-center justify-center max-w-5xl mx-auto">
            <button 
              onClick={() => handleScrollGeneros('left')}
              className="absolute left-0 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full hidden md:flex items-center justify-center h-10 w-10 -ml-5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div 
              id="generos-scroll-container"
              className="flex space-x-3 overflow-x-auto py-4 px-8 scrollbar-hide scroll-smooth w-full mx-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {generos.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setSelectedGeneroId(gen.id)}
                  className="whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95"
                  style={{
                    backgroundColor: selectedGeneroId === gen.id ? 'var(--color-abyss-text-filter-genero)' : 'var(--color-abyss-bg-filter-genero)',
                    color: selectedGeneroId === gen.id ? 'var(--color-abyss-bg-filter-genero)' : 'var(--color-abyss-text-filter-genero)',
                    border: `2px solid var(--color-abyss-text-filter-genero)`
                  }}
                >
                  {gen.nombre}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleScrollGeneros('right')}
              className="absolute right-0 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full hidden md:flex items-center justify-center h-10 w-10 -mr-5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Grid de resultados de género */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8">
            {obrasGenero.map(renderObraCard)}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate(`/biblioteca?generoId=${selectedGeneroId}&sort=vistas,desc`)}
              className="px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--color-abyss-bg-filter-genero)',
                color: 'var(--color-abyss-text-filter-genero)'
              }}
            >
              Ver todos
            </button>
          </div>
        </section>

        {/* SECCIÓN 3: Últimos actualizados */}
        <section>
          <h1 
            className="text-4xl font-black mb-10 text-center tracking-wider"
            style={{ color: 'var(--color-abyss-text-titles-principal)' }}
          >
            Ultimos actualizados
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {obrasRecientes.map(renderRecienteCard)}
          </div>

          {hasMoreRecientes && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleVerMasRecientes}
                className="px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 bg-white text-black"
                style={{
                  backgroundColor: 'var(--color-abyss-text-titles-principal)',
                  color: 'var(--color-abyss-bg-principal)'
                }}
              >
                Ver más
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
