import React, { useState, useEffect, useRef } from 'react';
import { editarGrupo } from '../../services/masterService';
import { useToastStore } from '../../store/useToastStore';

interface EditGroupModalProps {
  isOpen: boolean;
  groupId: string;
  initialName: string;
  initialDescription: string;
  initialPortada: string | undefined;
  onClose: () => void;
  onSuccess: () => void;
}

const EditGroupModal = ({ isOpen, groupId, initialName, initialDescription, initialPortada, onClose, onSuccess }: EditGroupModalProps) => {
  const [nombre, setNombre] = useState(initialName);
  const [descripcion, setDescripcion] = useState(initialDescription);
  
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(initialPortada || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNombre(initialName);
      setDescripcion(initialDescription);
      setPortadaPreview(initialPortada || null);
      setPortadaFile(null);
      setIsDragOver(false);
      setError(null);
    }
  }, [isOpen, initialName, initialDescription, initialPortada]);

  useEffect(() => {
    return () => {
      // Solo revocar si es un ObjectURL, no la URL real
      if (portadaPreview && portadaPreview.startsWith('blob:')) {
        URL.revokeObjectURL(portadaPreview);
      }
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
    if (portadaPreview && portadaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(portadaPreview);
    }
    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
  };

  const handleRemovePortada = () => {
    if (portadaPreview && portadaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(portadaPreview);
    }
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

      await editarGrupo(groupId, formData);
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { error?: string, message?: string } } };
      const errCode = axiosErr.response?.data?.error;
      if (errCode === 'DEMO_RESTRICTION') {
        useToastStore.getState().showToast('DATA_CORE', "Este culto es un pilar del Abismo y no puede ser modificado.");
        onClose();
        return;
      } else if (errCode === 'DEMO_ISOLATION') {
        useToastStore.getState().showToast('ISOLATION', "No tienes poder sobre los dominios de otro Maestro.");
        onClose();
        return;
      }
      setError(axiosErr.response?.data?.message || "Ocurrió un error al intentar editar el grupo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-abyss-filter-form-crear/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="bg-abyss-bg-form-crear rounded-2xl w-full max-w-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-abyss-border-input-form-crear/30 relative z-10 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-abyss-border-input-form-crear/20">
          <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear">
            Editar Grupo
          </h2>
          <button 
            onClick={onClose}
            className="text-abyss-text-titles-form-crear hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Nombre</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. El Culto del Abismo"
                className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/90 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Descripción</label>
              <textarea 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve descripción del grupo..."
                rows={4}
                className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/90 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow resize-none"
                required
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
                  <div className="relative w-full h-full flex items-center justify-center group/preview">
                    <img
                      src={portadaPreview}
                      alt="Portada del grupo"
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePortada}
                      className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 transition-all opacity-0 group-hover/preview:opacity-100"
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

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract font-bold py-3 rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(2,151,151,0.5)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;
