import { useState, useEffect } from 'react';
import api from '../../services/api';
import CustomSelect from '../ui/CustomSelect';

interface CreateMemberModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMemberModal = ({ isOpen, groupId, onClose, onSuccess }: CreateMemberModalProps) => {
  const [nombre, setNombre] = useState('');
  const [mail, setMail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('MIEMBRO');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNombre('');
      setMail('');
      setContrasena('');
      setRol('MIEMBRO');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !mail.trim() || !contrasena.trim()) {
      setError("Todos los campos obligatorios deben estar completos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/miembros', {
        nombre,
        mail,
        contrasena,
        rol,
        grupoId: Number(groupId),
      });

      setNombre('');
      setMail('');
      setContrasena('');
      setRol('MIEMBRO');

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data || 'Ocurrió un error al crear el miembro.';
      setError(typeof msg === 'string' ? msg : 'Ocurrió un error al crear el miembro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-md border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform">
        <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-6 text-center">
          Crear Nuevo Miembro
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Nombre</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: DarkSlayer"
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Contraseña</label>
            <input 
              type="password" 
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="********"
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-abyss-text-titles-form-crear font-semibold mb-1">Rol en el Culto</label>
            <CustomSelect 
              value={rol}
              onChange={(val) => setRol(String(val))}
              options={[
                { value: 'MIEMBRO', label: 'Miembro' },
                { value: 'MIEMBRO_ADMIN', label: 'Miembro Administrador' }
              ]}
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow font-bold"
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
              {isLoading ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMemberModal;
