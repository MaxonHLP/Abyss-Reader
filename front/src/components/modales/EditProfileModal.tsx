import { useState, useRef, useEffect } from 'react';
import cthulhuIcon from '../../assets/icono cthulhu.png';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  descripcionActual?: string | null;
  onSuccess: (nuevaDescripcion: string | null, nuevoNombre: string) => void;
}



export default function EditProfileModal({ isOpen, onClose, descripcionActual, onSuccess }: EditProfileModalProps) {
  const { user, login, token } = useAuthStore();

  const [nombre, setNombre] = useState('');
  const [mail, setMail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSensibleData, setShowSensibleData] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Inicializar campos al abrir
  useEffect(() => {
    if (!isOpen) return;
    setNombre(user?.nombre ?? '');
    setMail(user?.mail ?? '');
    setDescripcion(descripcionActual ?? '');
    setPassword('');
    setConfirmPassword('');
    setAvatarFile(null);
    setAvatarPreview(user?.fotoPerfil ?? null);
    setError(null);
    setPendingSubmit(false);
    setShowSensibleData(false);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  // ── Drag & Drop ──────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setIsDragOver(true); }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
  };
  const selectFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Validar y enviar ─────────────────────────────────────────
  const handleSaveClick = () => {
    setError(null);
    const cambiaPass = password.trim() !== '';

    if (cambiaPass && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    submitForm();
  };

  const submitForm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const requestData: Record<string, string> = {};
      if (nombre.trim()) requestData.nombre = nombre.trim();
      if (mail.trim() && mail.trim() !== user?.mail) requestData.mail = mail.trim();
      if (descripcion.trim() !== (descripcionActual ?? '')) requestData.descripcion = descripcion.trim();
      if (password.trim()) {
        requestData.contrasena = password.trim();
      }

      const formData = new FormData();
      formData.append('datos', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      if (avatarFile) formData.append('fotoPerfil', avatarFile);

      const res = await api.put<{ nombre: string; mail: string; descripcion: string | null; fotoPerfil: string | null; rol: string }>('/usuarios/me', formData);

      // Actualizar el store con los nuevos datos
      if (token) {
        login(token, {
          nombre: res.data.nombre,
          mail: res.data.mail,
          rol: res.data.rol,
          fotoPerfil: res.data.fotoPerfil,
        });
      }

      onSuccess(res.data.descripcion, res.data.nombre);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } | string } };
      const raw = axiosErr?.response?.data;
      const msg =
        (typeof raw === 'object' && raw !== null && 'message' in raw ? raw.message : undefined) ||
        (typeof raw === 'string' ? raw : undefined) ||
        'Ocurrió un error al guardar los cambios.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setPendingSubmit(false);
    }
  };

  const labelClass = 'text-xs font-semibold uppercase tracking-widest mb-1 opacity-70 text-[#00EBDB]';
  const inputClass =
    'w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200 ' +
    'bg-white/5 border border-white/10 text-white placeholder-white/30 ' +
    'focus:border-[#00EBDB]/60 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(0,235,219,0.12)]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >


      {/* ── Panel principal ── */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: 'linear-gradient(145deg,#0d1117 0%,#161b22 100%)', border: '1px solid rgba(0,235,219,0.15)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,#00EBDB80,transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
            <p className="text-xs text-white/40 mt-0.5">Actualizá tu información personal</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-px mx-6 bg-white/5 shrink-0" />

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium text-red-300 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Foto de perfil */}
          <div className="flex flex-col">
            <label className={labelClass}>Foto de perfil</label>
            <div className="flex items-center gap-4 mt-2">
              <div
                className={`relative w-20 h-20 rounded-full overflow-hidden border-2 shrink-0 cursor-pointer transition-all duration-200 ${isDragOver ? 'border-[#00EBDB] shadow-[0_0_20px_rgba(0,235,219,0.4)]' : 'border-white/20 hover:border-[#00EBDB]/50'}`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={avatarPreview ?? cthulhuIcon} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#00EBDB]/30 text-[#00EBDB] hover:bg-[#00EBDB]/10 transition-all">
                  Seleccionar imagen
                </button>
                <p className="text-xs text-white/30">JPG, PNG o WEBP.<br />También podés arrastrar sobre el avatar.</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) selectFile(e.target.files[0]); }} />
          </div>

          {/* Nombre */}
          <div className="flex flex-col">
            <label className={labelClass}>Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre de usuario" className={inputClass} disabled={isLoading} />
          </div>

          {/* Descripción */}
          <div className="flex flex-col">
            <label className={labelClass}>Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Contá algo sobre vos..." rows={3} className={`${inputClass} resize-none`} disabled={isLoading} />
          </div>

          {/* Datos sensibles condicionales */}
          {!user?.esDemo && (
            !showSensibleData ? (
              <button
                type="button"
                onClick={() => setShowSensibleData(true)}
                className="mt-2 py-3 rounded-xl text-sm font-semibold border transition-all duration-200"
                style={{ borderColor: 'rgba(0,235,219,0.3)', color: '#00EBDB', background: 'rgba(0,235,219,0.05)' }}
              >
                Cambiar datos sensibles (Mail o Contraseña)
              </button>
            ) : (
            <div className="flex flex-col gap-5 p-4 rounded-xl border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {/* Mail */}
              <div className="flex flex-col">
                <label className={labelClass}>Correo electrónico</label>
                <input type="email" value={mail} onChange={e => setMail(e.target.value)} placeholder="tu@correo.com" className={inputClass} disabled={isLoading} />
              </div>

              {/* Nueva contraseña */}
              <div className="flex flex-col">
                <label className={labelClass}>Nueva contraseña <span className="font-normal opacity-60 normal-case tracking-normal">(opcional)</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Nueva contraseña" className={`${inputClass} pr-12`} disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              {password && (
                <div className="flex flex-col">
                  <label className={labelClass}>Confirmar nueva contraseña</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repetí la nueva contraseña" className={`${inputClass} pr-12 ${confirmPassword && confirmPassword !== password ? 'border-red-500/60' : ''}`} disabled={isLoading} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-white/5 flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-all disabled:opacity-40">
            Cancelar
          </button>
          <button type="button" onClick={handleSaveClick} disabled={isLoading || pendingSubmit}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-40 hover:shadow-[0_0_20px_rgba(0,235,219,0.3)]"
            style={{ background: 'linear-gradient(135deg,#00EBDB,#0099cc)', color: '#0d1117' }}>
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
