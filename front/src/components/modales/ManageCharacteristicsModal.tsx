import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import type { CharacteristicType } from './CreateCharacteristicModal';
import { editarCaracteristica, eliminarCaracteristica } from '../../services/masterService';

interface Caracteristica {
  id: number;
  nombre: string;
}

interface ManageCharacteristicsModalProps {
  isOpen: boolean;
  type: CharacteristicType;
  onClose: () => void;
  onSuccess: () => void;
}

const ManageCharacteristicsModal = ({ isOpen, type, onClose, onSuccess }: ManageCharacteristicsModalProps) => {
  const [items, setItems] = useState<Caracteristica[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de edición In-line
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Estado de confirmación de eliminación
  const [deletingItem, setDeletingItem] = useState<Caracteristica | null>(null);

  const getEndpointType = (t: CharacteristicType): 'generos' | 'tipos' | 'demografias' => {
    if (t === 'genero') return 'generos';
    if (t === 'demografia') return 'demografias';
    return 'tipos';
  };

  const displayTitle = type === 'genero' ? 'Géneros' : type === 'demografia' ? 'Demografías' : 'Tipos';

  const fetchItems = useCallback(async () => {
    if (!type) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/${getEndpointType(type)}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError(`Error al cargar los ${displayTitle.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  }, [type, displayTitle]);

  useEffect(() => {
    let active = true;
    if (isOpen && type) {
      fetchItems().then(() => {
         if (!active) return;
      });
    }
    return () => {
      active = false;
      if (!isOpen) {
        setItems([]);
        setEditingId(null);
        setDeletingItem(null);
        setError(null);
      }
    };
  }, [isOpen, type, fetchItems]);

  const startEditing = (item: Caracteristica) => {
    setEditingId(item.id);
    setEditingValue(item.nombre);
  };

  const handleSaveEdit = async (id: number) => {
    if (!type) return;
    if (!editingValue.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }
    
    setError(null);
    try {
      await editarCaracteristica(getEndpointType(type), id, editingValue);
      setEditingId(null);
      setEditingValue('');
      fetchItems(); // Refetch
      onSuccess(); // Para actualizar dashboard
    } catch (err) {
      console.error(err);
      setError("Error al editar.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!type || !deletingItem) return;
    setError(null);
    try {
      await eliminarCaracteristica(getEndpointType(type), deletingItem.id);
      setDeletingItem(null);
      fetchItems(); // Refetch
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar.");
    }
  };

  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity p-4">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-lg border border-abyss-border-input-form-crear/30 flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear">
            Gestionar {displayTitle}
          </h2>
          <button onClick={onClose} className="text-abyss-text-titles-form-crear hover:text-red-500 font-bold text-xl">
            ✕
          </button>
        </div>

        {error && <p className="text-red-800 text-sm font-bold text-center bg-red-200/50 p-2 rounded mb-4">{error}</p>}

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {isLoading ? (
            <p className="text-abyss-text-input-form-crear/70 text-center py-4">Cargando...</p>
          ) : items.length === 0 ? (
            <p className="text-abyss-text-input-form-crear/70 text-center py-4">No hay elementos.</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-abyss-bg-input-form-crear/30 border border-abyss-border-input-form-crear/50 p-3 rounded-lg shadow-sm group">
                
                {/* Visualización / Edición */}
                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <input 
                      type="text" 
                      value={editingValue} 
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/90 border border-abyss-border-input-form-crear rounded px-2 py-1 outline-none focus:ring-1 focus:ring-abyss-border-input-form-crear"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(item.id)} className="text-green-500 font-bold hover:scale-110 px-2" title="Guardar">✓</button>
                    <button onClick={() => setEditingId(null)} className="text-red-500 font-bold hover:scale-110 px-2" title="Cancelar">✕</button>
                  </div>
                ) : (
                  <div className="flex-1 font-semibold text-abyss-text-input-form-crear/90 truncate mr-4">
                    {item.nombre}
                  </div>
                )}

                {/* Acciones */}
                {editingId !== item.id && (
                  <div className="flex items-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(item)} className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold uppercase tracking-wider" title="Editar">
                      Editar
                    </button>
                    <button onClick={() => setDeletingItem(item)} className="text-red-500 hover:text-red-400 font-bold text-lg hover:scale-110 transition-transform" title="Eliminar">
                      X
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal interno para Confirmación de Eliminación */}
        {deletingItem && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl p-6 z-10 backdrop-blur-sm">
            <div className="bg-abyss-bg-form-crear border border-red-500/50 p-6 rounded-xl shadow-2xl w-full max-w-sm text-center">
              <h3 className="text-xl font-bold text-red-500 mb-4">Eliminar {type === 'genero' ? 'género' : type === 'demografia' ? 'demografía' : 'tipo'}</h3>
              <p className="text-abyss-text-titles-form-crear mb-6">
                ¿Seguro que quieres eliminar el {type === 'genero' ? 'género' : type === 'demografia' ? 'demografía' : 'tipo'} <span className="font-bold text-white">"{deletingItem.nombre}"</span>?
              </p>
              <div className="flex gap-4">
                <button onClick={() => setDeletingItem(null)} className="flex-1 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-500 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCharacteristicsModal;
