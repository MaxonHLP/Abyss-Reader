import { useState, useRef } from 'react';
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

interface PaginaEditItem {
  id: string;
  archivoFisico: File;
  previewUrl: string;
}

interface CreateChapterModalProps {
  isOpen: boolean;
  obraId: number;
  obraNombre: string;
  capitulosExistentes: number[];
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full max-w-md cursor-grab active:cursor-grabbing select-none"
      {...attributes}
      {...listeners}
    >
      <img
        src={item.previewUrl}
        alt="Página del capítulo"
        className="w-full h-auto rounded-lg shadow-md border border-white/10 pointer-events-none"
        draggable={false}
      />

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

const CreateChapterModal = ({
  isOpen,
  obraId,
  obraNombre,
  capitulosExistentes,
  onClose,
  onSuccess,
}: CreateChapterModalProps) => {
  const [numero, setNumero] = useState('');
  const [items, setItems] = useState<PaginaEditItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    'bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow';
  const labelClass = 'text-abyss-text-titles-form-crear font-semibold mb-1';

  // ── Sensores DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return;
    setNumero('');
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
    setError(null);
    setProgreso(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  // ── Convertir FileList → PaginaEditItem[]
  const agregarArchivos = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (arr.length === 0) return;
    const nuevas: PaginaEditItem[] = arr.map((file) => ({
      id: crypto.randomUUID(),
      archivoFisico: file,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...nuevas]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) agregarArchivos(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

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

  const handleNativeDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleNativeDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      agregarArchivos(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numeroFloat = parseFloat(numero);
    if (!numero.trim() || isNaN(numeroFloat) || numeroFloat <= 0) {
      setError('Ingresá un número de capítulo válido y mayor a 0.');
      return;
    }
    if (capitulosExistentes.includes(numeroFloat)) {
      setError(`El capítulo ${numeroFloat} ya existe en esta obra.`);
      return;
    }
    if (items.length === 0) {
      setError('Debés añadir al menos una página al capítulo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgreso(`Subiendo ${items.length} página${items.length > 1 ? 's' : ''}...`);

    try {
      const formData = new FormData();

      const metadataBlob = new Blob(
        [JSON.stringify({ numero: numeroFloat })],
        { type: 'application/json' }
      );
      formData.append('metadata', metadataBlob);

      items.forEach((item) => {
        formData.append('paginas', item.archivoFisico);
      });

      await api.post(`/obras/${obraId}/capitulos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
        'Ocurrió un error al subir el capítulo.';
      setError(msg);
      setProgreso(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-lg border border-abyss-border-input-form-crear/30 flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-1">
            Subir Capítulo
          </h2>
          <p className="text-abyss-text-titles-form-crear/60 text-sm">
            {obraNombre}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Número de capítulo */}
          <div className="flex flex-col">
            <label className={labelClass}>Número de capítulo</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ej: 1, 1.5, 12..."
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          {/* Selector de páginas y DnD */}
          <div className="flex flex-col">
            <label className={labelClass}>
              Páginas <span className="font-normal opacity-60">(arrastrá para reordenar)</span>
            </label>
            
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
              {items.length === 0 ? (
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
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={() => !isLoading && fileInputRef.current?.click()}
            disabled={isLoading}
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

          {/* Feedback */}
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

          {/* Botones */}
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
              type="submit"
              disabled={isLoading || items.length === 0}
              className="flex-1 bg-abyss-bg-button-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Subiendo...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChapterModal;
