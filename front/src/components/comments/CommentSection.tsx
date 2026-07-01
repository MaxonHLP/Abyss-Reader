import { useEffect, useState, useCallback } from 'react';
import type { Comentario, ComentariosPage } from '../../types/comentarios';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  obraId: number;
}

/**
 * Sección completa de comentarios para la vista de una obra.
 *
 * Responsabilidades:
 * - Cargar comentarios paginados (10 por página) con botón "Cargar más"
 * - Mostrar el total de comentarios activos en el encabezado
 * - Proveer el input para crear un nuevo comentario raíz
 * - Delegar el renderizado de cada comentario (con sus hilos) a <CommentItem>
 *
 * Layout visual (spec):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 💬 Comentarios (N)                                          │
 * │ ┌──────────────────────────────────────────────────────┐   │
 * │ │ textarea "Escribe tu comentario"   [Publicar]        │   │
 * │ └──────────────────────────────────────────────────────┘   │
 * │  lista de CommentItem (recursivos)                          │
 * │  [Cargar más comentarios]                                   │
 * └─────────────────────────────────────────────────────────────┘
 */
export default function CommentSection({ obraId }: CommentSectionProps) {
  const { user } = useAuthStore();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [pagina, setPagina] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [totalComentarios, setTotalComentarios] = useState(0);

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [errorPublicar, setErrorPublicar] = useState<string | null>(null);

  // ─── Carga inicial de comentarios ────────────────────────────────────────

  const cargarComentarios = useCallback(async (reset = false) => {
    const paginaACargar = reset ? 0 : pagina;
    if (!reset) setCargandoMas(true);
    else setCargando(true);

    try {
      const [resComentarios, resCount] = await Promise.all([
        api.get<ComentariosPage>(`/obras/${obraId}/comentarios`, {
          params: { page: paginaACargar, size: 10 },
        }),
        api.get<{ total: number }>(`/obras/${obraId}/comentarios/count`),
      ]);

      const data = resComentarios.data;
      setTotalComentarios(resCount.data.total);

      if (reset) {
        setComentarios(data.content);
        setPagina(1);
      } else {
        setComentarios((prev) => [...prev, ...data.content]);
        setPagina((p) => p + 1);
      }

      setHasMore(!data.last);
    } catch (err) {
      console.error('Error al cargar comentarios', err);
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  }, [obraId, pagina]);

  useEffect(() => {
    cargarComentarios(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraId]);

  // Refresh completo (llamado por CommentItem tras una acción exitosa)
  const handleRefresh = useCallback(() => {
    cargarComentarios(true);
  }, [cargarComentarios]);

  // ─── Publicar comentario raíz ─────────────────────────────────────────────

  const handlePublicar = async () => {
    if (!nuevoComentario.trim()) return;
    setPublicando(true);
    setErrorPublicar(null);
    try {
      await api.post(`/obras/${obraId}/comentarios`, {
        contenido: nuevoComentario.trim(),
        padreId: null,
      });
      setNuevoComentario('');
      await cargarComentarios(true);
    } catch {
      setErrorPublicar('No se pudo publicar el comentario. Intentá de nuevo.');
    } finally {
      setPublicando(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section
      className="w-full max-w-4xl rounded-xl shadow-lg border flex flex-col gap-4 p-6 mt-6"
      style={{
        backgroundColor: 'var(--color-abyss-bg-seccion-comentarios)',
        borderColor: 'var(--color-abyss-border-seccion-comentarios)',
      }}
      aria-label="Sección de comentarios"
    >
      {/* ── Encabezado ── */}
      <h2
        className="text-xl font-bold tracking-wide"
        style={{ color: 'var(--color-abyss-title-seccion-comentarios)' }}
      >
        💬 Comentarios{' '}
        <span className="text-base font-medium opacity-80">
          ({totalComentarios})
        </span>
      </h2>

      {/* ── Card: Escribir nuevo comentario ── */}
      <div
        className="rounded-xl p-4 flex flex-col gap-3 shadow-sm"
        style={{ backgroundColor: 'var(--color-abyss-bg-card-escribir-comentario)' }}
      >
        {user ? (
          <>
            <textarea
              id="nuevo-comentario-textarea"
              rows={3}
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe tu comentario..."
              className="w-full rounded-lg px-4 py-3 text-sm resize-none outline-none transition-shadow focus:ring-2"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-abyss-text-card-escribir-comentario)',
                border: '1px solid var(--color-abyss-border-seccion-comentarios)',
              }}
            />
            {errorPublicar && (
              <p className="text-red-400 text-xs font-medium">{errorPublicar}</p>
            )}
            <div className="flex justify-end">
              <button
                id="btn-publicar-comentario"
                onClick={handlePublicar}
                disabled={publicando || !nuevoComentario.trim()}
                className="px-5 py-2 rounded-lg font-bold text-sm transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-abyss-bg-button-publicar)',
                  color: 'var(--color-abyss-text-button-publicar)',
                }}
              >
                {publicando ? 'Publicando...' : 'Publicar comentario'}
              </button>
            </div>
          </>
        ) : (
          <p
            className="text-sm italic opacity-70 text-center py-2"
            style={{ color: 'var(--color-abyss-text-card-escribir-comentario)' }}
          >
            Inicia sesión para dejar un comentario.
          </p>
        )}
      </div>

      {/* ── Lista de comentarios ── */}
      {cargando ? (
        <div className="text-center py-8 opacity-60" style={{ color: 'var(--color-abyss-title-seccion-comentarios)' }}>
          Cargando comentarios...
        </div>
      ) : comentarios.length === 0 ? (
        <p
          className="text-center italic text-sm opacity-60 py-6"
          style={{ color: 'var(--color-abyss-title-seccion-comentarios)' }}
        >
          Sé el primero en comentar esta obra.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {comentarios.map((comentario) => (
            <CommentItem
              key={comentario.id}
              comentario={comentario}
              obraId={obraId}
              onRefresh={handleRefresh}
              nivel={0}
            />
          ))}
        </div>
      )}

      {/* ── Botón "Cargar más" ── */}
      {hasMore && !cargando && (
        <div className="flex justify-center pt-2">
          <button
            id="btn-cargar-mas-comentarios"
            onClick={() => cargarComentarios(false)}
            disabled={cargandoMas}
            className="px-6 py-2 rounded-full text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-abyss-bg-button-publicar)',
              color: 'var(--color-abyss-text-button-publicar)',
            }}
          >
            {cargandoMas ? 'Cargando...' : 'Cargar más comentarios'}
          </button>
        </div>
      )}
    </section>
  );
}
