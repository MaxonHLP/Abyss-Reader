import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerGrupos, obtenerCaracteristicas } from '../services/masterService';
import bgIcon from '../assets/bg icon.png';
import Navbar from '../components/Navbar';
import CreateGroupModal from '../components/modales/CreateGroupModal';
import CreateCharacteristicModal from '../components/modales/CreateCharacteristicModal';
import ManageCharacteristicsModal from '../components/modales/ManageCharacteristicsModal';
import type { CharacteristicType } from '../components/modales/CreateCharacteristicModal';

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  portada?: string;
}

interface Caracteristica {
  id?: number;
  nombre: string;
}

interface CaracteristicasState {
  generos: Caracteristica[];
  demografias: Caracteristica[];
  tipos: Caracteristica[];
}

const MasterDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'grupos' | 'caracteristicas'>('grupos');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<CaracteristicasState>({ generos: [], demografias: [], tipos: [] });
  const [loading, setLoading] = useState(true);

  // Estados de Modales
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isManageCharModalOpen, setIsManageCharModalOpen] = useState(false);
  const [currentCharType, setCurrentCharType] = useState<CharacteristicType>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [gruposData, caracteristicasData] = await Promise.all([
        obtenerGrupos(),
        obtenerCaracteristicas()
      ]);
      setGrupos(gruposData);
      setCaracteristicas(caracteristicasData);
    } catch (error) {
      console.error("Error al cargar datos del dashboard administrativo", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-abyss-bg-Master">
      <Navbar />

      {/* Fondo PNG al 85% de solidez */}
      <img 
        src={bgIcon} 
        alt="Fondo Icono" 
        className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none z-0" 
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center p-8 mt-4">
        {/* titulo */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-center uppercase tracking-widest text-abyss-text-title-Master drop-shadow-lg">
          Observa tus dominios
        </h1>

        {/* Barra de Navegación Interna (Tabs) */}
        <div className="flex justify-center mb-10 border-b-2 border-abyss-border-button-on-sec-master/30 w-full max-w-2xl">
          <button
            onClick={() => setActiveTab('grupos')}
            className={`flex-1 py-4 font-bold text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'grupos' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Grupos
          </button>
          <button
            onClick={() => setActiveTab('caracteristicas')}
            className={`flex-1 py-4 font-bold text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'caracteristicas' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Características
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-abyss-text-title-Master"></div>
          </div>
        ) : (
          <div className="w-full transition-opacity duration-500">
            {activeTab === 'grupos' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Botón Crear Grupo */}
                <div onClick={() => setIsGroupModalOpen(true)} className="bg-abyss-bg-card-crear-gp border-2 border-abyss-border-card-crear-gp rounded-2xl flex flex-col items-center justify-center p-8 min-h-[300px] cursor-pointer hover:opacity-80 transition-opacity shadow-lg group">
                  <div className="w-16 h-16 rounded-full bg-abyss-border-card-crear-gp flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl text-abyss-text-card-crear-gp font-bold">+</span>
                  </div>
                  <h3 className="text-xl font-bold text-abyss-text-card-crear-gp text-center">Crear Nuevo Grupo</h3>
                </div>

                {/* Listado de Grupos */}
                {grupos.length > 0 && grupos.map((grupo, index) => (
                  <div key={index} onClick={() => navigate(`/grupos/${grupo.id}`)} className="relative border-2 border-abyss-border-card-gp rounded-2xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300 h-[300px] group cursor-pointer">
                    {grupo.portada ? (
                      <img src={grupo.portada} alt={grupo.nombre} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <span className="text-abyss-text-card-gp font-medium opacity-70">Sin Portada</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full h-[85px] py-3 px-5 bg-abyss-bg-text-card-gp/65 backdrop-blur-sm flex flex-col justify-center z-10 border-t border-abyss-border-card-gp/30">
                      <h3 className="text-lg font-bold mb-1 text-abyss-text-card-gp truncate drop-shadow-md">{grupo.nombre}</h3>
                      <p className="text-abyss-text-card-gp text-sm font-medium line-clamp-2 truncate drop-shadow-md">{grupo.descripcion}</p>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                
                {/* Generos */}
                <div className="bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2">
                    Géneros
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-6 flex-1">
                    {caracteristicas.generos.length > 0 ? caracteristicas.generos.map((g: Caracteristica, i: number) => (
                      <span key={i} className="px-4 py-2 bg-abyss-bg-item-select text-abyss-text-item-select border border-abyss-border-item-select rounded-lg font-bold shadow-md opacity-90 hover:opacity-100 transition-opacity cursor-default">
                        {g.nombre}
                      </span>
                    )) : <p className="text-abyss-text-select-sec-master opacity-70 italic text-sm">Vacio.</p>}
                  </div>
                  <button onClick={() => { setCurrentCharType('genero'); setIsCharModalOpen(true); }} className="w-full bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-3 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 mb-3">
                    + Crear Género
                  </button>
                  <button onClick={() => { setCurrentCharType('genero'); setIsManageCharModalOpen(true); }} className="w-full bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc py-2 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 text-sm opacity-90 hover:opacity-100">
                    Gestionar Géneros
                  </button>
                </div>

                {/* Demografías */}
                <div className="bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2">
                    Demografías
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-6 flex-1">
                    {caracteristicas.demografias.length > 0 ? caracteristicas.demografias.map((d: Caracteristica, i: number) => (
                      <span key={i} className="px-4 py-2 bg-abyss-bg-item-select text-abyss-text-item-select border border-abyss-border-item-select rounded-lg font-bold shadow-md opacity-100 hover:brightness-110 transition-all cursor-default">
                        {d.nombre}
                      </span>
                    )) : <p className="text-abyss-text-select-sec-master opacity-70 italic text-sm">Vacio.</p>}
                  </div>
                  <button onClick={() => { setCurrentCharType('demografia'); setIsCharModalOpen(true); }} className="w-full bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-3 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 mb-3">
                    + Crear Demografía
                  </button>
                  <button onClick={() => { setCurrentCharType('demografia'); setIsManageCharModalOpen(true); }} className="w-full bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc py-2 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 text-sm opacity-90 hover:opacity-100">
                    Gestionar Demografías
                  </button>
                </div>

                {/* Tipos */}
                <div className="bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2">
                    Tipos
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-6 flex-1">
                    {caracteristicas.tipos.length > 0 ? caracteristicas.tipos.map((t: Caracteristica, i: number) => (
                      <span key={i} className="px-4 py-2 bg-abyss-bg-item-select text-abyss-text-item-select border border-abyss-border-item-select rounded-lg font-bold shadow-md opacity-80 hover:opacity-100 transition-opacity cursor-default">
                        {t.nombre}
                      </span>
                    )) : <p className="text-abyss-text-select-sec-master opacity-70 italic text-sm">Vacio.</p>}
                  </div>
                  <button onClick={() => { setCurrentCharType('tipo'); setIsCharModalOpen(true); }} className="w-full bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-3 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 mb-3">
                    + Crear Tipo
                  </button>
                  <button onClick={() => { setCurrentCharType('tipo'); setIsManageCharModalOpen(true); }} className="w-full bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc py-2 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 text-sm opacity-90 hover:opacity-100">
                    Gestionar Tipos
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales Transaccionales */}
      <CreateGroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <CreateCharacteristicModal 
        isOpen={isCharModalOpen} 
        type={currentCharType} 
        onClose={() => setIsCharModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <ManageCharacteristicsModal
        isOpen={isManageCharModalOpen}
        type={currentCharType}
        onClose={() => setIsManageCharModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default MasterDashboard;
