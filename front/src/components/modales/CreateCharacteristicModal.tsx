import { useState, useEffect } from 'react';
import { crearGenero, crearDemografia, crearTipo } from '../../services/masterService';
import { useModalBackdrop } from './useModalBackdrop';

export type CharacteristicType = 'genero' | 'demografia' | 'tipo' | null;

interface CreateCharacteristicModalProps {
  isOpen: boolean;
  type: CharacteristicType;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCharacteristicModal = ({ isOpen, type, onClose, onSuccess }: CreateCharacteristicModalProps) => {
  const [nombre, setNombre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useModalBackdrop(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) {
      setNombre('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !type) return null;

  // Obtenemos el nombre legible para el título
  const displayTitle = type === 'genero' ? 'Género' : type === 'demografia' ? 'Demografía' : 'Tipo';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Invocamos el servicio correspondiente de forma dinámica
      if (type === 'genero') {
        await crearGenero({ nombre });
      } else if (type === 'demografia') {
        await crearDemografia({ nombre });
      } else if (type === 'tipo') {
        await crearTipo({ nombre });
      }
      
      setNombre('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(`Ocurrió un error al intentar crear el ${displayTitle.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-sm border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-6 text-center">
          Crear Nuevo {displayTitle}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Nombre</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={`Ej: ${type === 'genero' ? 'Acción' : type === 'demografia' ? 'Shonen' : 'Manga'}`}
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow"
            />
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

export default CreateCharacteristicModal;
