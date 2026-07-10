import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../services/api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CapituloListItem {
  id: number;
  numero: number;
  createdAt: string | null;
}

interface PaginaEditItem {
  /** ID único local usado por dnd-kit (no el de la BD) */
  id: string;
  tipo: 'vieja' | 'nueva';
  /** URL pública en GCS — sólo para páginas viejas */
  urlBd?: string;
  /** Archivo físico a subir — sólo para páginas nuevas */
  archivoFisico?: File;
  /** ObjectURL local para previsualizar la imagen nueva */
  previewUrl?: string;
}

interface EditChapterModalProps {
  isOpen: boolean;
  obraId: number;
  obraNombre: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── SortableItem ─────────────────────────────────────────────────────────────

interface SortableItemProps {
  item: PaginaEditItem;
  onRemove: (id: string) => void;
}

function SortableItem({ item, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const imgSrc = item.tipo === 'vieja' ? item.urlBd : item.previewUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full max-w-md cursor-grab active:cursor-grabbing select-none"
      {...attributes}
      {...listeners}
    >
      <img
        src={imgSrc}
        alt="Página del capítulo"
        className="w-full h-auto rounded-lg shadow-md border border-white/10 pointer-events-none"
        draggable={false}
      />

      {/* Botón de borrado — absoluto arriba a la derecha */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 transition-all"
        title="Eliminar página"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-[#00EBDB]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

const EditChapterModal = ({
  isOpen,
  obraId,
  obraNombre,
  onClose,
  onSuccess,
}: EditChapterModalProps) => {
  // ── Estado del selector ───────────────────────────────────────────────────────
  const [capitulos, setCapitulos] = useState<CapituloListItem[]>([]);
  const [capituloSeleccionado, setCapituloSeleccionado] = useState<CapituloListItem | null>(null);
  const [isFetchingCapitulos, setIsFetchingCapitulos] = useState(false);

  // ── Estado de las páginas ─────────────────────────────────────────────────────
  const [items, setItems] = useState<PaginaEditItem[]>([]);
  const [isFetchingPaginas, setIsFetchingPaginas] = useState(false);

  // ── Estado general ────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Sensores DnD (reordenado interno — no conflicta con drag del SO) ──────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ── 1. Cargar lista de capítulos al abrir el modal ────────────────────────────
  useEffect(() => {
    if (!isOpen || !obraId) return;
    let cancelled = false;

    setIsFetchingCapitulos(true);
    setCapituloSeleccionado(null);
    setItems([]);
    setError(null);

    api
      .get<CapituloListItem[]>(`/obras/${obraId}/capitulos`)
      .then((res) => {
        if (!cancelled) setCapitulos(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la lista de capítulos.');
      })
      .finally(() => {
        if (!cancelled) setIsFetchingCapitulos(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, obraId]);

  // ── 2. Cargar páginas cuando se selecciona un capítulo ───────────────────────
  useEffect(() => {
    if (!capituloSeleccionado) return;
    let cancelled = false;

    setIsFetchingPaginas(true);
    setItems([]);
    setError(null);

    const nombreParam = obraNombre.replace(/ /g, '-');
    api
      .get(`/obras/${nombreParam}/capitulos/${capituloSeleccionado.numero}`)
      .then((res) => {
        if (cancelled) return;
        const paginasUrls: string[] = res.data.paginasUrls ?? [];
        setItems(
          paginasUrls.map((url) => ({
            id: crypto.randomUUID(),
            tipo: 'vieja' as const,
            urlBd: url,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setError('Error al cargar las páginas del capítulo.');
      })
      .finally(() => {
        if (!cancelled) setIsFetchingPaginas(false);
      });

    return () => { cancelled = true; };
  }, [capituloSeleccionado, obraNombre]);

  if (!isOpen) return null;

  // ── Cerrar y limpiar todo ─────────────────────────────────────────────────────
  const handleClose = () => {
    if (isLoading) return;
    items.forEach((i) => { if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setItems([]);
    setCapituloSeleccionado(null);
    setCapitulos([]);
    setError(null);
    setProgreso(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  // ── Selector de capítulo ──────────────────────────────────────────────────────
  const handleSelectCapitulo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const cap = capitulos.find((c) => c.id === id) ?? null;
    // Liberar ObjectURLs del capítulo anterior
    items.forEach((i) => { if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setCapituloSeleccionado(cap);
  };

  // ── Reordenar con DnD ─────────────────────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // ── Convertir FileList → PaginaEditItem[] y añadir al estado ─────────────────
  const agregarArchivos = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (arr.length === 0) return;
    const nuevas: PaginaEditItem[] = arr.map((file) => ({
      id: crypto.randomUUID(),
      tipo: 'nueva',
      archivoFisico: file,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...nuevas]);
  };

  // ── Selección via <input type="file"> ────────────────────────────────────────
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) agregarArchivos(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Eliminar una página del estado ────────────────────────────────────────────
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  // ── Zona de drop nativa del SO ────────────────────────────────────────────────
  // El drag del sistema operativo (desde el explorador de archivos) usa la
  // DataTransfer API nativa del browser — completamente independiente de dnd-kit,
  // que solo actúa cuando se arrastra un elemento React ya montado.
  const handleNativeDragOver = (e: React.DragEvent) => {
    // Verificar que se están arrastrando archivos (no elementos del DOM)
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleNativeDragLeave = (e: React.DragEvent) => {
    // Solo desactivar si el cursor salió del contenedor (no de un hijo)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      agregarArchivos(e.dataTransfer.files);
    }
  };

  // ── Ensamblaje y envío via Signed URLs ───────────────────────────────────
  const handleGuardar = async () => {
    if (!capituloSeleccionado) {
      setError('Seleccioná un capítulo primero.');
      return;
    }
    if (items.length === 0) {
      setError('El capítulo debe tener al menos una página.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const itemsNuevos = items.filter((i) => i.tipo === 'nueva' && i.archivoFisico);

    try {
      // ── Fase 1: Pedir URLs firmadas para las imágenes NUEVAS ──────────────
      let urlsFinales: string[];

      if (itemsNuevos.length > 0) {
        setProgreso(`Generando acceso seguro para ${itemsNuevos.length} imagen${itemsNuevos.length > 1 ? 'es' : ''} nueva${itemsNuevos.length > 1 ? 's' : ''}...`);

        const archivosPayload = itemsNuevos.map((i) => ({
          nombre: i.archivoFisico!.name,
          tipo: i.archivoFisico!.type,
        }));

        const { data: signedData } = await api.post<{
          items: { uploadUrl: string; publicUrl: string }[];
        }>(
          `/obras/${obraId}/capitulos/signed-urls?numero=${capituloSeleccionado.numero}&esEdicion=true`,
          archivosPayload
        );

        // ── Fase 2: Subida paralela directa a GCS ──────────────────────────
        setProgreso(`Subiendo ${itemsNuevos.length} imagen${itemsNuevos.length > 1 ? 'es' : ''} directamente a la nube...`);

        const uploadedUrls = await Promise.all(
          signedData.items.map((signedItem, idx) =>
            fetch(signedItem.uploadUrl, {
              method: 'PUT',
              // ⚠ El Content-Type DEBE coincidir exactamente con el firmado en la Fase 1
              headers: { 'Content-Type': itemsNuevos[idx].archivoFisico!.type },
              body: itemsNuevos[idx].archivoFisico,
            }).then((res) => {
              if (!res.ok) {
                throw new Error(
                  `Error al subir imagen nueva ${idx + 1}: ${res.status} ${res.statusText}`
                );
              }
              return signedItem.publicUrl;
            })
          )
        );

        // Ensamblar lista final respetando el orden del estado (viejas + nuevas intercaladas)
        let newIdx = 0;
        urlsFinales = items.map((item) => {
          if (item.tipo === 'vieja' && item.urlBd) return item.urlBd;
          // tipo === 'nueva': asignar la URL pública que acaba de subir
          return uploadedUrls[newIdx++];
        });
      } else {
        // Sin imágenes nuevas: solo reordenado / eliminado de viejas
        urlsFinales = items
          .filter((i) => i.tipo === 'vieja' && i.urlBd)
          .map((i) => i.urlBd!);
      }

      // ── Fase 3: Notificar al backend con las URLs finales ─────────────────
      setProgreso('Guardando capítulo...');
      await api.put(`/capitulos/${capituloSeleccionado.id}`, {
        paginasUrls: urlsFinales,
      });

      setProgreso(null);
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { message?: string } | string } };
      const raw = axiosErr?.response?.data;
      const msg =
        (typeof raw === 'object' && raw !== null && 'message' in raw ? raw.message : undefined) ||
        (typeof raw === 'string' ? raw : undefined) ||
        (err instanceof Error ? err.message : undefined) ||
        'Ocurrió un error al guardar los cambios.';
      setError(msg ?? 'Ocurrió un error al guardar los cambios.');
      setProgreso(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers de UI ─────────────────────────────────────────────────────────────
  const labelClass = 'text-abyss-text-titles-form-crear font-semibold';
  const inputClass =
    'bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/80 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow w-full';

  const hayCapituloYPaginas = capituloSeleccionado !== null;
  const isWorking = isFetchingCapitulos || isFetchingPaginas || isLoading;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-lg border border-abyss-border-input-form-crear/30 flex flex-col gap-5">

        {/* ── Cabecera ─────────────────────────────────────────────────────── */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-1">
            Editar Capítulo
          </h2>
          <p className="text-abyss-text-titles-form-crear/60 text-sm">{obraNombre}</p>
        </div>

        {/* ── Selector de capítulo ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Capítulo a editar</label>
          {isFetchingCapitulos ? (
            <p className="text-abyss-text-titles-form-crear/50 text-sm animate-pulse py-2">
              Cargando capítulos...
            </p>
          ) : capitulos.length === 0 ? (
            <p className="text-abyss-text-titles-form-crear/40 text-sm italic py-2">
              Esta obra no tiene capítulos.
            </p>
          ) : (
            <select
              className={inputClass}
              value={capituloSeleccionado?.id ?? ''}
              onChange={handleSelectCapitulo}
              disabled={isWorking}
            >
              <option value="">— Seleccioná un capítulo —</option>
              {capitulos.map((cap) => (
                <option key={cap.id} value={cap.id}>
                  Capítulo {cap.numero % 1 === 0 ? Math.floor(cap.numero) : cap.numero}
                  {cap.createdAt
                    ? `  ·  ${new Date(cap.createdAt).toLocaleDateString('es-AR')}`
                    : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Área de trabajo — visible sólo cuando hay capítulo seleccionado ─ */}
        {hayCapituloYPaginas && (
          <>
            {/* Hint de instrucciones */}
            <p className="text-abyss-text-titles-form-crear/40 text-xs text-center -mt-2">
              Arrastrá páginas para reordenarlas · ✕ para eliminar · Soltá imágenes desde el explorador para añadirlas
            </p>

            {/* Zona de imágenes con soporte de drop nativo del SO */}
            <div
              className={`
                max-h-[50vh] overflow-y-auto flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                ${isDragOver
                  ? 'border-[#00EBDB] bg-[#00EBDB]/10 shadow-[0_0_20px_rgba(0,235,219,0.25)]'
                  : 'border-abyss-border-input-form-crear/20 bg-abyss-bg-input-form-crear/40'}
              `}
              onDragOver={handleNativeDragOver}
              onDragLeave={handleNativeDragLeave}
              onDrop={handleNativeDrop}
            >
              {isFetchingPaginas ? (
                <p className="text-abyss-text-titles-form-crear/60 text-sm animate-pulse py-8">
                  Cargando páginas...
                </p>
              ) : items.length === 0 ? (
                /* Estado vacío — invita al drag */
                <div className="flex flex-col items-center gap-3 py-10 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-[#00EBDB]/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="text-abyss-text-titles-form-crear/40 text-sm text-center">
                    Soltá imágenes aquí o usá el botón de añadir
                  </p>
                </div>
              ) : (
                <>
                  {/* Overlay de drop sobre la lista existente */}
                  {isDragOver && (
                    <div className="w-full flex items-center justify-center py-3 rounded-lg border-2 border-dashed border-[#00EBDB]/60 bg-[#00EBDB]/5">
                      <p className="text-[#00EBDB] font-bold text-sm">Soltar para añadir imágenes</p>
                    </div>
                  )}

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                      {items.map((item) => (
                        <SortableItem key={item.id} item={item} onRemove={handleRemoveItem} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </div>
          </>
        )}

        {/* ── Feedback ─────────────────────────────────────────────────────── */}
        {progreso && (
          <p className="text-abyss-text-titles-form-crear/80 text-sm font-semibold text-center animate-pulse">
            {progreso}
          </p>
        )}
        {error && (
          <p className="text-red-800 text-sm font-bold text-center bg-red-200/50 p-2 rounded">
            {error}
          </p>
        )}

        {/* ── Input de archivo oculto ──────────────────────────────────────── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isLoading}
        />

        {/* ── Botones de acción ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Botón añadir imágenes — solo si hay capítulo seleccionado */}
          {hayCapituloYPaginas && (
            <button
              type="button"
              onClick={() => !isLoading && fileInputRef.current?.click()}
              disabled={isWorking}
              className="w-full bg-abyss-bg-input-form-crear border border-abyss-border-input-form-crear text-abyss-text-titles-form-crear font-semibold rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              + Añadir imágenes
            </button>
          )}

          {/* Cancelar / Guardar */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all opacity-80 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={isWorking || !capituloSeleccionado}
              className="flex-1 bg-abyss-bg-button-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditChapterModal;
