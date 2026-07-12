import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  obtenerCapituloDeObra,
  type CapituloResponseDTO,
} from '../services/chapterService';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ChapterCommentSection from '../components/comments/ChapterCommentSection';

// ────────────────────────────────────────────────────────────
// Icono de flecha izquierda
// ────────────────────────────────────────────────────────────
function IconArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Icono de flecha derecha
// ────────────────────────────────────────────────────────────
function IconArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Icono de lista (volver a la obra)
// ────────────────────────────────────────────────────────────
function IconList() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Icono de flecha arriba (scroll to top)
// ────────────────────────────────────────────────────────────
function IconArrowUp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Botón de navegación con estado on/off
// ────────────────────────────────────────────────────────────
interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

function NavButton({ onClick, children, title }: NavButtonProps) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    // Pequeño delay visual antes de navegar
    setTimeout(() => {
      setActive(false);
      onClick();
    }, 180);
  };

  return (
    <button
      title={title}
      onClick={handleClick}
      style={
        active
          ? {
              background: `linear-gradient(135deg, var(--color-abyss-bg-boton-on-centro-capitulos), var(--color-abyss-bg-boton-on-bordes-capitulos))`,
              color: `var(--color-abyss-text-boton-on-capitulos)`,
              borderColor: `var(--color-abyss-bg-boton-on-bordes-capitulos)`,
            }
          : {
              background: `var(--color-abyss-bg-boton-off-capitulos)`,
              color: `var(--color-abyss-text-boton-off-capitulos)`,
              borderColor: `var(--color-abyss-border-boton-off-capitulos)`,
            }
      }
      className="flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-150 shadow-md hover:brightness-125 active:scale-95"
    >
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Barra de navegación superior (sin botón de subir)
// ────────────────────────────────────────────────────────────
interface TopNavBarProps {
  capitulo: CapituloResponseDTO;
  onPrev: () => void;
  onList: () => void;
  onNext: () => void;
}

function TopNavBar({ capitulo, onPrev, onList, onNext }: TopNavBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      {capitulo.numeroAnterior !== null ? (
        <NavButton onClick={onPrev} title="Capítulo anterior">
          <IconArrowLeft />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}

      <NavButton onClick={onList} title="Volver a la obra">
        <IconList />
      </NavButton>

      {capitulo.numeroSiguiente !== null ? (
        <NavButton onClick={onNext} title="Capítulo siguiente">
          <IconArrowRight />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Barra de navegación inferior (con botón de subir al inicio)
// ────────────────────────────────────────────────────────────
interface BottomNavBarProps extends TopNavBarProps {
  onScrollTop: () => void;
}

function BottomNavBar({ capitulo, onPrev, onList, onNext, onScrollTop }: BottomNavBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8 mb-10">
      {capitulo.numeroAnterior !== null ? (
        <NavButton onClick={onPrev} title="Capítulo anterior">
          <IconArrowLeft />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}

      <NavButton onClick={onList} title="Volver a la obra">
        <IconList />
      </NavButton>

      {capitulo.numeroSiguiente !== null ? (
        <NavButton onClick={onNext} title="Capítulo siguiente">
          <IconArrowRight />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}

      <NavButton onClick={onScrollTop} title="Volver al inicio">
        <IconArrowUp />
      </NavButton>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Componente principal: ChapterReader
// ────────────────────────────────────────────────────────────
export default function ChapterReader() {
  const { obraNombre, numero } = useParams<{ obraNombre: string; numero: string }>();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [capitulo, setCapitulo] = useState<CapituloResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!obraNombre || !numero) return;

    let cancelled = false;
    obtenerCapituloDeObra(obraNombre, parseFloat(numero))
      .then((data) => { if (!cancelled) { setCapitulo(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('No se pudo cargar el capítulo. Verificá que exista.'); setLoading(false); } });

    return () => { cancelled = true; };
  }, [obraNombre, numero]);

  /**
   * Tracking silencioso: se dispara cuando el capítulo termina de cargar.
   * No afecta la UI bajo ninguna circunstancia (error silenciado con console.warn).
   * Solo activo para usuarios autenticados.
   */
  useEffect(() => {
    if (!capitulo || !user) return;
    api.post('/historial/tracking', {
      obraId: capitulo.obraId,
      capituloId: capitulo.id,
    }).catch((err) => {
      console.warn('[Tracking] No se pudo registrar el progreso:', err?.response?.status, err?.response?.data);
    });
  }, [capitulo?.id]);  // eslint-disable-line react-hooks/exhaustive-deps -- capitulo.obraId no cambia si capitulo.id no cambia

  /**
   * Marcar como leído automáticamente cuando se carga el capítulo.
   */
  useEffect(() => {
    if (!capitulo || !user) return;
    api.post(`/capitulos/${capitulo.id}/leido`)
      .then(() => {
        console.log("¡El backend confirmó que se guardó como leído!");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.status;
        alert(`Error del backend al guardar leido: ${msg}`);
        console.warn('[Tracking] No se pudo marcar como leído:', err);
      });
  }, [capitulo?.id, user]);

  // ── Handlers de navegación ──
  const handleList = () => navigate(`/obra/${obraNombre}`);

  const handlePrev = () => {
    if (capitulo?.numeroAnterior == null) return;
    navigate(`/obra/${obraNombre}/capitulo/${capitulo.numeroAnterior}`);
  };

  const handleNext = () => {
    if (capitulo?.numeroSiguiente == null) return;
    if (user && capitulo) {
      api.post(`/capitulos/${capitulo.id}/leido`).catch(() => {});
    }
    navigate(`/obra/${obraNombre}/capitulo/${capitulo.numeroSiguiente}`);
  };

  const handleScrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Estados de carga / error ──
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-abyss-bg-fondo-capitulos)' }}
      >
        <p className="text-lg animate-pulse" style={{ color: 'var(--color-abyss-text-capitulos)' }}>
          Cargando capítulo...
        </p>
      </div>
    );
  }

  if (error || !capitulo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-abyss-bg-fondo-capitulos)' }}
      >
        <p className="text-xl font-bold" style={{ color: 'var(--color-abyss-text-capitulos)' }}>
          {error ?? 'Capítulo no encontrado.'}
        </p>
      </div>
    );
  }

  const tituloFormateado = obraNombre?.replace(/-/g, ' ') ?? '';

  return (
    <>
      <Navbar />
      <div
        ref={topRef}
        className="min-h-screen flex flex-col items-center"
        style={{ background: 'var(--color-abyss-bg-fondo-capitulos)' }}
      >
        <div className="w-full flex flex-col items-center pt-8 pb-2 px-4">
          <h1
            className="text-3xl md:text-4xl font-bold text-center tracking-wide"
            style={{ color: 'var(--color-abyss-text-capitulos)' }}
          >
            {tituloFormateado}
          </h1>
          <p
            className="mt-2 text-lg font-semibold"
          style={{ color: 'var(--color-abyss-text-capitulos)', opacity: 0.8 }}
        >
          Capítulo {capitulo.numero % 1 === 0 ? Math.floor(capitulo.numero) : capitulo.numero}
        </p>
      </div>

      {/* ── Barra de navegación superior ── */}
      <TopNavBar
        capitulo={capitulo}
        onPrev={handlePrev}
        onList={handleList}
        onNext={handleNext}
      />

      {/* ── Lista de páginas en cascada ── */}
      <div className="w-full max-w-3xl flex flex-col items-center mt-6">
        {capitulo.paginasUrls.length > 0 ? (
          capitulo.paginasUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Página ${index + 1}`}
              className="w-full block"
              style={{ display: 'block', lineHeight: 0 }}
              loading="lazy"
            />
          ))
        ) : (
          <p
            className="mt-20 text-center opacity-60"
            style={{ color: 'var(--color-abyss-text-capitulos)' }}
          >
            Este capítulo no tiene páginas cargadas aún.
          </p>
        )}
      </div>

      {/* ── Div invisible para detectar el final del capítulo ── */}
      <div ref={bottomRef} className="w-full h-1 opacity-0 pointer-events-none" />

      {/* ── Barra de navegación inferior (con botón de subir) ── */}
      <BottomNavBar
        capitulo={capitulo}
        onPrev={handlePrev}
        onList={handleList}
        onNext={handleNext}
        onScrollTop={handleScrollTop}
      />

      {/* ── Sección de comentarios del capítulo ── */}
      <ChapterCommentSection capituloId={capitulo.id} />

      {/* Espaciado final */}
      <div className="h-16" />
    </div>
    </>
  );
}
