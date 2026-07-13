import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { obtenerGrupoPorId } from '../services/groupService';
import { eliminarGrupo, eliminarMiembro } from '../services/masterService';
import CreateWorkModal from '../components/modales/CreateWorkModal';
import CreateMemberModal from '../components/modales/CreateMemberModal';
import EditGroupModal from '../components/modales/EditGroupModal';
import iconCthulhu from '../assets/icono cthulhu.png';
import Navbar from '../components/Navbar';

interface Obra {
  id: number;
  titulo: string;
  portada?: string;
  vistas: number;
  likes: number;
}

interface Miembro {
  id: number;
  nombre: string;
  rol: string;
  fotoPerfil?: string;
}

interface GrupoDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  portada?: string;
  obras: Obra[];
  miembros: Miembro[];
}

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [grupo, setGrupo] = useState<GrupoDetalle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'obras' | 'miembros'>('obras');
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Miembro | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  const isMaster = user?.rol === 'MASTER';
  // canManageContent: Master o (Admin y además pertenecer al grupo - en el frontend el Admin solo ve su grupo o asume si llegó aquí es de su grupo, pero igual validamos)
  const canManageContent = isMaster || (user?.rol === 'MIEMBRO_ADMIN' && user?.grupoId === Number(id));

  const fetchGroup = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await obtenerGrupoPorId(id);
      setGrupo(data);
    } catch (error) {
      console.error("Error al obtener el grupo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleDeleteGrupo = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await eliminarGrupo(id);
      navigate('/master');
    } catch (error: unknown) {
      console.error("Error al eliminar grupo:", error);
      const axiosErr = error as { response?: { data?: { error?: string, message?: string } } };
      const errCode = axiosErr.response?.data?.error;
      if (errCode === 'DEMO_RESTRICTION') {
        useToastStore.getState().showToast('DATA_CORE', "Este culto es un pilar del Abismo y no puede ser erradicado.");
        setShowDeleteConfirm(false);
      } else if (errCode === 'DEMO_ISOLATION') {
        useToastStore.getState().showToast('ISOLATION', "No tienes poder sobre los dominios de otro Maestro.");
        setShowDeleteConfirm(false);
      } else {
        setDeleteError(axiosErr.response?.data?.message || "Contraseña incorrecta o error de servidor");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    setIsDeletingMember(true);
    try {
      await eliminarMiembro(memberToDelete.id);
      fetchGroup(); // Recargar el grupo
      setMemberToDelete(null);
    } catch (error: unknown) {
      console.error("Error al eliminar miembro:", error);
      const axiosErr = error as { response?: { data?: { error?: string, message?: string } } };
      const errCode = axiosErr.response?.data?.error;
      if (errCode === 'DEMO_ISOLATION') {
        useToastStore.getState().showToast('ISOLATION', "No tienes poder sobre los dominios de otro Maestro.");
        setMemberToDelete(null);
      } else {
        alert(axiosErr.response?.data?.message || "Ocurrió un error al eliminar el miembro");
      }
    } finally {
      setIsDeletingMember(false);
    }
  };

  const canDeleteMiembro = (miembroRol: string) => {
    if (isMaster) return true;
    if (user?.rol === 'MIEMBRO_ADMIN' && miembroRol !== 'MIEMBRO_ADMIN') return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-abyss-bg-Master flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-abyss-text-title-Master"></div>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="min-h-screen bg-abyss-bg-Master flex items-center justify-center text-abyss-text-title-Master text-2xl font-bold">
        Grupo no encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-abyss-bg-Master flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-col md:flex-row p-4 md:p-8 overflow-hidden gap-4 md:gap-8 w-full max-w-7xl mx-auto">
      
      {/* Columna Izquierda: Portada del Grupo */}
      <div className="w-full md:w-1/4 flex flex-col items-center shrink-0">
        <div className="relative border-4 border-abyss-border-card-gp rounded-2xl overflow-hidden shadow-2xl w-full max-w-[250px] md:max-w-none aspect-3/4 mb-4">
          {grupo.portada ? (
            <img 
              src={grupo.portada} 
              alt={`Portada de ${grupo.nombre}`} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center">
              <span className="text-abyss-text-card-gp font-bold text-xl opacity-70">Sin Portada</span>
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha / Principal: Contenido */}
      <div className="w-full md:w-3/4 flex flex-col items-center md:items-start text-center md:text-left">
        {/* Cabecera del grupo */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-abyss-text-title-Master mb-2 uppercase tracking-wider drop-shadow-lg">
            {grupo.nombre}
          </h1>
          <p className="text-base md:text-xl text-abyss-text-title-Master opacity-80 font-medium">
            "{grupo.descripcion}"
          </p>
        </div>

        {/* Acciones de gestión de grupo */}
        {canManageContent && (
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mb-6">
            <button 
              onClick={() => setIsEditGroupModalOpen(true)} 
              className="bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-2 border-abyss-border-button-on-sec-master py-2 px-4 md:px-6 rounded-xl font-bold uppercase hover:brightness-110 transition-all shadow-md active:scale-95 text-xs md:text-sm"
            >
              Editar Culto
            </button>
            {isMaster && (
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="bg-red-900/80 text-white border-2 border-red-500 py-2 px-4 md:px-6 rounded-xl font-bold uppercase hover:bg-red-800 transition-all shadow-md active:scale-95 text-xs md:text-sm"
              >
                Eliminar Culto
              </button>
            )}
          </div>
        )}

        {/* Modal Inline para Confirmar Eliminación (Solo Master) */}
        {showDeleteConfirm && (
          <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center gap-4 animate-fade-in">
            <div className="flex-1 text-red-100 font-bold">
              ¿Estás seguro que deseas eliminar el grupo "{grupo.nombre}"?
            </div>
            <button 
              onClick={handleDeleteGrupo}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button 
              onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
              disabled={isDeleting}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            {deleteError && <div className="text-red-500 font-bold ml-2">{deleteError}</div>}
          </div>
        )}

        {/* Acciones de Contenido (Obras y Miembros) */}
        {canManageContent && (
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mb-6 md:mb-8 border-t border-abyss-border-card-gp pt-6 w-full">
            <button onClick={() => setIsWorkModalOpen(true)} className="flex-1 md:flex-none bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-2 px-4 md:px-6 rounded-xl font-bold uppercase hover:brightness-110 transition-all shadow-md active:scale-95 text-xs md:text-sm">
              + Agregar Obra
            </button>
            <button onClick={() => setIsMemberModalOpen(true)} className="flex-1 md:flex-none bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-2 px-4 md:px-6 rounded-xl font-bold uppercase hover:brightness-110 transition-all shadow-md active:scale-95 text-xs md:text-sm">
              + Agregar Miembro
            </button>
          </div>
        )}

        {/* Pestañas de Navegación */}
        <div className="flex justify-center md:justify-start mb-6 md:mb-8 border-b-2 border-abyss-border-button-on-sec-master/30 w-full max-w-xl mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('obras')}
            className={`flex-1 py-2 md:py-3 font-bold text-sm md:text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'obras' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Obras
          </button>
          <button
            onClick={() => setActiveTab('miembros')}
            className={`flex-1 py-2 md:py-3 font-bold text-sm md:text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'miembros' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Miembros del Staff
          </button>
        </div>

        {/* Contenido de Pestañas */}
        <div className="w-full h-full flex-1 transition-opacity duration-500">
          {activeTab === 'obras' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 px-2 md:px-0">
              {grupo.obras && grupo.obras.length > 0 ? (
                grupo.obras.map((obra) => (
                  <div
                    key={obra.id}
                    className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer aspect-3/4 hover:-translate-y-2 transition-transform duration-300"
                    onClick={() => navigate(`/obra/${encodeURIComponent(obra.titulo)}`)}
                  >
                    {/* Portada ocupando total de tarjeta sin bordes */}
                    {obra.portada ? (
                      <img 
                        src={obra.portada}
                        alt={`Portada de ${obra.titulo}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <span className="text-abyss-text-card-gp font-medium opacity-70 text-xs sm:text-base">Sin Portada</span>
                      </div>
                    )}
                    {/* Gradiente para mejorar legibilidad */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                    {/* Información de la Obra */}
                    <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4 flex flex-col justify-end z-10">
                      <h3 className="text-white font-bold text-sm sm:text-lg leading-tight mb-1 sm:mb-2 drop-shadow-md truncate">
                        {obra.titulo}
                      </h3>
                      {/* Contadores planos */}
                      <div className="flex gap-2 sm:gap-3 text-white/80 text-[10px] sm:text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          {obra.vistas}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                          {obra.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-abyss-text-title-Master text-base sm:text-lg font-medium opacity-80 py-8 text-center md:text-left">
                  No hay obras en este culto aún.
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl overflow-hidden shadow-2xl mx-auto md:mx-0">
              <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2 text-center md:text-left">
                  Staff del Culto
                </h3>
                {grupo.miembros && grupo.miembros.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {grupo.miembros.map((miembro) => (
                      <div key={miembro.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-abyss-bg-item-select border border-abyss-border-item-select rounded-xl shadow-md hover:brightness-110 transition-all text-left">
                        <img 
                          src={miembro.fotoPerfil || iconCthulhu} 
                          alt={miembro.nombre} 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-abyss-border-select-sec-master object-cover bg-abyss-bg-Master shrink-0"
                        />
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-abyss-text-item-select font-bold text-sm md:text-lg leading-tight truncate">
                            {miembro.nombre}
                          </span>
                          <span className="text-abyss-text-button-off-sec-master text-[10px] md:text-xs font-extrabold uppercase tracking-wider mt-0.5 md:mt-1 opacity-80 truncate">
                            {miembro.rol}
                          </span>
                        </div>
                        {/* Botón Eliminar (X) */}
                        {canManageContent && canDeleteMiembro(miembro.rol) && (
                          <button
                            onClick={() => setMemberToDelete(miembro)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-900/30 p-1.5 md:p-2 rounded-full transition-all shrink-0"
                            title="Eliminar miembro"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-abyss-text-select-sec-master text-base md:text-lg font-medium opacity-80 py-4 text-center md:text-left">
                    Sin miembros en el staff.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modales */}
      <CreateWorkModal 
        isOpen={isWorkModalOpen} 
        groupId={id || ''} 
        onClose={() => setIsWorkModalOpen(false)} 
        onSuccess={fetchGroup} 
      />
      <CreateMemberModal 
        isOpen={isMemberModalOpen} 
        groupId={id || ''} 
        onClose={() => setIsMemberModalOpen(false)} 
        onSuccess={fetchGroup} 
      />
      {grupo && (
        <EditGroupModal
          isOpen={isEditGroupModalOpen}
          groupId={id || ''}
          initialName={grupo.nombre}
          initialDescription={grupo.descripcion}
          initialPortada={grupo.portada}
          onClose={() => setIsEditGroupModalOpen(false)}
          onSuccess={fetchGroup}
        />
      )}

      {/* Modal Confirmar Eliminación de Miembro */}
      {memberToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity animate-fade-in">
          <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-sm border border-abyss-border-input-form-crear/30 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear text-center">
              Eliminar Miembro
            </h2>
            
            <p className="text-abyss-text-titles-form-crear/80 text-center text-sm">
              ¿Estás seguro de que deseas eliminar a <span className="font-bold text-abyss-text-titles-form-crear">{memberToDelete.nombre}</span> del staff?
            </p>
            
            <div className="flex gap-4 w-full mt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={isDeletingMember}
                className="flex-1 bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all opacity-80 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                disabled={isDeletingMember}
                className="flex-1 bg-red-600 text-white border-2 border-red-500 font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingMember ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GroupDetails;
