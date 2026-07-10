import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { obtenerCaracteristicas } from '../services/masterService';
import Navbar from '../components/Navbar';

interface Caracteristica {
  id: number;
  nombre: string;
}

interface Obra {
  id: number;
  titulo: string;
  portada?: string;
  tipo?: Caracteristica;
  demografia?: Caracteristica;
  generos?: Caracteristica[];
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State for filter options
  const [tipos, setTipos] = useState<Caracteristica[]>([]);
  const [demografias, setDemografias] = useState<Caracteristica[]>([]);
  const [generos, setGeneros] = useState<Caracteristica[]>([]);
  
  // State for collapsing sections
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [generosOpen, setGenerosOpen] = useState(false);

  // State for works results
  const [obras, setObras] = useState<Obra[]>([]);
  
  // Load filter options on mount
  useEffect(() => {
    obtenerCaracteristicas().then((data) => {
      setGeneros(data.generos || []);
      setDemografias(data.demografias || []);
      setTipos(data.tipos || []);
    }).catch(console.error);
  }, []);

  // Fetch /api/catalogo when search params change
  useEffect(() => {
    const fetchObras = async () => {
      try {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        
        const response = await api.get('/catalogo', { params });
        // Handling paginated Spring Boot response if applicable
        if (response.data && Array.isArray(response.data.content)) {
          setObras(response.data.content);
        } else if (Array.isArray(response.data)) {
          setObras(response.data);
        }
      } catch (error) {
        console.error("Error fetching catalog", error);
      }
    };
    fetchObras();
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (text) {
      newParams.set('titulo', text);
    } else {
      newParams.delete('titulo');
    }
    setSearchParams(newParams);
  };

  const handleCheckboxChange = (category: string, id: number, checked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    const current = newParams.get(category);
    let ids = current ? current.split(',').filter(Boolean) : [];
    
    if (checked) {
      ids.push(id.toString());
    } else {
      ids = ids.filter(itemId => itemId !== id.toString());
    }

    if (ids.length > 0) {
      newParams.set(category, ids.join(','));
    } else {
      newParams.delete(category);
    }
    
    setSearchParams(newParams);
  };

  const isChecked = (category: string, id: number) => {
    const current = searchParams.get(category);
    if (!current) return false;
    return current.split(',').includes(id.toString());
  };

  return (
    <div className="min-h-screen bg-abyss-bg-nav text-white">
      <Navbar />

      {/* Main Content */}
      <main className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        
        {/* 2. Motor de búsqueda y Ordenamiento */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative w-full md:flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-abyss-text-barra-busqueda opacity-70 group-focus-within:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar título, autor..."
              value={searchParams.get('titulo') || ''}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-abyss-bg-barra-busqueda text-abyss-text-barra-busqueda placeholder-abyss-text-barra-busqueda/60 border border-abyss-border-input focus:outline-none focus:ring-2 focus:ring-abyss-text-barra-busqueda shadow-inner transition-all"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={searchParams.get('sort') || ''}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set('sort', e.target.value);
                } else {
                  newParams.delete('sort');
                }
                setSearchParams(newParams);
              }}
              className="w-full px-4 py-3 rounded-lg bg-abyss-bg-barra-busqueda text-abyss-text-barra-busqueda border border-abyss-border-input focus:outline-none focus:ring-2 focus:ring-abyss-text-barra-busqueda shadow-inner transition-all appearance-none cursor-pointer"
            >
              <option value="">Por defecto</option>
              <option value="vistas,desc">Vistas</option>
              <option value="likes,desc">Me Gustas</option>
            </select>
          </div>
        </div>

        {/* Controladores de filtro */}
        <div className="space-y-4 max-w-4xl mx-auto mb-10">
          
