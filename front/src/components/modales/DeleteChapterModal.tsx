import { useState } from 'react';
import api from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import CustomSelect from '../ui/CustomSelect';

interface Capitulo {
  id: number;
  numero: number;
}

interface DeleteChapterModalProps {
  isOpen: boolean;
  capitulos: Capitulo[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteChapterModal({ isOpen, capitulos, onClose, onSuccess }: DeleteChapterModalProps) {
  const [capituloSeleccionado, setCapituloSeleccionado] = useState<number | ''>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setCapituloSeleccionado('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleEliminar = async () => {
    if (!capituloSeleccionado) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.delete(`/capitulos/${capituloSeleccionado}`);
      setSuccessMessage('Capítulo eliminado correctamente.');
      onSuccess();
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string, error?: string } } };
      const errCode = e.response?.data?.error;
      if (errCode === 'DEMO_RESTRICTION') {
        useToastStore.getState().showToast('DATA_CORE', "Este capítulo es un pilar del Abismo y no puede ser eliminado.");
        handleClose();
        return;
      } else if (errCode === 'DEMO_ISOLATION') {
        useToastStore.getState().showToast('ISOLATION', "No tienes poder sobre los capítulos de otro creador.");
        handleClose();
        return;
      }
      setError(e.response?.data?.message || 'Error al eliminar el capítulo.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-abyss-bg-form-crear border border-abyss-border-input-form-crear/30 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-abyss-text-titles-form-crear uppercase tracking-wide">
            Eliminar Capítulo
          </h2>
          <button
            onClick={handleClose}
            className="text-abyss-text-titles-form-crear/50 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Select */}
        <div className="flex flex-col gap-2">
          <label className="text-abyss-text-titles-form-crear/70 text-sm font-semibold">
            Seleccioná el capítulo a eliminar
          </label>
          <CustomSelect
            value={capituloSeleccionado}
            onChange={(val) => setCapituloSeleccionado(val ? Number(val) : '')}
            options={capitulos.map(cap => ({
              value: cap.id,
              label: `Capítulo ${cap.numero % 1 === 0 ? Math.floor(cap.numero) : cap.numero}`
            }))}
            className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear border border-abyss-border-input-form-crear rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow appearance-none"
          />
        </div>

        {/* Advertencia */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
          ⚠️ Esta acción es permanente. Se eliminarán todas las páginas del capítulo de forma irreversible.
        </div>

        {error && (
          <p className="text-red-400 text-sm font-bold text-center">{error}</p>
        )}

        {successMessage && (
          <p className="text-green-400 text-sm font-bold text-center bg-green-900/20 p-2 rounded-lg border border-green-500/30">
            ✅ {successMessage}
          </p>
        )}

        {/* Botones */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 bg-abyss-bg-input-form-crear text-abyss-text-titles-form-crear border border-abyss-border-input-form-crear rounded-lg py-2.5 font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleEliminar}
            disabled={!capituloSeleccionado || isDeleting}
            className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg py-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
