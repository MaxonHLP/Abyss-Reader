import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToastStore } from '../../store/useToastStore';

interface CatalogItem {
  id: number;
  nombre: string;
}

interface CreateWorkModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface MiembroResumen {
  id: number;
  nombre: string;
  avatar: string | null;
}

const CreateWorkModal = ({ isOpen, groupId, onClose, onSuccess }: CreateWorkModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipoId, setTipoId] = useState<number | ''>('');
  const [demografiaId, setDemografiaId] = useState<number | ''>('');
  const [generosIds, setGenerosIds] = useState<number[]>([]);
  const [staffIds, setStaffIds] = useState<number[]>([]);

  const [tipos, setTipos] = useState<CatalogItem[]>([]);
  const [demografias, setDemografias] = useState<CatalogItem[]>([]);
  const [generos, setGeneros] = useState<CatalogItem[]>([]);
  const [miembros, setMiembros] = useState<MiembroResumen[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCatalogs, setIsFetchingCatalogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar catálogos cuando el modal se abre
  useEffect(() => {
    let active = true;
    if (isOpen) {
      Promise.all([
        api.get<CatalogItem[]>('/tipos'),
        api.get<CatalogItem[]>('/demografias'),
        api.get<CatalogItem[]>('/generos'),
        api.get(`/grupos/${groupId}`)
      ])
        .then(([tiposRes, demografiasRes, generosRes, grupoRes]) => {
          if (!active) return;
          setTipos(tiposRes.data);
          setDemografias(demografiasRes.data);
          setGeneros(generosRes.data);
          setMiembros(grupoRes.data.miembros || []);
        })
        .catch(() => {
           if (!active) return;
           setError('No se pudieron cargar los catálogos o los miembros del grupo. Intentá de nuevo.');
        })
        .finally(() => {
           if (active) setIsFetchingCatalogs(false);
        });
    } else {
      // Limpiar al cerrar
      setTitulo('');
      setDescripcion('');
      setPortadaFile(null);
      setPortadaPreview(null);
      setIsDragOver(false);
      setTipoId('');
      setDemografiaId('');
      setGenerosIds([]);
      setStaffIds([]);
      setError(null);
    }
    return () => {
       active = false;
    };
  }, [isOpen, groupId]);

  useEffect(() => {
    return () => {
      if (portadaPreview) URL.revokeObjectURL(portadaPreview);
    };
  }, [portadaPreview]);

  if (!isOpen) return null;

  const toggleGenero = (id: number) => {
    setGenerosIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleStaff = (id: number) => {
    setStaffIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Drag & Drop nativo para la portada
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
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('El archivo seleccionado no es una imagen.');
      return;
    }
    if (portadaPreview) URL.revokeObjectURL(portadaPreview);
    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
  };

  const handleRemovePortada = () => {
    if (portadaPreview) URL.revokeObjectURL(portadaPreview);
    setPortadaFile(null);
    setPortadaPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (!tipoId) {
      setError('Debés seleccionar un Tipo.');
      return;
    }
    if (!demografiaId) {
      setError('Debés seleccionar una Demografía.');
      return;
    }
    if (generosIds.length === 0) {
      setError('Debés seleccionar al menos un Género.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      const requestData = {
        titulo,
        descripcion: descripcion || undefined,
        tipoId: Number(tipoId),
        demografiaId: Number(demografiaId),
        grupoId: Number(groupId),
        generosIds,
        staffIds
      };

      formData.append(
        'datos',
        new Blob([JSON.stringify(requestData)], { type: 'application/json' })
      );

      if (portadaFile) {
        formData.append('portada', portadaFile);
      }

      await api.post('/obras', formData);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { message?: string } | string } };
      const raw = axiosErr?.response?.data;
      if (typeof raw === 'object' && raw !== null && 'error' in raw && raw.error === 'DEMO_LIMIT') {
        const { entidad, limite } = raw as Record<string, unknown>;
        useToastStore.getState().showToast('LIMIT', `Alcanzaste el número máximo de ${entidad} (${limite}).`);
        onClose();
        return;
      }
      const msg =
        (typeof raw === 'object' && raw !== null && 'message' in raw ? raw.message : undefined) ||
        (typeof raw === 'string' ? raw : undefined) ||
        'Ocurrió un error al crear la obra.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass =
    'bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow font-semibold';
  const inputClass =
    'bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow';
  const labelClass = 'text-abyss-text-titles-form-crear font-semibold mb-1';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-lg border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-6 text-center">
          Agregar Obra
        </h2>

        {isFetchingCatalogs ? (
          <p className="text-center text-abyss-text-titles-form-crear/70 py-8">Cargando catálogos...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Título */}
            <div className="flex flex-col">
              <label className={labelClass}>Título de la Obra</label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: El Descenso"
                className={inputClass}
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col">
              <label className={labelClass}>Descripción</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Breve sinopsis..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* URL Portada */}
            <div className="flex flex-col">
              <label className={labelClass}>Portada <span className="font-normal opacity-60">(Opcional)</span></label>
              <div
                className={`
                  flex-1 min-h-[200px] flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden mt-1
                  ${isDragOver
                    ? 'border-[#00EBDB] bg-[#00EBDB]/10 shadow-[0_0_20px_rgba(0,235,219,0.25)]'
                    : 'border-abyss-border-input-form-crear/20 bg-abyss-bg-input-form-crear/40'}
                `}
                onDragOver={handleNativeDragOver}
                onDragLeave={handleNativeDragLeave}
                onDrop={handleNativeDrop}
              >
                {portadaPreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={portadaPreview}
                      alt="Portada de la obra"
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePortada}
                      className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 transition-all"
                      title="Eliminar portada"
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
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-[#00EBDB]/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-abyss-text-titles-form-crear/40 text-sm text-center">
                      Soltá una imagen aquí
                    </p>
                  </div>
                )}

                {isDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm z-10">
                    <p className="text-[#00EBDB] font-bold">Soltar para usar como portada</p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={isLoading}
              />
              
              <button
                type="button"
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className="mt-2 w-full bg-abyss-bg-input-form-crear border border-abyss-border-input-form-crear text-abyss-text-titles-form-crear/80 font-semibold rounded-lg py-2 px-4 hover:brightness-110 transition disabled:opacity-40 text-sm"
              >
                Seleccionar archivo
              </button>
            </div>

            {/* Tipo */}
            <div className="flex flex-col">
              <label className={labelClass}>Tipo</label>
              <select
                value={tipoId}
                onChange={e => setTipoId(Number(e.target.value))}
                className={selectClass}
              >
                <option value="">— Seleccionar tipo —</option>
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            {/* Demografía */}
            <div className="flex flex-col">
              <label className={labelClass}>Demografía</label>
              <select
                value={demografiaId}
                onChange={e => setDemografiaId(Number(e.target.value))}
                className={selectClass}
              >
                <option value="">— Seleccionar demografía —</option>
                {demografias.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>

            {/* Géneros (multi-select con checkboxes) */}
            <div className="flex flex-col">
              <label className={labelClass}>Géneros <span className="font-normal opacity-60">(seleccioná uno o más)</span></label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-abyss-bg-input-form-crear border border-abyss-border-input-form-crear rounded-lg">
                {generos.map(g => (
                  <label
                    key={g.id}
                    className="flex items-center gap-2 cursor-pointer text-abyss-text-input-form-crear/80 hover:text-abyss-text-input-form-crear transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={generosIds.includes(g.id)}
                      onChange={() => toggleGenero(g.id)}
                      className="accent-abyss-border-input-form-crear w-4 h-4"
                    />
                    <span className="text-sm">{g.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Staff (multi-select con checkboxes) */}
            {miembros.length > 0 && (
              <div className="flex flex-col">
                <label className={labelClass}>Staff Asignado <span className="font-normal opacity-60">(Opcional)</span></label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-abyss-bg-input-form-crear border border-abyss-border-input-form-crear rounded-lg">
                  {miembros.map(m => (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 cursor-pointer text-abyss-text-input-form-crear/80 hover:text-abyss-text-input-form-crear transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={staffIds.includes(m.id)}
                        onChange={() => toggleStaff(m.id)}
                        className="accent-abyss-border-input-form-crear w-4 h-4"
                      />
                      <span className="text-sm flex items-center gap-2">
                        {m.avatar && <img src={m.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover" />}
                        {m.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-800 text-sm font-bold text-center bg-red-200/50 p-2 rounded">{error}</p>}

            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all opacity-80 hover:opacity-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isFetchingCatalogs}
                className="flex-1 bg-abyss-bg-button-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateWorkModal;