          {/* Primer selector: Filtros Generales */}
          <div className="rounded-lg overflow-hidden bg-abyss-bg-selecs border border-abyss-border-input shadow-md">
            <button 
              onClick={() => setFiltrosOpen(!filtrosOpen)}
              className="w-full px-5 py-4 text-left font-bold text-abyss-title-selecs bg-abyss-bg-selecs flex justify-between items-center hover:bg-abyss-bg-selecs/90 transition-colors"
            >
              <span className="text-lg tracking-wide uppercase">Filtros</span>
              <svg className={`w-5 h-5 transition-transform duration-300 ${filtrosOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${filtrosOpen ? 'max-h-[1000px] opacity-100 border-t border-abyss-border-input' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 md:p-6 bg-abyss-bg-filter-selecs grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                
                {/* Tipo */}
                <div>
                  <h3 className="text-abyss-title-option bg-abyss-bg-title-option px-4 py-1.5 mb-4 rounded font-bold uppercase tracking-wider text-sm shadow-sm inline-block">Tipo</h3>
                  <div className="flex flex-col space-y-3">
                    {tipos.map(tipo => (
                      <label key={tipo.id} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked('tipoId', tipo.id)}
                          onChange={(e) => handleCheckboxChange('tipoId', tipo.id, e.target.checked)}
                          className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                        />
                        <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors">{tipo.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Demografía */}
                <div>
                  <h3 className="text-abyss-title-option bg-abyss-bg-title-option px-4 py-1.5 mb-4 rounded font-bold uppercase tracking-wider text-sm shadow-sm inline-block">Demografía</h3>
                  <div className="flex flex-col space-y-3">
                    {demografias.map(demo => (
                      <label key={demo.id} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked('demografiaId', demo.id)}
                          onChange={(e) => handleCheckboxChange('demografiaId', demo.id, e.target.checked)}
                          className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                        />
                        <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors">{demo.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <h3 className="text-abyss-title-option bg-abyss-bg-title-option px-4 py-1.5 mb-4 rounded font-bold uppercase tracking-wider text-sm shadow-sm inline-block">Estado</h3>
                  <div className="flex flex-col space-y-3">
                    {['En emisión', 'Finalizado', 'Pausado'].map((estadoString, index) => {
                        const estadoValue = index === 0 ? 'EN_EMISION' : index === 1 ? 'FINALIZADO' : 'PAUSADO';
                        return (
                      <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked('estado', estadoValue as any)}
                          onChange={(e) => handleCheckboxChange('estado', estadoValue as any, e.target.checked)}
                          className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                        />
                        <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors">{estadoString}</span>
                      </label>
                    )})}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Segundo selector: Géneros */}
          <div className="rounded-lg overflow-hidden bg-abyss-bg-selecs border border-abyss-border-input shadow-md">
            <button 
              onClick={() => setGenerosOpen(!generosOpen)}
              className="w-full px-5 py-4 text-left font-bold text-abyss-title-selecs bg-abyss-bg-selecs flex justify-between items-center hover:bg-abyss-bg-selecs/90 transition-colors"
            >
              <span className="text-lg tracking-wide uppercase">Géneros</span>
              <svg className={`w-5 h-5 transition-transform duration-300 ${generosOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${generosOpen ? 'max-h-[2000px] opacity-100 border-t border-abyss-border-input' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 md:p-6 bg-abyss-bg-filter-selecs">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-3 md:gap-x-6">
                  {generos.map(genero => (
                    <label key={genero.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChecked('generoId', genero.id)}
                        onChange={(e) => handleCheckboxChange('generoId', genero.id, e.target.checked)}
                        className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                      />
                      <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors text-sm truncate" title={genero.nombre}>{genero.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Grid de Resultados */}
        <div className="mt-8 md:mt-12 px-2 md:px-0">
          {obras.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 xl:gap-8">
              {obras.map(obra => (
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
                        <svg className="w-10 h-10 md:w-12 md:h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs md:text-sm font-medium">Sin portada</span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#012533]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Top Badges */}
                    <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 flex flex-col gap-1">
                      {obra.tipo && (
                        <span className="bg-abyss-bg-text-card-gp/90 text-abyss-text-card-gp text-[10px] md:text-xs font-black px-1.5 py-0.5 md:px-2.5 md:py-1 rounded shadow backdrop-blur-sm tracking-wide">
                          {obra.tipo.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Info Section */}
                  <div className="p-2.5 sm:p-4 flex-grow flex flex-col justify-between bg-abyss-bg-card-gp relative z-10">
                    <div>
                      <h3 className="font-bold text-abyss-text-barra-busqueda line-clamp-2 text-sm md:text-base leading-snug mb-0.5 md:mb-1 group-hover:text-white transition-colors">
                        {obra.titulo}
                      </h3>
                      {obra.demografia && (
                        <span className="text-[10px] md:text-xs text-abyss-text-name-option/90 font-medium">
                          {obra.demografia.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <svg className="w-16 h-16 text-abyss-text-muted mb-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-abyss-text-barra-busqueda mb-2">Sin resultados</h3>
              <p className="text-abyss-text-name-option max-w-md">
                No se encontraron obras que coincidan con los filtros seleccionados. Intenta ajustando tu búsqueda.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
