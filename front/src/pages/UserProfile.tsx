import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import cthulhuIcon from '../assets/icono cthulhu.png';
import bgLog from '../assets/bg-log.png';
import EditProfileModal from '../components/modales/EditProfileModal';
import Navbar from '../components/Navbar';


// ── Tipos ─────────────────────────────────────────────────────
type EstadoGuardado = 'SIGUIENDO' | 'LEYENDO' | 'LEIDO';
type TabActiva = 'historial' | 'guardados';

interface HistorialItem {
  id: number;
  obraId: number;
  obraTitulo: string;
  obraPortada: string | null;
  capituloId: number;
  capituloNumero: number;
  updatedAt: string;
}

interface GuardadoItem {
  id: number;
  estado: EstadoGuardado;
  obraId: number;
  obraTitulo: string;
  obraPortada: string | null;
}

// ── Helpers ───────────────────────────────────────────────────

function formatFecha(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Componente principal ───────────────────────────────────────
export default function UserProfile() {
  const { user, login, logout, token } = useAuthStore();
  const navigate = useNavigate();

  const [tabActiva, setTabActiva] = useState<TabActiva>('historial');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [descripcionPerfil, setDescripcionPerfil] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  // Cargar perfil completo del usuario
  useEffect(() => {
    api.get<{ nombre: string; mail: string; descripcion: string | null; fotoPerfil: string | null; rol: string }>('/usuarios/me')
      .then(res => {
        setDescripcionPerfil(res.data.descripcion);
        if (user && token) {
          login(token, {
            ...user,
            nombre: res.data.nombre,
            mail: res.data.mail,
            fotoPerfil: res.data.fotoPerfil,
            rol: res.data.rol
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Historial
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Guardados
  const [guardados, setGuardados] = useState<GuardadoItem[]>([]);
  const [loadingGuardados, setLoadingGuardados] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoGuardado>('SIGUIENDO');
  // Cargar historial al montar
  useEffect(() => {
    setLoadingHistorial(true);
    api.get<HistorialItem[]>('/historial')
      .then(res => setHistorial(res.data))
      .catch(err => console.error('Error cargando historial', err))
      .finally(() => setLoadingHistorial(false));
  }, []);

  // Cargar guardados una sola vez al montar
  useEffect(() => {
    setLoadingGuardados(true);
    api.get<GuardadoItem[]>('/guardados')
      .then(res => setGuardados(res.data))
      .catch(err => console.error('Error cargando guardados', err))
      .finally(() => setLoadingGuardados(false));
  }, []);

  // Filtro local de guardados (sin refetch)
  const guardadosFiltrados = guardados.filter(g => g.estado === filtroEstado);

  const estadoLabels: Record<EstadoGuardado, string> = {
    SIGUIENDO: 'Siguiendo',
    LEYENDO: 'Leyendo',
    LEIDO: 'Leído',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-abyss-bg-perfil)' }}>
      <Navbar />

      {/* ── Banner decorativo ── */}
      <div className="relative w-full h-[30vh] overflow-hidden shrink-0" style={{ background: 'var(--color-abyss-bg-png-perfil)' }}>
        <img
          src={bgLog}
          alt="Fondo de perfil"
          className="w-full h-full object-cover opacity-60 select-none"
          draggable={false}
        />
      </div>

      {/* ── Sección de perfil: avatar izq + nombre centro ── */}
      <div className="relative w-full max-w-5xl mx-auto px-2">
        <div className="flex items-start gap-4 -mt-12">

          {/* ── Columna izquierda: Avatar + descripción + botón ── */}
          <div className="flex flex-col items-center gap-3 shrink-0 z-10">
            {/* Avatar 2x (w-48 h-48 vs w-24 h-24 anterior) */}
            <div
              className="w-48 h-48 rounded-full overflow-hidden border-4 shadow-2xl"
              style={{ borderColor: 'var(--color-abyss-bg-png-perfil)' }}
            >
              <img
                src={user?.fotoPerfil ?? cthulhuIcon}
                alt={user?.nombre ?? 'Avatar'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Descripción */}
            <p className="text-xs text-center max-w-[180px] leading-relaxed" style={{ color: 'var(--color-abyss-text-capitulos)', opacity: descripcionPerfil ? 0.7 : 0.4 }}>
              {descripcionPerfil ?? 'Un lector más del abismo.'}
            </p>

            {/* Botón editar perfil */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_18px_rgba(0,235,219,0.3)]"
              style={{
                background: 'linear-gradient(135deg, #00EBDB22, #0099cc22)',
                border: '1px solid rgba(0,235,219,0.35)',
                color: '#00EBDB',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar perfil
            </button>

            {/* Botón cerrar sesión */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_18px_rgba(235,0,0,0.3)] mt-2"
              style={{
                background: 'linear-gradient(135deg, rgba(235,0,0,0.1), rgba(204,0,0,0.1))',
                border: '1px solid rgba(235,0,0,0.35)',
                color: '#ff4444',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>

          {/* ── Centro: Nombre de usuario ── */}
          <div className="flex-1 flex justify-center pt-16">
            <h1
              className="text-[1.7rem] font-bold text-center leading-tight"
              style={{ color: 'var(--color-abyss-text-capitulos)' }}
            >
              {user?.nombre ?? 'Lector'}
            </h1>
          </div>

          {/* ── Espacio derecho (balanceo visual) ── */}
          <div className="w-48 shrink-0" />
        </div>
      </div>

      {/* ── Tabs de navegación ── */}
      <div className="flex justify-center gap-2 px-4 mt-2 mb-4">
        {(['historial', 'guardados'] as TabActiva[]).map(tab => {
          const activo = tabActiva === tab;
          return (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className="px-8 py-2.5 rounded-t-lg font-semibold capitalize transition-all duration-200"
              style={
                activo
                  ? {
                      color: 'var(--color-abyss-text-button-on-seccion-perfil)',
                      background: `linear-gradient(to bottom, var(--color-abyss-bg-gradiente-1-button-on-seccion-perfil), var(--color-abyss-bg-gradiente-2-button-on-seccion-perfil))`,
                    }
                  : {
                      color: 'var(--color-abyss-text-button-off-seccion-perfil)',
                      background: 'transparent',
                      borderBottom: `2px solid var(--color-abyss-linea-button-off-seccion-perfil)`,
                    }
              }
            >
              {tab === 'historial' ? 'Mi historial' : 'Mis guardados'}
            </button>
          );
        })}
      </div>

      {/* ── Contenido dinámico ── */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-12">

        {/* ── SECCIÓN: HISTORIAL ── */}
        {tabActiva === 'historial' && (
          <section>
            {loadingHistorial ? (
              <p className="text-center py-12 animate-pulse" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                Cargando historial...
              </p>
            ) : historial.length === 0 ? (
              <p className="text-center py-12 opacity-60" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                Aún no has leído ningún capítulo.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {historial.map(item => (
                  <Link
                    key={item.id}
                    to={`/obra/${item.obraTitulo}`}
                    className="rounded-xl overflow-hidden border border-transparent hover:scale-[1.02] transition-transform duration-200 shadow-md"
                    style={{ background: 'var(--color-abyss-bg-card-historial)' }}
                  >
                    {/* Portada */}
                    {item.obraPortada ? (
                      <img
                        src={item.obraPortada}
                        alt={item.obraTitulo}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center opacity-40" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        Sin portada
                      </div>
                    )}
                    {/* Info */}
                    <div className="p-3 flex flex-col gap-1">
                      <p className="font-bold text-sm leading-tight line-clamp-2" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        {item.obraTitulo}
                      </p>
                      <p className="text-xs opacity-80" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        Cap. {item.capituloNumero % 1 === 0 ? Math.floor(item.capituloNumero) : item.capituloNumero}
                      </p>
                      <p className="text-xs opacity-60 mt-auto" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        {formatFecha(item.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── SECCIÓN: GUARDADOS ── */}
        {tabActiva === 'guardados' && (
          <section>
            {/* Sub-botones de filtro por estado */}
            <div className="flex gap-3 mb-6 justify-center flex-wrap">
              {(Object.keys(estadoLabels) as EstadoGuardado[]).map(estado => {
                const activo = filtroEstado === estado;
                return (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                    style={
                      activo
                        ? {
                            color: 'var(--color-abyss-text-button-estados-on)',
                            background: `radial-gradient(circle, var(--color-abyss-bg-gradiente-1-button-estados-on), var(--color-abyss-bg-gradiente-2-button-estados-on))`,
                            border: 'none',
                          }
                        : {
                            color: 'var(--color-abyss-text-button-estados-off)',
                            background: 'var(--color-abyss-bg-button-estados-off)',
                            border: `1px solid var(--color-abyss-border-button-estados-off)`,
                          }
                    }
                  >
                    {estadoLabels[estado]}
                  </button>
                );
              })}
            </div>

            {/* Grid de tarjetas filtradas */}
            {loadingGuardados ? (
              <p className="text-center py-12 animate-pulse" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                Cargando biblioteca...
              </p>
            ) : guardadosFiltrados.length === 0 ? (
              <p className="text-center py-12 opacity-60" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                No tenés obras en "{estadoLabels[filtroEstado]}".
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {guardadosFiltrados.map(item => (
                  <Link
                    key={item.id}
                    to={`/obra/${item.obraTitulo}`}
                    className="rounded-xl overflow-hidden hover:scale-[1.03] transition-transform duration-200 shadow-md"
                    style={{ background: 'var(--color-abyss-bg-card-historial)' }}
                  >
                    {/* Portada */}
                    {item.obraPortada ? (
                      <img
                        src={item.obraPortada}
                        alt={item.obraTitulo}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center opacity-40" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        Sin portada
                      </div>
                    )}
                    {/* Título */}
                    <div className="p-2">
                      <p className="font-bold text-xs line-clamp-2 leading-tight" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        {item.obraTitulo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Modal de edición de perfil ── */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        descripcionActual={descripcionPerfil}
        onSuccess={(nuevaDesc, nuevoNombre) => {
          setDescripcionPerfil(nuevaDesc);
          void nuevoNombre; // el store ya se actualizó en el modal
        }}
      />
      {/* ── Modal de Cerrar Sesión ── */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09151A] border border-[#00EBDB]/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(0,235,219,0.15)] flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-[#00EBDB] mb-3">
              ¿Deseas cerrar sesión?
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Tendrás que volver a iniciar sesión para acceder a tu historial y guardados.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg font-bold text-[#00EBDB] border border-[#00EBDB]/50 hover:bg-[#00EBDB]/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg font-bold text-[#09151A] bg-[#00EBDB] hover:brightness-110 shadow-[0_0_15px_rgba(0,235,219,0.4)] transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
