import { useEffect, useState, useCallback } from 'react';
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

/** Parsea el payload de un JWT sin verificar firma (solo para UI). */
function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Retorna el motivo de expiración de sesión, o null si todo está ok. */
type SesionEstado = 'TOKEN_EXPIRADO' | 'DEMO_EXPIRADO' | 'SIN_SESION' | null;
function detectarEstadoSesion(token: string | null, esDemo?: boolean): SesionEstado {
  if (!token) return 'SIN_SESION';
  const payload = parseJwtPayload(token);
  if (!payload) return 'TOKEN_EXPIRADO';
  const exp = payload['exp'] as number | undefined;
  if (!exp) return null;
  const ahora = Math.floor(Date.now() / 1000);
  if (ahora >= exp) {
    return esDemo ? 'DEMO_EXPIRADO' : 'TOKEN_EXPIRADO';
  }
  return null;
}

// ── Componente principal ───────────────────────────────────────
export default function UserProfile() {
  const { user, login, logout, token } = useAuthStore();
  const navigate = useNavigate();

  // ── Detección de sesión expirada ─────────────────────────────
  const [sesionEstado, setSesionEstado] = useState<SesionEstado>(null);
  const [countdown, setCountdown] = useState(5);

  const forzarLogout = useCallback((razon: SesionEstado) => {
    setSesionEstado(razon);
    logout();
  }, [logout]);

  useEffect(() => {
    const estado = detectarEstadoSesion(token, user?.esDemo);
    if (estado) {
      forzarLogout(estado);
      return;
    }
    // Verificar cada 30 segundos si el token expiró mientras el usuario está en la página
    const interval = setInterval(() => {
      const est = detectarEstadoSesion(token, user?.esDemo);
      if (est) forzarLogout(est);
    }, 30_000);
    return () => clearInterval(interval);
  }, [token, user?.esDemo, forzarLogout]);

  // Countdown de redirección
  useEffect(() => {
    if (!sesionEstado) return;
    if (countdown <= 0) {
      navigate('/login');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [sesionEstado, countdown, navigate]);

  // ── Estado del perfil (todos los hooks ANTES del early return) ─────────
  const [tabActiva, setTabActiva] = useState<TabActiva>('historial');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [descripcionPerfil, setDescripcionPerfil] = useState<string | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [guardados, setGuardados] = useState<GuardadoItem[]>([]);
  const [loadingGuardados, setLoadingGuardados] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoGuardado>('SIGUIENDO');

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  // Cargar perfil completo del usuario
  useEffect(() => {
    if (sesionEstado) return; // No hacer fetch si la sesión ya expiró
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
  }, [sesionEstado]);

  // Cargar historial al montar
  useEffect(() => {
    if (sesionEstado) return;
    setLoadingHistorial(true);
    api.get<HistorialItem[]>('/historial')
      .then(res => setHistorial(res.data))
      .catch(err => console.error('Error cargando historial', err))
      .finally(() => setLoadingHistorial(false));
  }, [sesionEstado]);

  // Cargar guardados una sola vez al montar
  useEffect(() => {
    if (sesionEstado) return;
    setLoadingGuardados(true);
    api.get<GuardadoItem[]>('/guardados')
      .then(res => setGuardados(res.data))
      .catch(err => console.error('Error cargando guardados', err))
      .finally(() => setLoadingGuardados(false));
  }, [sesionEstado]);
  // Filtro local de guardados (sin refetch)
  const guardadosFiltrados = guardados.filter(g => g.estado === filtroEstado);

  // ── Banner de sesión expirada ────────────────────────────────
  if (sesionEstado) {
    const esDemo = sesionEstado === 'DEMO_EXPIRADO';
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'var(--color-abyss-bg-perfil)' }}
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <img src={bgLog} alt="" className="w-full h-full object-cover" />
        </div>

        <div
          className="relative z-10 flex flex-col items-center text-center max-w-md w-full rounded-2xl p-8 gap-6"
          style={{
            background: 'rgba(9, 21, 26, 0.85)',
            border: esDemo ? '1px solid rgba(255, 100, 50, 0.35)' : '1px solid rgba(0, 235, 219, 0.25)',
            boxShadow: esDemo
              ? '0 0 40px rgba(255, 100, 50, 0.15)'
              : '0 0 40px rgba(0, 235, 219, 0.1)',
          }}
        >
          {/* Icono */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: esDemo ? 'rgba(255,100,50,0.1)' : 'rgba(0,235,219,0.08)',
              border: esDemo ? '1px solid rgba(255,100,50,0.3)' : '1px solid rgba(0,235,219,0.2)',
            }}
          >
            <img src={cthulhuIcon} alt="Abyss" className="w-10 h-10 opacity-80" />
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1
              className="text-2xl font-bold tracking-wide"
              style={{ color: esDemo ? '#ff6432' : '#00EBDB' }}
            >
              {esDemo ? 'Tu sesión demo ha caído al abismo' : 'La oscuridad te ha reclamado'}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(200,220,230,0.7)' }}>
              {esDemo
                ? 'El tiempo de vida de tu cuenta de demostración ha expirado. Las cuentas demo tienen una duración de 1 hora para preservar los recursos del sistema.'
                : 'Tu sesión ha expirado o fue cerrada desde otro dispositivo. Deberás iniciar sesión nuevamente para continuar tu travesía.'}
            </p>
          </div>

          {/* Barra de countdown */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(200,220,230,0.5)' }}>
              <span>Redirigiendo al inicio de sesión...</span>
              <span>{countdown}s</span>
            </div>
            <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-1 rounded-full transition-all duration-1000"
                style={{
                  width: `${(countdown / 5) * 100}%`,
                  background: esDemo
                    ? 'linear-gradient(90deg, #ff6432, #ff9060)'
                    : 'linear-gradient(90deg, #00EBDB, #0099cc)',
                }}
              />
            </div>
          </div>

          {/* Botón inmediato */}
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              background: esDemo
                ? 'linear-gradient(135deg, rgba(255,100,50,0.2), rgba(255,100,50,0.1))'
                : 'linear-gradient(135deg, rgba(0,235,219,0.2), rgba(0,153,204,0.1))',
              border: esDemo ? '1px solid rgba(255,100,50,0.4)' : '1px solid rgba(0,235,219,0.4)',
              color: esDemo ? '#ff6432' : '#00EBDB',
            }}
          >
            Ir al login ahora
          </button>
        </div>
      </div>
    );
  }


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
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 -mt-16 md:-mt-12">

          {/* ── Columna izquierda: Avatar + descripción + botón ── */}
          <div className="flex flex-col items-center gap-3 shrink-0 z-10 w-full md:w-auto">
            {/* Avatar 2x (w-48 h-48 vs w-24 h-24 anterior) */}
            <div
              className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 shadow-2xl"
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
              className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_18px_rgba(0,235,219,0.3)] w-full max-w-[200px]"
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
              className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_18px_rgba(235,0,0,0.3)] mt-2 w-full max-w-[200px]"
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
          <div className="flex-1 flex justify-center pt-2 md:pt-16">
            <h1
              className="text-2xl md:text-[1.7rem] font-bold text-center leading-tight"
              style={{ color: 'var(--color-abyss-text-capitulos)' }}
            >
              {user?.nombre ?? 'Lector'}
            </h1>
          </div>

          {/* ── Espacio derecho (balanceo visual) ── */}
          <div className="hidden md:block w-48 shrink-0" />
        </div>
      </div>

      {/* ── Tabs de navegación ── */}
      <div className="flex justify-center gap-2 px-4 mt-2 mb-4 w-full max-w-lg mx-auto">
        {(['historial', 'guardados'] as TabActiva[]).map(tab => {
          const activo = tabActiva === tab;
          return (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className="px-4 py-2 md:px-8 md:py-2.5 rounded-t-lg font-semibold capitalize transition-all duration-200 text-sm md:text-base flex-1 md:flex-none"
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
                        className="w-full h-32 sm:h-40 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-32 sm:h-40 flex items-center justify-center opacity-40" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
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
            <div className="flex gap-2 md:gap-3 mb-6 justify-center flex-wrap">
              {(Object.keys(estadoLabels) as EstadoGuardado[]).map(estado => {
                const activo = filtroEstado === estado;
                return (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className="px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                        className="w-full h-40 sm:h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 flex items-center justify-center opacity-40" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
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
