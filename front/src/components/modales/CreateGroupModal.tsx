import { useState, useEffect, useRef } from 'react';
import { crearGrupo } from '../../services/masterService';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal = ({ isOpen, onClose, onSuccess }: CreateGroupModalProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNombre('');
      setDescripcion('');
      setPortadaFile(null);
      setPortadaPreview(null);
      setIsDragOver(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (portadaPreview) URL.revokeObjectURL(portadaPreview);
    };
  }, [portadaPreview]);

  if (!isOpen) return null;

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
    if (!nombre.trim() || !descripcion.trim()) {
      setError("El nombre y la descripción son obligatorios.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      const requestData = {
        nombre,
        descripcion
      };

      formData.append(
        'datos',
        new Blob([JSON.stringify(requestData)], { type: 'application/json' })
      );

      if (portadaFile) {
        formData.append('portada', portadaFile);
      }

      await crearGrupo(formData);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al intentar crear el grupo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-md border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform">
        <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-6 text-center">
          Crear Nuevo Grupo
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Nombre del Grupo</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Invocadores del Abismo"
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Descripción</label>
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción del equipo..."
              rows={3}
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow resize-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Portada <span className="font-normal opacity-60">(Opcional)</span></label>
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
                    alt="Portada del grupo"
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
              disabled={isLoading}
              className="flex-1 bg-abyss-bg-button-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
