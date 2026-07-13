import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import api from '../services/api';
import CreateChapterModal from '../components/modales/CreateChapterModal';
import EditChapterModal from '../components/modales/EditChapterModal';
import EditWorkModal from '../components/modales/EditWorkModal';
import DeleteChapterModal from '../components/modales/DeleteChapterModal';
import Navbar from '../components/Navbar';
import CommentSection from '../components/comments/CommentSection';

type EstadoGuardado = 'SIGUIENDO' | 'LEYENDO' | 'LEIDO';

interface GuardadoResponseDTO {
  id: number;
  estado: EstadoGuardado;
  obraId: number;
  obraTitulo: string;
  obraPortada: string | null;
}

interface Capitulo {
  id: number;
  numero: number;
  createdAt: string | null;
  leido?: boolean;
}

interface ObraDetalle {
  id: number;
  titulo: string;
  descripcion: string | null;
  portada: string | null;
  vistas: number;
  likes: number;
  estado: string;
  tipoNombre: string | null;
  demografiaNombre: string | null;
  grupoNombre: string | null;
  grupoId: number | null;
  staffNombres: string[];
  generosNombres: string[];
  capitulos?: Capitulo[];
}

export default function Work() {
  const { obraNombre } = useParams<{ obraNombre: string }>();
  const [obra, setObra] = useState<ObraDetalle | null>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalEditarObraAbierto, setModalEditarObraAbierto] = useState(false);
  const [modalEliminarCapituloAbierto, setModalEliminarCapituloAbierto] = useState(false);
  // Estados para eliminar obra
  const [showDeleteObraConfirm, setShowDeleteObraConfirm] = useState(false);
  const [isDeletingObra, setIsDeletingObra] = useState(false);
  const [deleteObraError, setDeleteObraError] = useState<string | null>(null);
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado | ''>('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  // Estado optimista de likes
  const [localLikes, setLocalLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const { user } = useAuthStore();

  const navigate = useNavigate();
  
  const canEdit = Boolean(
    user && obra && (
      user.rol === 'MASTER' ||
      (user.rol === 'MIEMBRO_ADMIN' && user.grupoId === obra.grupoId) ||
      (user.rol === 'MIEMBRO' && user.grupoId === obra.grupoId && obra.staffNombres?.includes(user.nombre))
    )
  );

  const fetchObra = useCallback(async () => {
    if (!obraNombre) return;
    try {
      const response = await api.get(`/obra/${obraNombre}`);
      setObra(response.data);
    } catch (err) {
      console.error('Error fetching obra', err);
      setError('Obra no encontrada o hubo un error al cargarla.');
    }
  }, [obraNombre]);

  // Fetch separado de capitulos usando el ID de la obra
  const fetchCapitulos = useCallback(async (obraId: number) => {
    try {
      const response = await api.get<Capitulo[]>(`/obras/${obraId}/capitulos`);
      setCapitulos(response.data);
    } catch (err) {
      console.error('Error al cargar capítulos', err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchObra().then(() => { if (cancelled) return; });
    return () => { cancelled = true; };
  }, [fetchObra]);

  // Cuando se carga la obra, cargar capítulos, estado guardado y estado de like
  useEffect(() => {
    if (!obra?.id) return;
    fetchCapitulos(obra.id);
    setLocalLikes(obra.likes);

    if (user) {
      // Cargar estado guardado
      api.get<GuardadoResponseDTO[]>('/guardados')
        .then(res => {
          const guardado = res.data.find(g => g.obraId === obra.id);
          if (guardado) setEstadoGuardado(guardado.estado);
        })
        .catch(() => {});

      // Cargar estado de like
      api.get<{ liked: boolean }>(`/obras/${obra.id}/like`)
        .then(res => setLiked(res.data.liked))
        .catch(() => {});
    }
  }, [obra?.id, fetchCapitulos, user]);

  const handleGuardarEstado = async (nuevoEstado: EstadoGuardado | '') => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!obra) return;
    
    // Si se selecciona la misma opción, se deselecciona (toggle off)
    if (nuevoEstado === '' || nuevoEstado === estadoGuardado) {
      try {
        await api.delete(`/guardados/${obra.id}`);
        setEstadoGuardado('');
      } catch (err) {
        console.error('Error al eliminar guardado', err);
      }
      return;
    }
    
    setEstadoGuardado(nuevoEstado);
    setGuardandoEstado(true);
    try {
      await api.post('/guardados', { obraId: obra.id, estado: nuevoEstado });
    } catch (err) {
      console.error('Error al guardar estado de la obra', err);
    } finally {
      setGuardandoEstado(false);
    }
  };

  const handleVerCapitulo = (numero: number) => {
    navigate(`/obra/${obraNombre}/capitulo/${numero}`);
  };

  const handleChapterCreated = () => {
    if (obra?.id) {
      console.log('✅ Capítulo creado correctamente. Actualizando lista...');
      fetchCapitulos(obra.id);
    }
  };

  const handleEliminarObra = async () => {
    if (!obra) return;
    setIsDeletingObra(true);
    setDeleteObraError(null);
    try {
      await api.delete(`/obras/${obra.id}`);
      navigate(-1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string, error?: string } } };
      const errCode = e.response?.data?.error;
      if (errCode === 'DEMO_RESTRICTION') {
        useToastStore.getState().showToast('DATA_CORE', "Esta obra es un pilar del Abismo y no puede ser erradicada.");
        resetDeleteObraModal();
      } else if (errCode === 'DEMO_ISOLATION') {
        useToastStore.getState().showToast('ISOLATION', "No tienes poder sobre las obras de otro creador.");
        resetDeleteObraModal();
      } else {
        setDeleteObraError(e.response?.data?.message || 'Error de servidor.');
      }
    } finally {
      setIsDeletingObra(false);
    }
  };

  const resetDeleteObraModal = () => {
    setShowDeleteObraConfirm(false);
    setDeleteObraError(null);
  };

  // UI optimista de like
  const handleToggleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!obra || likeLoading) return;
    const prevLiked = liked;
    const prevLikes = localLikes;
    // Actualizar UI al instante (optimista)
    setLiked(!prevLiked);
    setLocalLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);
    setLikeLoading(true);
    try {
      const res = await api.post<{ liked: boolean; likes: number }>(`/obras/${obra.id}/like`);
      // Sincronizar con el valor real del backend
      setLiked(res.data.liked);
      setLocalLikes(res.data.likes);
    } catch {
      // Revertir en caso de error
      setLiked(prevLiked);
      setLocalLikes(prevLikes);
      alert('No se pudo procesar el like. Intentá de nuevo.');
    } finally {
      setLikeLoading(false);
    }
  };

  if (error) return <div className="min-h-screen bg-abyss-bg-obras text-red-500 flex items-center justify-center p-8">{error}</div>;
  if (!obra) return <div className="min-h-screen bg-abyss-bg-obras text-white flex items-center justify-center p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-abyss-bg-obras text-white flex flex-col w-full">
      <Navbar />
      <div className="flex flex-col items-center py-10 px-4 w-full">

      {/* Modal de creación de capítulo */}
      <CreateChapterModal
        isOpen={modalAbierto}
        obraId={obra.id}
        obraNombre={obra.titulo}
        capitulosExistentes={capitulos.map(c => c.numero)}
        onClose={() => setModalAbierto(false)}
        onSuccess={handleChapterCreated}
      />

      {/* Modal de edición de capítulo */}
      <EditChapterModal
        isOpen={modalEditarAbierto}
        obraId={obra.id}
        obraNombre={obra.titulo}
        onClose={() => setModalEditarAbierto(false)}
        onSuccess={() => { if (obra?.id) fetchCapitulos(obra.id); }}
      />

      {/* Modal de edición de obra */}
      <EditWorkModal
        isOpen={modalEditarObraAbierto}
        obraId={obra.id}
        onClose={() => setModalEditarObraAbierto(false)}
        onSuccess={() => { fetchObra(); }}
      />

      {/* Modal de eliminar capítulo */}
      <DeleteChapterModal
        isOpen={modalEliminarCapituloAbierto}
        capitulos={capitulos}
        onClose={() => setModalEliminarCapituloAbierto(false)}
        onSuccess={() => obra?.id && fetchCapitulos(obra.id)}
      />

      {/* Modal de eliminación de Obra (MASTER) */}
      {showDeleteObraConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetDeleteObraModal} />
          <div className="relative z-10 bg-abyss-bg-form-crear border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-300 uppercase tracking-wide">
                Eliminar Obra
              </h2>
            </div>

            <p className="text-abyss-text-titles-form-crear/80">
              ¿Estás seguro que deseas eliminar <span className="font-bold text-white">"{obra.titulo}"</span>?
              Esta acción es permanente e irreversible. Se eliminarán todos los capítulos y páginas asociados.
            </p>
            {deleteObraError && <p className="text-red-400 text-sm font-bold">{deleteObraError}</p>}
            <div className="flex gap-3">
              <button onClick={resetDeleteObraModal} className="flex-1 bg-abyss-bg-input-form-crear text-abyss-text-titles-form-crear border border-abyss-border-input-form-crear rounded-lg py-2.5 font-semibold hover:brightness-110 transition">
                Cancelar
              </button>
              <button onClick={handleEliminarObra} disabled={isDeletingObra} className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg py-2.5 transition">
                {isDeletingObra ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Obra */}
      <div className="w-full max-w-4xl bg-abyss-bg-card-obra rounded-xl p-6 shadow-lg border border-abyss-border-card-gp flex flex-col md:flex-row gap-8 mb-8">
        {/* Izquierda: Portada + Selector de Biblioteca */}
        <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-3">
          {obra.portada ? (
            <img src={obra.portada} alt={obra.titulo} className="w-full h-auto rounded-lg object-cover shadow-md" />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
              Sin portada
            </div>
          )}

          {/* Selector de biblioteca + Botón like */}
          <div className="flex items-center gap-2 w-full">
            {/* Select "Guardar como" rediseñado */}
            <div className="relative flex-1">
              <select
                id="biblioteca-select"
                value={estadoGuardado}
                onChange={e => handleGuardarEstado(e.target.value as EstadoGuardado | '')}
                disabled={guardandoEstado}
                className="w-full cursor-pointer appearance-none bg-abyss-bg-selecs text-abyss-text-name-option border border-abyss-border-input rounded-lg px-3 py-2 pr-8 font-semibold text-xs outline-none transition-all disabled:opacity-50 focus:ring-1 focus:ring-abyss-border-input"
              >
                <option value="">&#128218; Guardar como</option>
                <option value="SIGUIENDO">&#128065; Siguiendo</option>
                <option value="LEYENDO">&#128218; Leyendo</option>
                <option value="LEIDO">&#10003; Leído</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-abyss-text-name-option opacity-50">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            {/* Botón corazón / like */}
            <button
              onClick={handleToggleLike}
              disabled={likeLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 disabled:opacity-50 shrink-0"
              style={{
                background: liked
                  ? 'linear-gradient(135deg, #e11d48, #9f1239)'
                  : 'rgba(255,255,255,0.08)',
                border: liked ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.15)',
                color: liked ? '#fff' : 'rgba(255,255,255,0.7)',
              }}
              title={liked ? 'Quitar like' : 'Dar like'}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-150 ${liked ? 'scale-110' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{localLikes}</span>
            </button>
          </div>
        </div>

        {/* Derecha: Info de la obra */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-abyss-text-name-obra">{obra.titulo}</h1>
          </div>

          {/* Stats: Vistas y Likes (queda solo el contador de vistas) */}
          <div className="flex gap-4 mb-4 text-sm text-abyss-text-description-obra font-medium">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {obra.vistas} Vistas
            </span>
          </div>

          <p className="text-abyss-text-description-obra mb-4 text-lg flex-1">
            {obra.descripcion || 'Sin descripción disponible para esta obra.'}
          </p>

          {/* Grupo y Staff */}
          {obra.grupoNombre && (
            <div 
              className="mb-6 p-4 rounded-lg shadow-md border border-abyss-border-card-gp/30"
              style={{ backgroundColor: 'var(--color-abyss-bg-grupo-obra)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-abyss-text-description-obra font-bold">
                  Traducido por:
                </span>
                <span 
                  className="font-medium text-base cursor-pointer hover:underline tracking-wide" 
                  onClick={() => navigate(`/grupos/${obra.grupoId}`)}
                  style={{ color: 'var(--color-abyss-text-grupo-obra)', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  {obra.grupoNombre}
                </span>
              </div>
              {obra.staffNombres && obra.staffNombres.length > 0 && (
                <div className="text-abyss-text-description-obra text-sm mt-2 font-medium opacity-90">
                  <span className="font-bold">Staff: </span>
                  {obra.staffNombres.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Atributos: Tipo, Estado, Demografía */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            {obra.tipoNombre && (
              <span className="bg-abyss-bg-selecs text-abyss-text-name-option px-3 py-1 rounded text-xs font-bold uppercase shadow-sm border border-abyss-border-input">
                {obra.tipoNombre}
              </span>
            )}
            <span className="text-abyss-text-description-obra text-xs font-bold uppercase tracking-wider opacity-80">
              {obra.estado}
            </span>
            {obra.demografiaNombre && (
              <span className="text-abyss-text-description-obra text-sm font-semibold opacity-80">
                {obra.demografiaNombre}
              </span>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-abyss-title-generos-obra font-bold text-xl mb-3 uppercase tracking-wider">Géneros</h2>
            <div className="flex flex-wrap gap-2">
              {obra.generosNombres && obra.generosNombres.length > 0 ? (
                obra.generosNombres.map((genero, index) => (
                  <span key={index} className="bg-abyss-bg-item-select text-abyss-text-item-select px-3 py-1 rounded-full text-sm font-bold border border-abyss-border-item-select shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                    {genero}
                  </span>
                ))
              ) : (
                <span className="text-abyss-text-description-obra italic text-sm">Sin géneros asignados.</span>
              )}
            </div>
          </div>

          {/* Botones de Obra según rol */}
          {canEdit && (
            <div className="flex gap-4 mt-auto border-t border-abyss-border-card-gp/30 pt-4">
              <button 
                onClick={() => setModalEditarObraAbierto(true)}
                className="bg-abyss-bg-button-editar text-abyss-text-button-editar border border-abyss-border-button-editar px-5 py-2.5 rounded font-bold hover:brightness-110 transition shadow-sm"
              >
                Editar Obra
              </button>
              {user?.rol === 'MASTER' && (
                <button 
                  onClick={() => setShowDeleteObraConfirm(true)}
                  className="bg-abyss-bg-button-eliminar text-abyss-text-button-eliminar border border-abyss-border-button-eliminar px-5 py-2.5 rounded font-bold hover:brightness-110 transition shadow-sm"
                >
                  Eliminar Obra
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección Inferior: Card Capitulos + Botones */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Card Capitulos */}
        <div className="w-full md:w-[60%] bg-abyss-bg-card-capitulos rounded-xl p-6 shadow-lg border border-abyss-border-card-gp flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-abyss-text-name-obra mb-2">Capítulos</h2>

          <div className="flex flex-col gap-3">
            {capitulos.length === 0 ? (
              <p className="text-abyss-text-description-obra italic text-center py-6">
                Esta obra aún no tiene capítulos.
              </p>
            ) : (
              capitulos.map(cap => (
                <button
                  key={cap.id ?? cap.numero}
                  onClick={() => handleVerCapitulo(cap.numero)}
                  className="w-full bg-abyss-bg-boton-capituloX text-abyss-text-boton-capituloX border border-abyss-border-boton-capituloX rounded p-4 flex justify-between items-center hover:brightness-110 transition shadow-sm"
                >
                  <span className="font-bold flex items-center gap-2">
                    {cap.leido ? (
                      <svg className="w-5 h-5 text-[#439892]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                    Capítulo {cap.numero % 1 === 0 ? Math.floor(cap.numero) : cap.numero}
                  </span>
                  <span className="text-sm font-medium opacity-80">
                    {cap.createdAt
                      ? new Date(cap.createdAt).toLocaleDateString('es-AR')
                      : ''}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Botones de Capitulos a la derecha */}
        {canEdit && (
          <div className="w-full md:w-[40%] flex flex-col gap-4 pt-14">
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-abyss-bg-button-editar text-abyss-text-button-editar border border-abyss-border-button-editar px-5 py-3 rounded font-bold hover:brightness-110 transition shadow-sm w-full"
            >
              Subir Capitulo
            </button>
            <button
              onClick={() => setModalEditarAbierto(true)}
              disabled={capitulos.length === 0}
              className="bg-abyss-bg-button-eliminar text-abyss-text-button-eliminar border border-abyss-border-button-eliminar px-5 py-3 rounded font-bold hover:brightness-110 transition shadow-sm w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Editar Capitulo
            </button>
            <button
              onClick={() => setModalEliminarCapituloAbierto(true)}
              disabled={capitulos.length === 0}
              className="bg-red-900/70 text-red-200 border border-red-500/50 px-5 py-3 rounded font-bold hover:bg-red-900 transition shadow-sm w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Eliminar Capitulo
            </button>
          </div>
        )}
      </div>

      {/* Sección de Comentarios */}
      <div className="w-full max-w-4xl">
        <CommentSection obraId={obra.id} />
      </div>

      </div>
    </div>
  );
}

