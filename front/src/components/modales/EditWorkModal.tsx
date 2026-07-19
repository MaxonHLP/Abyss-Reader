import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import CustomSelect from '../ui/CustomSelect';
import { useModalBackdrop } from './useModalBackdrop';

interface CatalogItem {
  id: number;
  nombre: string;
}

interface EditWorkModalProps {
  isOpen: boolean;
  obraId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface MiembroResumen {
  id: number;
  nombre: string;
  avatar: string | null;
}

const EditWorkModal = ({ isOpen, obraId, onClose, onSuccess }: EditWorkModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('EN_EMISION');
  const [generosIds, setGenerosIds] = useState<number[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<number | ''>('');
  const [staffIds, setStaffIds] = useState<number[]>([]);

  const [portadaUrl, setPortadaUrl] = useState<string | null>(null);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);

  const [generosCatalog, setGenerosCatalog] = useState<CatalogItem[]>([]);
  const [miembros, setMiembros] = useState<MiembroResumen[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useModalBackdrop(isOpen, () => {
    if (!isLoading) {
        if (portadaPreview) URL.revokeObjectURL(portadaPreview);
        onClose();
    }
  });

  // Cargar datos de la obra y catálogos
  useEffect(() => {
    let cancelled = false;
    
    const fetchDatos = async () => {
      setIsFetchingData(true);
      setError(null);
      setPortadaPreview(null);
      setPortadaFile(null);
      setGeneroSeleccionado('');

      try {
        const [obraRes, generosRes] = await Promise.all([
          api.get(`/obras/${obraId}`),
          api.get<CatalogItem[]>('/generos')
        ]);
        
        if (cancelled) return;
        
        const obra = obraRes.data;
        setTitulo(obra.titulo);
        setDescripcion(obra.descripcion || '');
        setEstado(obra.estado || 'EN_EMISION');
        setPortadaUrl(obra.portada || null);
        setStaffIds(obra.staffIds || []);

        setGenerosCatalog(generosRes.data);
        
        if (obra.generosNombres) {
            const ids = obra.generosNombres.map((nombre: string) => {
                const genero = generosRes.data.find(g => g.nombre === nombre);
                return genero ? genero.id : null;
            }).filter((id: number | null) => id !== null);
            setGenerosIds(ids as number[]);
        } else {
            setGenerosIds([]);
        }

        // Obtener los miembros del grupo de la obra
        if (obra.grupoId) {
            try {
                const grupoRes = await api.get(`/grupos/${obra.grupoId}`);
                if (!cancelled) setMiembros(grupoRes.data.miembros || []);
            } catch (err) {
                console.error('Error al cargar miembros del grupo:', err);
            }
        }
      } catch (err) {
        if (!cancelled) setError('Error al cargar los datos de la obra.');
      } finally {
        if (!cancelled) setIsFetchingData(false);
      }
    };

    if (isOpen && obraId) {
      fetchDatos();
    } else {
      setTitulo('');
      setDescripcion('');
      setEstado('EN_EMISION');
      setGenerosIds([]);
      setStaffIds([]);
      setPortadaUrl(null);
      setMiembros([]);
      setGenerosCatalog([]);
      setError(null);
    }

    return () => { cancelled = true; };
  }, [isOpen, obraId]);

  // Limpiar previewUrl al desmontar o cerrar
  useEffect(() => {
    return () => {
      if (portadaPreview) URL.revokeObjectURL(portadaPreview);
    };
  }, [portadaPreview]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return;
    if (portadaPreview) URL.revokeObjectURL(portadaPreview);
    onClose();
  };

  const handleAgregarGenero = () => {
    if (generoSeleccionado !== '' && !generosIds.includes(Number(generoSeleccionado))) {
      setGenerosIds(prev => [...prev, Number(generoSeleccionado)]);
    }
    setGeneroSeleccionado('');
  };

  const handleRemoveGenero = (id: number) => {
    setGenerosIds(prev => prev.filter(g => g !== id));
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
    setPortadaUrl(null); // Si el usuario borra la portada
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (generosIds.length === 0) {
      setError('Debés seleccionar al menos un género.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      const requestData = {
        titulo,
        descripcion: descripcion || undefined,
        estado,
        generosIds,
        staffIds,
      };

      formData.append(
        'datos',
        new Blob([JSON.stringify(requestData)], { type: 'application/json' })
      );

      if (portadaFile) {
        formData.append('portada', portadaFile);
      }

      await api.put(`/obras/${obraId}`, formData);

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { message?: string } | string } };
      const raw = axiosErr?.response?.data;
      if (typeof raw === 'object' && raw !== null && 'error' in raw) {
        const errCode = (raw as Record<string, unknown>).error;
        if (errCode === 'DEMO_RESTRICTION') {
          useToastStore.getState().showToast('DATA_CORE', "Esta obra es un pilar del Abismo y no puede ser modificada.");
          handleClose();
          return;
        } else if (errCode === 'DEMO_ISOLATION') {
          useToastStore.getState().showToast('ISOLATION', "No tienes poder sobre las obras de otro creador.");
          handleClose();
          return;
        }
      }
      const msg =
        (typeof raw === 'object' && raw !== null && 'message' in raw ? raw.message : undefined) ||
        (typeof raw === 'string' ? raw : undefined) ||
        'Ocurrió un error al guardar los cambios.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/80 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow w-full';
  const labelClass = 'text-abyss-text-titles-form-crear font-semibold mb-1 block';

  // Filtrar géneros disponibles para agregar (los que no están en generosIds)
  const generosDisponibles = generosCatalog.filter(g => !generosIds.includes(g.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-abyss-filter-form-crear/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      <div className="relative z-10 bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-2xl border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform max-h-[90vh] overflow-y-auto flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-2 text-center">
          Editar Obra
        </h2>

        {isFetchingData ? (
          <p className="text-center text-abyss-text-titles-form-crear/70 py-8 animate-pulse">Cargando datos...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Columna Izquierda: Textos y Selects */}
              <div className="flex flex-col gap-4">
                {/* Título */}
                <div>
                  <label className={labelClass}>Título</label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className={labelClass}>Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className={labelClass}>Estado</label>
                  <CustomSelect
                    value={estado}
                    onChange={(val) => setEstado(String(val))}
                    options={[
                      { value: 'EN_EMISION', label: 'EN EMISIÓN' },
                      { value: 'PAUSADO', label: 'PAUSADO' },
                      { value: 'FINALIZADO', label: 'FINALIZADO' }
                    ]}
                    className={inputClass}
                  />
                </div>

                {/* Géneros */}
                <div>
                  <label className={labelClass}>Géneros</label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <CustomSelect
                        value={generoSeleccionado || ''}
                        onChange={(val) => setGeneroSeleccionado(Number(val))}
                        options={generosDisponibles.map(g => ({ value: g.id, label: g.nombre }))}
                        placeholder="— Agregar género —"
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAgregarGenero}
                      disabled={generoSeleccionado === ''}
                      className="bg-abyss-bg-button-cc text-abyss-text-button-cc font-bold px-4 rounded-lg disabled:opacity-50"
                    >
                      Añadir
                    </button>
                  </div>
                  {/* Chips de géneros seleccionados */}
                  <div className="flex flex-wrap gap-2">
                    {generosIds.length === 0 && (
                      <span className="text-sm text-abyss-text-titles-form-crear/50 italic">No hay géneros seleccionados.</span>
                    )}
                    {generosIds.map(id => {
                      const genero = generosCatalog.find(g => g.id === id);
                      if (!genero) return null;
                      return (
                        <span key={id} className="bg-abyss-border-input-form-crear/20 text-abyss-text-input-form-crear/90 border border-abyss-border-input-form-crear px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {genero.nombre}
                          <button
                            type="button"
                            onClick={() => handleRemoveGenero(id)}
                            className="text-[#00EBDB] hover:text-white transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Staff Asignado */}
                {miembros.length > 0 && (
                  <div>
                    <label className={labelClass}>Staff Asignado <span className="font-normal opacity-60">(Opcional)</span></label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-abyss-bg-input-form-crear border border-abyss-border-input-form-crear rounded-lg mt-1">
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
              </div>

              {/* Columna Derecha: Portada */}
              <div className="flex flex-col">
                <label className={labelClass}>Portada</label>
                <p className="text-abyss-text-titles-form-crear/40 text-xs mb-2">
                  Arrastrá una imagen para reemplazar la portada actual.
                </p>
                <div
                  className={`
                    flex-1 min-h-[300px] flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden
                    ${isDragOver
                      ? 'border-[#00EBDB] bg-[#00EBDB]/10 shadow-[0_0_20px_rgba(0,235,219,0.25)]'
                      : 'border-abyss-border-input-form-crear/20 bg-abyss-bg-input-form-crear/40'}
                  `}
                  onDragOver={handleNativeDragOver}
                  onDragLeave={handleNativeDragLeave}
                  onDrop={handleNativeDrop}
                >
                  {(portadaPreview || portadaUrl) ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={portadaPreview || portadaUrl || ''}
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
                    <div className="flex flex-col items-center gap-3 py-10 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12 text-[#00EBDB]/40"
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
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm">
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
                  className="mt-3 w-full bg-abyss-bg-input-form-crear border border-abyss-border-input-form-crear text-abyss-text-titles-form-crear font-semibold rounded-xl py-2 px-4 hover:brightness-110 transition disabled:opacity-40"
                >
                  Seleccionar archivo
                </button>
              </div>
            </div>

            {error && <p className="text-red-800 text-sm font-bold text-center bg-red-200/50 p-2 rounded">{error}</p>}

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all opacity-80 hover:opacity-100 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isFetchingData}
                className="flex-1 bg-abyss-bg-button-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditWorkModal;
