import { useState } from 'react';
import type { Comentario } from '../../types/comentarios';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

interface CommentItemProps {
  comentario: Comentario;
  obraId: number;
  /** Callback para refrescar la lista desde el padre tras una acción */
  onRefresh: () => void;
  /** Nivel de anidamiento (0 = raíz, 1 = primer nivel de respuestas, etc.) */
  nivel?: number;
}

/**
 * Componente recursivo para renderizar un comentario y sus respuestas anidadas.
 *
 * RECURSIVIDAD:
 * Si el comentario tiene respuestas, al final del JSX se hace .map()
 * sobre ellas y se renderiza <CommentItem /> dentro de sí mismo,
 * envuelto en un contenedor con sangría y borde izquierdo para el
 * efecto visual de "hilo/rama".
 */
export default function CommentItem({ comentario, obraId, onRefresh, nivel = 0 }: CommentItemProps) {
  const { user } = useAuthStore();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechaFormateada = new Date(comentario.fechaCreacion).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const puedeEliminar =
    user &&
    !comentario.eliminado &&
    (user.nombre === comentario.autorNombre || user.rol === 'MASTER');

  const handleResponder = async () => {
    if (!replyText.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      await api.post(`/obras/${obraId}/comentarios`, {
        contenido: replyText.trim(),
        padreId: comentario.id,
      });
      setReplyText('');
      setShowReply(false);
      onRefresh();
    } catch {
      setError('No se pudo enviar la respuesta. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    setEliminando(true);
    try {
      await api.delete(`/comentarios/${comentario.id}`);
      onRefresh();
    } catch {
      setError('No se pudo eliminar el comentario.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* ── Tarjeta del comentario ── */}
      <div
        className="rounded-xl p-4 flex flex-col gap-2 shadow-sm"
        style={{ backgroundColor: 'var(--color-abyss-bg-card-comentario)' }}
      >
        {/* Cabecera: Avatar + Nombre + Fecha */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {comentario.autorAvatar ? (
            <img
              src={comentario.autorAvatar}
              alt={comentario.autorNombre}
              className="w-9 h-9 rounded-full object-cover shrink-0"
              style={{ outline: '2px solid var(--color-abyss-text-name-comentario)', outlineOffset: '1px' }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{
                backgroundColor: 'var(--color-abyss-bg-seccion-comentarios)',
                color: 'var(--color-abyss-text-name-comentario)',
              }}
            >
              {comentario.autorNombre.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Nombre */}
          <span
            className="font-bold text-sm"
            style={{ color: 'var(--color-abyss-text-name-comentario)' }}
          >
            {comentario.autorNombre}
          </span>

          {/* Fecha */}
          <span
            className="text-xs ml-auto opacity-80"
            style={{ color: 'var(--color-abyss-text-fecha-comentario)' }}
          >
            {fechaFormateada}
          </span>

          {/* Botón eliminar */}
          {puedeEliminar && (
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity ml-2"
              style={{ color: 'var(--color-abyss-text-fecha-comentario)' }}
              title="Eliminar comentario"
            >
              {eliminando ? '...' : '✕'}
            </button>
          )}
        </div>

        {/* Contenido */}
        {comentario.eliminado ? (
          <p
            className="text-sm italic opacity-50"
            style={{ color: 'var(--color-abyss-text-card-comentario)' }}
          >
            {comentario.contenido}
          </p>
        ) : (
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-abyss-text-card-comentario)' }}
          >
            {comentario.contenido}
          </p>
        )}

        {/* Botón Responder (solo si autenticado, no eliminado y nivel < 4 para no profundizar infinito) */}
        {user && !comentario.eliminado && nivel < 4 && (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs font-semibold opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-abyss-text-name-comentario)' }}
            >
              {showReply ? 'Cancelar' : '↩ Responder'}
            </button>
          </div>
        )}

        {/* Área de respuesta inline */}
        {showReply && (
          <div className="flex flex-col gap-2 mt-1">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none transition-shadow focus:ring-2"
              style={{
                backgroundColor: 'var(--color-abyss-bg-card-escribir-comentario)',
                color: 'var(--color-abyss-text-card-escribir-comentario)',
                border: '1px solid var(--color-abyss-border-seccion-comentarios)',
              }}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex justify-end">
              <button
                onClick={handleResponder}
                disabled={enviando || !replyText.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                style={{
                  backgroundColor: 'var(--color-abyss-bg-button-publicar)',
                  color: 'var(--color-abyss-text-button-publicar)',
                }}
              >
                {enviando ? 'Enviando...' : 'Publicar respuesta'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RECURSIVIDAD: Renderizar respuestas anidadas ── */}
      {comentario.respuestas && comentario.respuestas.length > 0 && (
        <div
          className="flex flex-col gap-2 ml-6 pl-3"
          style={{ borderLeft: '2px solid var(--color-abyss-border-seccion-comentarios)' }}
        >
          {comentario.respuestas.map((respuesta) => (
            <CommentItem
              key={respuesta.id}
              comentario={respuesta}
              obraId={obraId}
              onRefresh={onRefresh}
              nivel={nivel + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
