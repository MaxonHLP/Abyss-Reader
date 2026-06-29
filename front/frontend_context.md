# Contexto del Frontend - Abyss Reader

Este documento contiene el código fuente completo de los componentes, páginas, servicios y stores del frontend. Está diseñado para proporcionar a la IA el contexto total sobre el flujo de navegación, consumo de APIs y manejo de estado global.

---

## Archivo: `src/App.css`

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}

```

---

## Archivo: `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MasterDashboard from './pages/MasterDashboard';
import GroupDetails from './pages/GroupDetails';
import Groups from './pages/Groups';
import Catalog from './pages/Catalog';
import Work from './pages/Work';
import ChapterReader from './pages/ChapterReader';
import UserProfile from './pages/UserProfile';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/biblioteca" element={<Catalog />} />
        <Route path="/obra/:obraNombre" element={<Work />} />
        <Route path="/obra/:obraNombre/capitulo/:numero" element={<ChapterReader />} />
        <Route path="/grupos" element={<Groups />} />
        <Route path="/grupos/:id" element={<GroupDetails />} />
        
        {/* Rutas Protegidas - General (cualquier usuario autenticado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<UserProfile />} />
        </Route>

        {/* Rutas Protegidas - Administrativas (Rol: MASTER) */}
        <Route element={<ProtectedRoute requiredRole="MASTER" />}>
          <Route path="/master" element={<MasterDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

```

---

## Archivo: `src/components/Carousel.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  portada?: string;
  likes: number;
}

interface CarouselProps {
  obras: Obra[];
}

export default function Carousel({ obras }: CarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (obras.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % obras.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [obras.length]);

  if (!obras || obras.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + obras.length) % obras.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % obras.length);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[400px] overflow-hidden rounded-xl shadow-2xl group">
      {/* Cards Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {obras.map((obra) => (
          <div 
            key={obra.id} 
            className="w-full h-full flex-shrink-0 cursor-pointer flex"
            style={{ backgroundColor: 'var(--color-abyss-bg-carrusel)' }}
            onClick={() => navigate(`/obra/${obra.titulo}`)}
          >
            {/* Left side: Portada (50%) */}
            <div className="w-1/2 h-full relative flex items-center justify-center overflow-hidden">
              {obra.portada && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
                  style={{ backgroundImage: `url(${obra.portada})` }}
                />
              )}
              {obra.portada ? (
                <img 
                  src={obra.portada} 
                  alt={obra.titulo} 
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/20 text-white/50 relative z-10">
                  Sin portada
                </div>
              )}
            </div>

            {/* Right side: Info (50%) */}
            <div className="w-1/2 h-full p-8 flex flex-col justify-center overflow-hidden">
              <h2 
                className="text-3xl font-bold mb-4 line-clamp-2"
                style={{ color: 'var(--color-abyss-text-carrusel)' }}
              >
                {obra.titulo}
              </h2>
              <p 
                className="text-lg line-clamp-6 opacity-90"
                style={{ color: 'var(--color-abyss-text-carrusel)' }}
              >
                {obra.descripcion || 'Sin descripción.'}
              </p>
              <div className="mt-6 flex items-center space-x-2" style={{ color: 'var(--color-abyss-text-carrusel)' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span className="font-semibold">{obra.likes} Me gustas</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {obras.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {obras.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

```

---

## Archivo: `src/components/modales/CreateChapterModal.tsx`

```tsx
import { useState, useRef } from 'react';
import api from '../../services/api';

interface CreateChapterModalProps {
  isOpen: boolean;
  obraId: number;
  obraNombre: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateChapterModal = ({
  isOpen,
  obraId,
  obraNombre,
  onClose,
  onSuccess,
}: CreateChapterModalProps) => {
  const [numero, setNumero] = useState('');
  const [archivos, setArchivos] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    'bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear placeholder-abyss-text-input-form-crear/40 transition-shadow';
  const labelClass = 'text-abyss-text-titles-form-crear font-semibold mb-1';

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return;
    setNumero('');
    setArchivos(null);
    setError(null);
    setProgreso(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivos(e.target.files);
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
      setArchivos(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numeroFloat = parseFloat(numero);
    if (!numero.trim() || isNaN(numeroFloat) || numeroFloat <= 0) {
      setError('Ingresá un número de capítulo válido y mayor a 0.');
      return;
    }
    if (!archivos || archivos.length === 0) {
      setError('Debés seleccionar al menos una página.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgreso(`Subiendo ${archivos.length} página${archivos.length > 1 ? 's' : ''}...`);

    try {
      const formData = new FormData();

      // La metadata va como JSON blob en la parte "metadata"
      const metadataBlob = new Blob(
        [JSON.stringify({ numero: numeroFloat })],
        { type: 'application/json' }
      );
      formData.append('metadata', metadataBlob);

      // Las páginas van en orden en la parte "paginas"
      Array.from(archivos).forEach((file) => {
        formData.append('paginas', file);
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
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-md border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform">
        <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-1 text-center">
          Subir Capítulo
        </h2>
        <p className="text-center text-abyss-text-titles-form-crear/60 text-sm mb-6">
          {obraNombre}
        </p>

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

          {/* Selector de páginas */}
          <div className="flex flex-col">
            <label className={labelClass}>
              Páginas{' '}
              <span className="font-normal opacity-60">(imágenes en orden)</span>
            </label>
            <div
              className={`
                bg-abyss-bg-input-form-crear border border-abyss-border-input-form-crear rounded-lg p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 relative overflow-hidden
                ${isDragOver 
                  ? 'border-[#00EBDB] bg-[#00EBDB]/10 shadow-[0_0_20px_rgba(0,235,219,0.25)]' 
                  : 'hover:brightness-110'}
              `}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              onDragOver={handleNativeDragOver}
              onDragLeave={handleNativeDragLeave}
              onDrop={handleNativeDrop}
            >
              {/* Ícono de subida */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-abyss-text-input-form-crear/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-abyss-text-input-form-crear/60 text-sm text-center">
                {archivos && archivos.length > 0
                  ? `${archivos.length} archivo${archivos.length > 1 ? 's' : ''} seleccionado${archivos.length > 1 ? 's' : ''}`
                  : 'Hacé clic para seleccionar las páginas'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>

            {/* Vista previa de cantidad de archivos */}
            {archivos && archivos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from(archivos)
                  .slice(0, 6)
                  .map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/70 px-2 py-0.5 rounded"
                    >
                      {f.name.length > 18 ? f.name.slice(0, 15) + '…' : f.name}
                    </span>
                  ))}
                {archivos.length > 6 && (
                  <span className="text-xs text-abyss-text-input-form-crear/50 px-2 py-0.5">
                    +{archivos.length - 6} más
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Progreso / Error */}
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
          <div className="flex gap-4 mt-2">
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
              disabled={isLoading}
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

```

---

## Archivo: `src/components/modales/CreateCharacteristicModal.tsx`

```tsx
import { useState, useEffect } from 'react';
import { crearGenero, crearDemografia, crearTipo } from '../../services/masterService';

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
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-sm border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform">
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

```

---

## Archivo: `src/components/modales/CreateGroupModal.tsx`

```tsx
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

```

---

## Archivo: `src/components/modales/CreateMemberModal.tsx`

```tsx
import { useState, useEffect } from 'react';
import api from '../../services/api';

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
            <select 
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow font-bold"
            >
              <option value="MIEMBRO">Miembro</option>
              <option value="MIEMBRO_ADMIN">Miembro Administrador</option>
            </select>
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

```

---

## Archivo: `src/components/modales/CreateWorkModal.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

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

```

---

## Archivo: `src/components/modales/DeleteChapterModal.tsx`

```tsx
import { useState } from 'react';
import api from '../../services/api';

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
      const e = err as { response?: { data?: { message?: string } } };
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
          <select
            value={capituloSeleccionado}
            onChange={e => setCapituloSeleccionado(e.target.value ? Number(e.target.value) : '')}
            className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear border border-abyss-border-input-form-crear rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow appearance-none"
          >
            <option value="">— Seleccionar —</option>
            {capitulos.map(cap => (
              <option key={cap.id} value={cap.id}>
                Capítulo {cap.numero % 1 === 0 ? Math.floor(cap.numero) : cap.numero}
              </option>
            ))}
          </select>
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

```

---

## Archivo: `src/components/modales/EditChapterModal.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
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

interface CapituloListItem {
  id: number;
  numero: number;
  createdAt: string | null;
}

interface PaginaEditItem {
  /** ID único local usado por dnd-kit (no el de la BD) */
  id: string;
  tipo: 'vieja' | 'nueva';
  /** URL pública en GCS — sólo para páginas viejas */
  urlBd?: string;
  /** Archivo físico a subir — sólo para páginas nuevas */
  archivoFisico?: File;
  /** ObjectURL local para previsualizar la imagen nueva */
  previewUrl?: string;
}

interface EditChapterModalProps {
  isOpen: boolean;
  obraId: number;
  obraNombre: string;
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

  const imgSrc = item.tipo === 'vieja' ? item.urlBd : item.previewUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full max-w-md cursor-grab active:cursor-grabbing select-none"
      {...attributes}
      {...listeners}
    >
      <img
        src={imgSrc}
        alt="Página del capítulo"
        className="w-full h-auto rounded-lg shadow-md border border-white/10 pointer-events-none"
        draggable={false}
      />

      {/* Botón de borrado — absoluto arriba a la derecha */}
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

const EditChapterModal = ({
  isOpen,
  obraId,
  obraNombre,
  onClose,
  onSuccess,
}: EditChapterModalProps) => {
  // ── Estado del selector ───────────────────────────────────────────────────────
  const [capitulos, setCapitulos] = useState<CapituloListItem[]>([]);
  const [capituloSeleccionado, setCapituloSeleccionado] = useState<CapituloListItem | null>(null);
  const [isFetchingCapitulos, setIsFetchingCapitulos] = useState(false);

  // ── Estado de las páginas ─────────────────────────────────────────────────────
  const [items, setItems] = useState<PaginaEditItem[]>([]);
  const [isFetchingPaginas, setIsFetchingPaginas] = useState(false);

  // ── Estado general ────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Sensores DnD (reordenado interno — no conflicta con drag del SO) ──────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ── 1. Cargar lista de capítulos al abrir el modal ────────────────────────────
  useEffect(() => {
    if (!isOpen || !obraId) return;
    let cancelled = false;

    setIsFetchingCapitulos(true);
    setCapituloSeleccionado(null);
    setItems([]);
    setError(null);

    api
      .get<CapituloListItem[]>(`/obras/${obraId}/capitulos`)
      .then((res) => {
        if (!cancelled) setCapitulos(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la lista de capítulos.');
      })
      .finally(() => {
        if (!cancelled) setIsFetchingCapitulos(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, obraId]);

  // ── 2. Cargar páginas cuando se selecciona un capítulo ───────────────────────
  useEffect(() => {
    if (!capituloSeleccionado) return;
    let cancelled = false;

    setIsFetchingPaginas(true);
    setItems([]);
    setError(null);

    const nombreParam = obraNombre.replace(/ /g, '-');
    api
      .get(`/obras/${nombreParam}/capitulos/${capituloSeleccionado.numero}`)
      .then((res) => {
        if (cancelled) return;
        const paginasUrls: string[] = res.data.paginasUrls ?? [];
        setItems(
          paginasUrls.map((url) => ({
            id: crypto.randomUUID(),
            tipo: 'vieja' as const,
            urlBd: url,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setError('Error al cargar las páginas del capítulo.');
      })
      .finally(() => {
        if (!cancelled) setIsFetchingPaginas(false);
      });

    return () => { cancelled = true; };
  }, [capituloSeleccionado, obraNombre]);

  if (!isOpen) return null;

  // ── Cerrar y limpiar todo ─────────────────────────────────────────────────────
  const handleClose = () => {
    if (isLoading) return;
    items.forEach((i) => { if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setItems([]);
    setCapituloSeleccionado(null);
    setCapitulos([]);
    setError(null);
    setProgreso(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  // ── Selector de capítulo ──────────────────────────────────────────────────────
  const handleSelectCapitulo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const cap = capitulos.find((c) => c.id === id) ?? null;
    // Liberar ObjectURLs del capítulo anterior
    items.forEach((i) => { if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setCapituloSeleccionado(cap);
  };

  // ── Reordenar con DnD ─────────────────────────────────────────────────────────
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

  // ── Convertir FileList → PaginaEditItem[] y añadir al estado ─────────────────
  const agregarArchivos = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (arr.length === 0) return;
    const nuevas: PaginaEditItem[] = arr.map((file) => ({
      id: crypto.randomUUID(),
      tipo: 'nueva',
      archivoFisico: file,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...nuevas]);
  };

  // ── Selección via <input type="file"> ────────────────────────────────────────
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) agregarArchivos(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Eliminar una página del estado ────────────────────────────────────────────
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  // ── Zona de drop nativa del SO ────────────────────────────────────────────────
  // El drag del sistema operativo (desde el explorador de archivos) usa la
  // DataTransfer API nativa del browser — completamente independiente de dnd-kit,
  // que solo actúa cuando se arrastra un elemento React ya montado.
  const handleNativeDragOver = (e: React.DragEvent) => {
    // Verificar que se están arrastrando archivos (no elementos del DOM)
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleNativeDragLeave = (e: React.DragEvent) => {
    // Solo desactivar si el cursor salió del contenedor (no de un hijo)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      agregarArchivos(e.dataTransfer.files);
    }
  };

  // ── Ensamblaje de FormData y envío ────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!capituloSeleccionado) {
      setError('Seleccioná un capítulo primero.');
      return;
    }
    if (items.length === 0) {
      setError('El capítulo debe tener al menos una página.');
      return;
    }

    setIsLoading(true);
    setError(null);
    const totalNuevas = items.filter((i) => i.tipo === 'nueva').length;
    setProgreso(
      `Guardando${totalNuevas > 0
        ? ` (subiendo ${totalNuevas} imagen${totalNuevas > 1 ? 'es' : ''} nueva${totalNuevas > 1 ? 's' : ''})`
        : ''}...`
    );

    try {
      const formData = new FormData();
      const ordenFinalArray: string[] = [];
      const archivosNuevos: File[] = [];

      items.forEach((item) => {
        if (item.tipo === 'vieja' && item.urlBd) {
          ordenFinalArray.push(item.urlBd);
        } else if (item.tipo === 'nueva' && item.archivoFisico) {
          ordenFinalArray.push('NUEVO');
          archivosNuevos.push(item.archivoFisico);
        }
      });

      // Enviar ordenFinal como JSON Blob → Spring lo deserializa con Jackson a List<String>
      formData.append(
        'ordenFinal',
        new Blob([JSON.stringify(ordenFinalArray)], { type: 'application/json' })
      );
      archivosNuevos.forEach((file) => formData.append('archivosNuevos', file));

      // Sin Content-Type manual — el browser añade 'multipart/form-data; boundary=...'
      await api.put(`/capitulos/${capituloSeleccionado.id}`, formData);

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
        'Ocurrió un error al guardar los cambios.';
      setError(msg);
      setProgreso(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers de UI ─────────────────────────────────────────────────────────────
  const labelClass = 'text-abyss-text-titles-form-crear font-semibold';
  const inputClass =
    'bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear/80 border border-abyss-border-input-form-crear rounded-lg p-3 outline-none focus:ring-2 focus:ring-abyss-border-input-form-crear transition-shadow w-full';

  const hayCapituloYPaginas = capituloSeleccionado !== null;
  const isWorking = isFetchingCapitulos || isFetchingPaginas || isLoading;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-lg border border-abyss-border-input-form-crear/30 flex flex-col gap-5">

        {/* ── Cabecera ─────────────────────────────────────────────────────── */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-abyss-text-titles-form-crear mb-1">
            Editar Capítulo
          </h2>
          <p className="text-abyss-text-titles-form-crear/60 text-sm">{obraNombre}</p>
        </div>

        {/* ── Selector de capítulo ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Capítulo a editar</label>
          {isFetchingCapitulos ? (
            <p className="text-abyss-text-titles-form-crear/50 text-sm animate-pulse py-2">
              Cargando capítulos...
            </p>
          ) : capitulos.length === 0 ? (
            <p className="text-abyss-text-titles-form-crear/40 text-sm italic py-2">
              Esta obra no tiene capítulos.
            </p>
          ) : (
            <select
              className={inputClass}
              value={capituloSeleccionado?.id ?? ''}
              onChange={handleSelectCapitulo}
              disabled={isWorking}
            >
              <option value="">— Seleccioná un capítulo —</option>
              {capitulos.map((cap) => (
                <option key={cap.id} value={cap.id}>
                  Capítulo {cap.numero % 1 === 0 ? Math.floor(cap.numero) : cap.numero}
                  {cap.createdAt
                    ? `  ·  ${new Date(cap.createdAt).toLocaleDateString('es-AR')}`
                    : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Área de trabajo — visible sólo cuando hay capítulo seleccionado ─ */}
        {hayCapituloYPaginas && (
          <>
            {/* Hint de instrucciones */}
            <p className="text-abyss-text-titles-form-crear/40 text-xs text-center -mt-2">
              Arrastrá páginas para reordenarlas · ✕ para eliminar · Soltá imágenes desde el explorador para añadirlas
            </p>

            {/* Zona de imágenes con soporte de drop nativo del SO */}
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
              {isFetchingPaginas ? (
                <p className="text-abyss-text-titles-form-crear/60 text-sm animate-pulse py-8">
                  Cargando páginas...
                </p>
              ) : items.length === 0 ? (
                /* Estado vacío — invita al drag */
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
                  {/* Overlay de drop sobre la lista existente */}
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
          </>
        )}

        {/* ── Feedback ─────────────────────────────────────────────────────── */}
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

        {/* ── Input de archivo oculto ──────────────────────────────────────── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isLoading}
        />

        {/* ── Botones de acción ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Botón añadir imágenes — solo si hay capítulo seleccionado */}
          {hayCapituloYPaginas && (
            <button
              type="button"
              onClick={() => !isLoading && fileInputRef.current?.click()}
              disabled={isWorking}
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
          )}

          {/* Cancelar / Guardar */}
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
              type="button"
              onClick={handleGuardar}
              disabled={isWorking || !capituloSeleccionado}
              className="flex-1 bg-abyss-bg-button-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditChapterModal;

```

---

## Archivo: `src/components/modales/EditGroupModal.tsx`

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { editarGrupo } from '../../services/masterService';

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
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Ocurrió un error al intentar editar el grupo.");
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

```

---

## Archivo: `src/components/modales/EditProfileModal.tsx`

```tsx
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

interface ConfirmPopupState {
  visible: boolean;
  tipo: 'mail' | 'password' | null;
}

export default function EditProfileModal({ isOpen, onClose, descripcionActual, onSuccess }: EditProfileModalProps) {
  const { user, login, token } = useAuthStore();

  const [nombre, setNombre] = useState('');
  const [mail, setMail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showSensibleData, setShowSensibleData] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popup de confirmación para cambios sensibles
  const [confirmPopup, setConfirmPopup] = useState<ConfirmPopupState>({ visible: false, tipo: null });
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Inicializar campos al abrir
  useEffect(() => {
    if (!isOpen) return;
    setNombre(user?.nombre ?? '');
    setMail(user?.mail ?? '');
    setDescripcion(descripcionActual ?? '');
    setPassword('');
    setConfirmPassword('');
    setContrasenaActual('');
    setAvatarFile(null);
    setAvatarPreview(user?.fotoPerfil ?? null);
    setError(null);
    setConfirmPopup({ visible: false, tipo: null });
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
    const cambiaMail = mail.trim() !== '' && mail.trim() !== user?.mail;
    const cambiaPass = password.trim() !== '';

    if (cambiaPass && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (cambiaMail && cambiaPass) {
      setConfirmPopup({ visible: true, tipo: 'password' }); // pide la actual una sola vez
      setPendingSubmit(true);
      return;
    }
    if (cambiaMail) {
      setConfirmPopup({ visible: true, tipo: 'mail' });
      setPendingSubmit(true);
      return;
    }
    if (cambiaPass) {
      setConfirmPopup({ visible: true, tipo: 'password' });
      setPendingSubmit(true);
      return;
    }
    submitForm();
  };

  const handleConfirmPopupAccept = () => {
    setConfirmPopup({ visible: false, tipo: null });
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
        requestData.contrasenaActual = contrasenaActual.trim();
      }
      if (mail.trim() !== user?.mail) {
        requestData.contrasenaActual = contrasenaActual.trim();
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
      {/* ── Pop-up de confirmación ── */}
      {confirmPopup.visible && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
            style={{ background: '#161b22', border: '1px solid rgba(0,235,219,0.2)' }}
          >
            <h3 className="text-base font-bold text-white">Confirmar cambio sensible</h3>
            <p className="text-sm text-white/60">
              {confirmPopup.tipo === 'mail'
                ? 'Estás por cambiar tu correo electrónico. Ingresá tu contraseña actual para confirmar.'
                : 'Estás por cambiar tu contraseña. Ingresá tu contraseña actual para confirmar.'}
            </p>
            <div className="relative">
              <input
                type={showActual ? 'text' : 'password'}
                value={contrasenaActual}
                onChange={e => setContrasenaActual(e.target.value)}
                placeholder="Contraseña actual"
                className={inputClass}
                autoFocus
              />
              <button type="button" onClick={() => setShowActual(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmPopup({ visible: false, tipo: null }); setPendingSubmit(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button onClick={handleConfirmPopupAccept}
                disabled={!contrasenaActual.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#00EBDB,#0099cc)', color: '#0d1117' }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

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
          {!showSensibleData ? (
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
                {mail !== user?.mail && <p className="text-xs text-amber-400/80 mt-1">⚠ Cambiar el correo requerirá confirmación de contraseña.</p>}
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
          )}
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

```

---

## Archivo: `src/components/modales/EditWorkModal.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

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
    <div className="fixed inset-0 flex items-center justify-center bg-abyss-filter-form-crear/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-abyss-bg-form-crear p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-2xl border border-abyss-border-input-form-crear/30 transform scale-100 transition-transform max-h-[90vh] overflow-y-auto flex flex-col gap-5">
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
                  <select
                    value={estado}
                    onChange={e => setEstado(e.target.value)}
                    className={inputClass}
                  >
                    <option value="EN_EMISION">EN EMISIÓN</option>
                    <option value="PAUSADO">PAUSADO</option>
                    <option value="FINALIZADO">FINALIZADO</option>
                  </select>
                </div>

                {/* Géneros */}
                <div>
                  <label className={labelClass}>Géneros</label>
                  <div className="flex gap-2 mb-3">
                    <select
                      value={generoSeleccionado}
                      onChange={e => setGeneroSeleccionado(Number(e.target.value))}
                      className={`${inputClass} flex-1`}
                    >
                      <option value="">— Agregar género —</option>
                      {generosDisponibles.map(g => (
                        <option key={g.id} value={g.id}>{g.nombre}</option>
                      ))}
                    </select>
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

```

---

## Archivo: `src/components/modales/ManageCharacteristicsModal.tsx`

```tsx
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

```

---

## Archivo: `src/components/Navbar.tsx`

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import iconCthulhu from '../assets/icono cthulhu.png';
import iconTitle from '../assets/icon tittle.png';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');

  const getRoleNav = () => {
    if (!isAuthenticated || !user || user.rol === 'LECTOR') {
      return { text: 'grupos', url: '/grupos' };
    } else if (user.rol === 'MIEMBRO_ADMIN' || user.rol === 'MIEMBRO') {
      return { text: 'Ver mi grupo', url: `/grupos/${user.grupoId || ''}` };
    } else if (user.rol === 'MASTER') {
      return { text: 'observar mis dominios', url: '/master' };
    }
    return { text: 'grupos', url: '/grupos' };
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/biblioteca?search=${encodeURIComponent(search)}`);
    }
  };

  const navInfo = getRoleNav();

  return (
    <>
    <nav className="w-full flex items-center justify-between px-6 py-0.5 shadow-md" style={{ backgroundColor: 'var(--color-abyss-navbar-bg)' }}>
      {/* Izquierda */}
      <div className="flex items-center gap-6">
        <img 
          src={iconCthulhu} 
          alt="Icono Cthulhu" 
          className="h-24 w-auto cursor-pointer"  
          onClick={() => navigate('/')} 
        />
        <button 
          onClick={() => navigate(navInfo.url)}
          className="font-bold cursor-pointer hover:brightness-110 transition uppercase tracking-wide text-sm"
          style={{ color: 'var(--color-abyss-navbar-text)' }}
        >
          {navInfo.text}
        </button>
      </div>

      {/* Centro */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <img 
          src={iconTitle} 
          alt="Title" 
          className="h-20 w-auto cursor-pointer" 
          onClick={() => navigate('/')}
        />
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="buscar ..."
            className="rounded-full px-5 py-3 w-80 md:w-96 lg:w-[500px] outline-none font-medium pr-10 text-base shadow-inner transition-colors focus:ring-2 focus:ring-opacity-50 focus:ring-(--color-abyss-navbar-text-searchbar)"
            style={{ 
              backgroundColor: 'var(--color-abyss-navbar-bg-searchbar)', 
              color: 'var(--color-abyss-navbar-text-searchbar)' 
            }}
          />
          <svg 
            className="w-5 h-5 absolute right-3 pointer-events-none" 
            style={{ color: 'var(--color-abyss-navbar-text-searchbar)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isAuthenticated && user && user.fotoPerfil ? (
          <img 
            src={user.fotoPerfil} 
            alt="Perfil" 
            className="w-11 h-11 rounded-full object-cover cursor-pointer hover:brightness-110 transition shadow-md border-2 border-[var(--color-abyss-navbar-icon-perfil)]"
            onClick={() => navigate('/perfil')}
          />
        ) : (
          <div 
            className="w-11 h-11 flex items-center justify-center rounded-full cursor-pointer hover:brightness-110 transition shadow-md bg-black/10"
            onClick={() => navigate('/perfil')}
          >
            <svg 
              className="w-8 h-8" 
              style={{ color: 'var(--color-abyss-navbar-icon-perfil)' }}
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}

```

---

## Archivo: `src/components/ProtectedRoute.tsx`

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  requiredRole?: string;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({ requiredRole, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo enviamos a la ruta de redirección por defecto (login)
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    // Si la ruta requiere un rol específico y el usuario no lo tiene, lo mandamos al home o a una página de no autorizado
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && (!user?.rol || !allowedRoles.includes(user.rol))) {
    return <Navigate to="/" replace />;
  }

  // Si pasa las validaciones, renderizamos las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;

```

---

## Archivo: `src/index.css`

```css
@import "tailwindcss";

@theme {
  /*login*/
  --color-abyss-bg-nav: #0A5571;
  --color-abyss-bg-png:#017C98;
  --color-abyss-bg-log: #53B0AA;
  --color-abyss-text-log: #014660;
  --color-abyss-text-muted:#003E51;
  --color-abyss-bg-input:#1A6A89;
  --color-abyss-text-input:#5DD5CD;
  --color-abyss-border-input:#014660;

  /*Vista Master*/
    --color-abyss-bg-Master:#025C70;
    --color-abyss-text-title-Master:#33BDE0;

    /*Button seccion grupos-caracteristicas */
    --color-abyss-bg-button-on-sec-master:#029797;
    --color-abyss-bg-button-off-sec-master:#037571;
    --color-abyss-text-button-on-sec-master:#005069;
    --color-abyss-text-button-off-sec-master:#00403D;
    --color-abyss-border-button-on-sec-master:#005069;
   

    /* card grupo */
    --color-abyss-bg-card-gp:#017C98;
    --color-abyss-text-card-gp:#014660;
    --color-abyss-bg-text-card-gp:#009F97;/*65%*/
    --color-abyss-border-card-gp:#00A89D;

    /* card crear grupo */
    --color-abyss-bg-card-crear-gp:#00838F;
    --color-abyss-text-card-crear-gp:#003E51;
    --color-abyss-bg-text-card-crear-gp:#009F97;
    --color-abyss-border-card-crear-gp:#005859;
    
    /* select caracts*/
    --color-abyss-bg-select-sec-master:#008C86;
    --color-abyss-border-select-sec-master:#003E51;
    --color-abyss-text-select-sec-master:#014660;
    /*item select*/
    --color-abyss-bg-item-select:#005E83;
    --color-abyss-text-item-select:#0FBAF9;
    --color-abyss-border-item-select:#014660;
    /* boton crear caract*/
    --color-abyss-bg-button-create-caract:#1A6A89;
    --color-abyss-text-button-create-caract:#25F7E9;
    --color-abyss-border-button-create-caract:#004761;
    /*form crear*/
    --color-abyss-filter-form-crear:#1A6A89;/*50%*/
    --color-abyss-text-titles-form-crear:#014660;
    --color-abyss-bg-form-crear:#53B0AA;
    --color-abyss-bg-input-form-crear:#008C86;
    --color-abyss-text-input-form-crear:#5DD5CD;/*70%*/
    --color-abyss-border-input-form-crear:#014660;
      /*confirm y cancel button*/
      --color-abyss-coment-cc:#014660;
      --color-abyss-bg-button-cc:#008C86;
      --color-abyss-text-button-cc:#26F6E9;
      --color-abyss-border-button-cc:#005859;
  /*vista busqueda */
    --color-abyss-bg-barra-busqueda:#1A6A89;
    --color-abyss-text-barra-busqueda:#00EBDB;
    --color-abyss-bg-selecs:#014660;
    --color-abyss-title-selecs:#00A89D;/*filtros generales , generos*/
    --color-abyss-bg-filter-selecs:#1A6A89;/*fondo de general de todas las opciones de filtro*/
    --color-abyss-bg-title-option:#014660;
    --color-abyss-title-option:#00BFB3;/*tipos , demografia , estado*/
    --color-abyss-text-name-option:#00BFB3;/*manga , manhua , seinen , shounen , en emision*//*sin bg de name*/
    --color-abyss-checkbox:#00BFB3;
    --color-abyss-checkbox-border:#014660;
  /*Vista obras*/
      --color-abyss-bg-obras:#005859;
      --color-abyss-bg-card-obra:#439892;/*75%*/
      --color-abyss-text-name-obra:#014660;
      --color-abyss-text-description-obra:#003E51;/*descripcion*/
      --color-abyss-title-generos-obra:#014660;
      --color-abyss-text-generos-obra:#04C1B5;
      --color-abyss-bg-generos-obra:#025B6F;
      --color-abyss-text-grupo-obra:#00514B; /* Verde oscuro */
      --color-abyss-bg-grupo-obra:rgba(1, 72, 94, 0.4); /* Azul muy levemente oscuro con opacidad para combinar */
      /* buton eliminar */
      --color-abyss-bg-button-eliminar:#004E6B;
      --color-abyss-text-button-eliminar:#00A89D;
      --color-abyss-border-button-eliminar:#003A3B;
      /* boton editar*/
      --color-abyss-bg-button-editar:#00A89D;
      --color-abyss-text-button-editar:#003E51;
      --color-abyss-border-button-editar:#003A3B;
      /* boton guardar obra*/
      --color-abyss-bg-gradiente-1-button-guardar:#5BC8D2;
      --color-abyss-bg-gradiente-2-button-guardar:#00514B;
      --color-abyss-text-button-guardar-obra:#014660;
      /*card capitulos*/
      --color-abyss-bg-card-capitulos:#439892;/*100%*/
      --color-abyss-bg-boton-capituloX:#025266;
      --color-abyss-text-boton-capituloX:#00EEDE;
      --color-abyss-border-boton-capituloX:#003E51;
/*vista capitulos*/
    --color-abyss-bg-fondo-capitulos:#005859;
    --color-abyss-text-capitulos:#53B0AA;/*textos de nombres de capitulos y titulo de la obra*/
    --color-abyss-bg-boton-off-capitulos:#017472;
    --color-abyss-text-boton-off-capitulos:#063C51;
    --color-abyss-border-boton-off-capitulos:#016B69;
    --color-abyss-bg-boton-on-centro-capitulos:#019AC0;
    --color-abyss-bg-boton-on-bordes-capitulos:#01485E;
    /*el boton en on debe tener un gradiente entre el color centro y bordes*/
    --color-abyss-text-boton-on-capitulos:#00514B;
/*vista perfil*/
    --color-abyss-bg-perfil:#005859;
    /*fondo decorado + png*/
    --color-abyss-bg-png-perfil:#017C98;
    /* boton editar perfil */
    --color-abyss-bg-button-edit-perfil:#1A6A89;
    --color-abyss-text-button-edit-perfil:#26B3C0;
    --color-abyss-border-button-edit-perfil:#01485E;
    /*botones secciones */
      /* boton off */
      --color-abyss-text-button-off-seccion-perfil:#53B0AA;
      --color-abyss-linea-button-off-seccion-perfil:#01485E;
      /* boton on */
      --color-abyss-text-button-on-seccion-perfil:#25F7E9;
      --color-abyss-bg-gradiente-1-button-on-seccion-perfil:#00A298;
      --color-abyss-bg-gradiente-2-button-on-seccion-perfil:#015056;/*gradiente lineal de arriba abajo color 1 arriba color 2 abajo*/
    /*seccion historial*/
      /*card historial*/
      --color-abyss-bg-card-historial:#006678;
      --color-abyss-text-card-historial:#00EBDB;
    /*seccion guardados*/
      /* boton estados off */
      --color-abyss-bg-button-estados-off:#017472;
      --color-abyss-text-button-estados-off:#3DB4BF;
      --color-abyss-border-button-estados-off:#004A4A;
      /* boton estados on */
      --color-abyss-bg-gradiente-1-button-estados-on:#019AC0;
      --color-abyss-bg-gradiente-2-button-estados-on:#01485E;/*gradiente centrar color 1 centro color 2 bordes*/
      --color-abyss-text-button-estados-on:#02B5E2;
      /*sin borde*/
      --color-abyss-border-button-estados-on:none;
    /*Componente navbar*/
    --color-abyss-navbar-bg: #0A5571;  /* Fondo de la barra */
    --color-abyss-navbar-text: #00E6D7; /* Color principal de texto y links */
    --color-abyss-navbar-bg-searchbar:#1A6A89;
    --color-abyss-navbar-text-searchbar:#25F7E9;
    --color-abyss-navbar-icon-perfil:#009F97;
    /*vista principal*/
      --color-abyss-bg-principal:#005859;
      --color-abyss-text-titles-principal:#53B0AA;
      /*carrusel*/
      --color-abyss-bg-carrusel:#025266;
      --color-abyss-text-carrusel:#00BFB3;
      /*filtro genero*/
      --color-abyss-bg-filter-genero:#00A89D;
      --color-abyss-text-filter-genero:#013E56;
      



      

      


}
```

---

## Archivo: `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

---

## Archivo: `src/pages/Catalog.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { obtenerCaracteristicas } from '../services/masterService';
import Navbar from '../components/Navbar';

interface Caracteristica {
  id: number;
  nombre: string;
}

interface Obra {
  id: number;
  titulo: string;
  portada?: string;
  tipo?: Caracteristica;
  demografia?: Caracteristica;
  generos?: Caracteristica[];
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State for filter options
  const [tipos, setTipos] = useState<Caracteristica[]>([]);
  const [demografias, setDemografias] = useState<Caracteristica[]>([]);
  const [generos, setGeneros] = useState<Caracteristica[]>([]);
  
  // State for collapsing sections
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [generosOpen, setGenerosOpen] = useState(false);

  // State for works results
  const [obras, setObras] = useState<Obra[]>([]);
  
  // Load filter options on mount
  useEffect(() => {
    obtenerCaracteristicas().then((data) => {
      setGeneros(data.generos || []);
      setDemografias(data.demografias || []);
      setTipos(data.tipos || []);
    }).catch(console.error);
  }, []);

  // Fetch /api/catalogo when search params change
  useEffect(() => {
    const fetchObras = async () => {
      try {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        
        const response = await api.get('/catalogo', { params });
        // Handling paginated Spring Boot response if applicable
        if (response.data && Array.isArray(response.data.content)) {
          setObras(response.data.content);
        } else if (Array.isArray(response.data)) {
          setObras(response.data);
        }
      } catch (error) {
        console.error("Error fetching catalog", error);
      }
    };
    fetchObras();
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (text) {
      newParams.set('titulo', text);
    } else {
      newParams.delete('titulo');
    }
    setSearchParams(newParams);
  };

  const handleCheckboxChange = (category: string, id: number, checked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    const current = newParams.get(category);
    let ids = current ? current.split(',').filter(Boolean) : [];
    
    if (checked) {
      ids.push(id.toString());
    } else {
      ids = ids.filter(itemId => itemId !== id.toString());
    }

    if (ids.length > 0) {
      newParams.set(category, ids.join(','));
    } else {
      newParams.delete(category);
    }
    
    setSearchParams(newParams);
  };

  const isChecked = (category: string, id: number) => {
    const current = searchParams.get(category);
    if (!current) return false;
    return current.split(',').includes(id.toString());
  };

  return (
    <div className="min-h-screen bg-abyss-bg-nav text-white">
      <Navbar />

      {/* Main Content */}
      <main className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        
        {/* 2. Motor de búsqueda y Ordenamiento */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative w-full md:flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-abyss-text-barra-busqueda opacity-70 group-focus-within:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar título, autor..."
              value={searchParams.get('titulo') || ''}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-abyss-bg-barra-busqueda text-abyss-text-barra-busqueda placeholder-abyss-text-barra-busqueda/60 border border-abyss-border-input focus:outline-none focus:ring-2 focus:ring-abyss-text-barra-busqueda shadow-inner transition-all"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={searchParams.get('sort') || ''}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set('sort', e.target.value);
                } else {
                  newParams.delete('sort');
                }
                setSearchParams(newParams);
              }}
              className="w-full px-4 py-3 rounded-lg bg-abyss-bg-barra-busqueda text-abyss-text-barra-busqueda border border-abyss-border-input focus:outline-none focus:ring-2 focus:ring-abyss-text-barra-busqueda shadow-inner transition-all appearance-none cursor-pointer"
            >
              <option value="">Por defecto</option>
              <option value="vistas,desc">Vistas</option>
              <option value="likes,desc">Me Gustas</option>
            </select>
          </div>
        </div>

        {/* Controladores de filtro */}
        <div className="space-y-4 max-w-4xl mx-auto mb-10">
          
          {/* Primer selector: Filtros Generales */}
          <div className="rounded-lg overflow-hidden bg-abyss-bg-selecs border border-abyss-border-input shadow-md">
            <button 
              onClick={() => setFiltrosOpen(!filtrosOpen)}
              className="w-full px-5 py-4 text-left font-bold text-abyss-title-selecs bg-abyss-bg-selecs flex justify-between items-center hover:bg-abyss-bg-selecs/90 transition-colors"
            >
              <span className="text-lg tracking-wide uppercase">Filtros</span>
              <svg className={`w-5 h-5 transition-transform duration-300 ${filtrosOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${filtrosOpen ? 'max-h-[1000px] opacity-100 border-t border-abyss-border-input' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 bg-abyss-bg-filter-selecs grid grid-cols-1 sm:grid-cols-3 gap-8">
                
                {/* Tipo */}
                <div>
                  <h3 className="text-abyss-title-option bg-abyss-bg-title-option px-4 py-1.5 mb-4 rounded font-bold uppercase tracking-wider text-sm shadow-sm inline-block">Tipo</h3>
                  <div className="flex flex-col space-y-3">
                    {tipos.map(tipo => (
                      <label key={tipo.id} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked('tipoId', tipo.id)}
                          onChange={(e) => handleCheckboxChange('tipoId', tipo.id, e.target.checked)}
                          className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                        />
                        <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors">{tipo.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Demografía */}
                <div>
                  <h3 className="text-abyss-title-option bg-abyss-bg-title-option px-4 py-1.5 mb-4 rounded font-bold uppercase tracking-wider text-sm shadow-sm inline-block">Demografía</h3>
                  <div className="flex flex-col space-y-3">
                    {demografias.map(demo => (
                      <label key={demo.id} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked('demografiaId', demo.id)}
                          onChange={(e) => handleCheckboxChange('demografiaId', demo.id, e.target.checked)}
                          className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                        />
                        <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors">{demo.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <h3 className="text-abyss-title-option bg-abyss-bg-title-option px-4 py-1.5 mb-4 rounded font-bold uppercase tracking-wider text-sm shadow-sm inline-block">Estado</h3>
                  <div className="flex flex-col space-y-3">
                    {['En emisión', 'Finalizado', 'Pausado'].map((estadoString, index) => {
                        const estadoValue = index === 0 ? 'EN_EMISION' : index === 1 ? 'FINALIZADO' : 'PAUSADO';
                        return (
                      <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked('estado', estadoValue as any)}
                          onChange={(e) => handleCheckboxChange('estado', estadoValue as any, e.target.checked)}
                          className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                        />
                        <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors">{estadoString}</span>
                      </label>
                    )})}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Segundo selector: Géneros */}
          <div className="rounded-lg overflow-hidden bg-abyss-bg-selecs border border-abyss-border-input shadow-md">
            <button 
              onClick={() => setGenerosOpen(!generosOpen)}
              className="w-full px-5 py-4 text-left font-bold text-abyss-title-selecs bg-abyss-bg-selecs flex justify-between items-center hover:bg-abyss-bg-selecs/90 transition-colors"
            >
              <span className="text-lg tracking-wide uppercase">Géneros</span>
              <svg className={`w-5 h-5 transition-transform duration-300 ${generosOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${generosOpen ? 'max-h-[2000px] opacity-100 border-t border-abyss-border-input' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 bg-abyss-bg-filter-selecs">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-6">
                  {generos.map(genero => (
                    <label key={genero.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChecked('generoId', genero.id)}
                        onChange={(e) => handleCheckboxChange('generoId', genero.id, e.target.checked)}
                        className="appearance-none w-4 h-4 rounded-sm border-2 border-abyss-checkbox-border bg-abyss-bg-selecs checked:bg-abyss-checkbox checked:border-abyss-checkbox cursor-pointer relative transition-colors checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[5px] checked:after:h-[10px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-[#012533] checked:after:rotate-45 focus:outline-none focus:ring-2 focus:ring-abyss-checkbox focus:ring-offset-1 focus:ring-offset-abyss-bg-filter-selecs"
                      />
                      <span className="text-abyss-text-name-option group-hover:text-abyss-text-barra-busqueda transition-colors text-sm truncate" title={genero.nombre}>{genero.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Grid de Resultados */}
        <div className="mt-12">
          {obras.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8">
              {obras.map(obra => (
                <div 
                  key={obra.id} 
                  onClick={() => navigate(`/obra/${obra.titulo}`)}
                  className="bg-abyss-bg-card-gp rounded-xl overflow-hidden border border-abyss-border-card-gp hover:shadow-[0_0_20px_rgba(0,168,157,0.4)] transition-all duration-300 group cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] relative overflow-hidden bg-abyss-bg-selecs">
                    {obra.portada ? (
                      <img 
                        src={obra.portada} 
                        alt={obra.titulo} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-abyss-text-muted bg-abyss-bg-selecs/50">
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Sin portada</span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#012533]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {obra.tipo && (
                        <span className="bg-abyss-bg-text-card-gp/90 text-abyss-text-card-gp text-xs font-black px-2.5 py-1 rounded shadow backdrop-blur-sm tracking-wide">
                          {obra.tipo.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Info Section */}
                  <div className="p-4 flex-grow flex flex-col justify-between bg-abyss-bg-card-gp relative z-10">
                    <div>
                      <h3 className="font-bold text-abyss-text-barra-busqueda line-clamp-2 text-sm md:text-base leading-snug mb-1 group-hover:text-white transition-colors">
                        {obra.titulo}
                      </h3>
                      {obra.demografia && (
                        <span className="text-xs text-abyss-text-name-option/90 font-medium">
                          {obra.demografia.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <svg className="w-16 h-16 text-abyss-text-muted mb-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-abyss-text-barra-busqueda mb-2">Sin resultados</h3>
              <p className="text-abyss-text-name-option max-w-md">
                No se encontraron obras que coincidan con los filtros seleccionados. Intenta ajustando tu búsqueda.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

```

---

## Archivo: `src/pages/ChapterReader.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  obtenerCapituloDeObra,
  type CapituloResponseDTO,
} from '../services/chapterService';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Navbar from '../components/Navbar';

// ────────────────────────────────────────────────────────────
// Icono de flecha izquierda
// ────────────────────────────────────────────────────────────
function IconArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Icono de flecha derecha
// ────────────────────────────────────────────────────────────
function IconArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Icono de lista (volver a la obra)
// ────────────────────────────────────────────────────────────
function IconList() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Icono de flecha arriba (scroll to top)
// ────────────────────────────────────────────────────────────
function IconArrowUp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Botón de navegación con estado on/off
// ────────────────────────────────────────────────────────────
interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

function NavButton({ onClick, children, title }: NavButtonProps) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    // Pequeño delay visual antes de navegar
    setTimeout(() => {
      setActive(false);
      onClick();
    }, 180);
  };

  return (
    <button
      title={title}
      onClick={handleClick}
      style={
        active
          ? {
              background: `linear-gradient(135deg, var(--color-abyss-bg-boton-on-centro-capitulos), var(--color-abyss-bg-boton-on-bordes-capitulos))`,
              color: `var(--color-abyss-text-boton-on-capitulos)`,
              borderColor: `var(--color-abyss-bg-boton-on-bordes-capitulos)`,
            }
          : {
              background: `var(--color-abyss-bg-boton-off-capitulos)`,
              color: `var(--color-abyss-text-boton-off-capitulos)`,
              borderColor: `var(--color-abyss-border-boton-off-capitulos)`,
            }
      }
      className="flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-150 shadow-md hover:brightness-125 active:scale-95"
    >
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Barra de navegación superior (sin botón de subir)
// ────────────────────────────────────────────────────────────
interface TopNavBarProps {
  capitulo: CapituloResponseDTO;
  onPrev: () => void;
  onList: () => void;
  onNext: () => void;
}

function TopNavBar({ capitulo, onPrev, onList, onNext }: TopNavBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      {capitulo.numeroAnterior !== null ? (
        <NavButton onClick={onPrev} title="Capítulo anterior">
          <IconArrowLeft />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}

      <NavButton onClick={onList} title="Volver a la obra">
        <IconList />
      </NavButton>

      {capitulo.numeroSiguiente !== null ? (
        <NavButton onClick={onNext} title="Capítulo siguiente">
          <IconArrowRight />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Barra de navegación inferior (con botón de subir al inicio)
// ────────────────────────────────────────────────────────────
interface BottomNavBarProps extends TopNavBarProps {
  onScrollTop: () => void;
}

function BottomNavBar({ capitulo, onPrev, onList, onNext, onScrollTop }: BottomNavBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8 mb-10">
      {capitulo.numeroAnterior !== null ? (
        <NavButton onClick={onPrev} title="Capítulo anterior">
          <IconArrowLeft />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}

      <NavButton onClick={onList} title="Volver a la obra">
        <IconList />
      </NavButton>

      {capitulo.numeroSiguiente !== null ? (
        <NavButton onClick={onNext} title="Capítulo siguiente">
          <IconArrowRight />
        </NavButton>
      ) : (
        <div className="w-11 h-11" />
      )}

      <NavButton onClick={onScrollTop} title="Volver al inicio">
        <IconArrowUp />
      </NavButton>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Componente principal: ChapterReader
// ────────────────────────────────────────────────────────────
export default function ChapterReader() {
  const { obraNombre, numero } = useParams<{ obraNombre: string; numero: string }>();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [capitulo, setCapitulo] = useState<CapituloResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!obraNombre || !numero) return;

    let cancelled = false;
    obtenerCapituloDeObra(obraNombre, parseFloat(numero))
      .then((data) => { if (!cancelled) { setCapitulo(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('No se pudo cargar el capítulo. Verificá que exista.'); setLoading(false); } });

    return () => { cancelled = true; };
  }, [obraNombre, numero]);

  /**
   * Tracking silencioso: se dispara cuando el capítulo termina de cargar.
   * No afecta la UI bajo ninguna circunstancia (error silenciado con console.warn).
   * Solo activo para usuarios autenticados.
   */
  useEffect(() => {
    if (!capitulo || !user) return;
    api.post('/historial/tracking', {
      obraId: capitulo.obraId,
      capituloId: capitulo.id,
    }).catch((err) => {
      console.warn('[Tracking] No se pudo registrar el progreso:', err?.response?.status);
    });
  }, [capitulo?.id]);  // eslint-disable-line react-hooks/exhaustive-deps -- capitulo.obraId no cambia si capitulo.id no cambia

  /**
   * Marcar como leído cuando el usuario llega al final de la página.
   */
  useEffect(() => {
    if (!capitulo || !user) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          api.post(`/capitulos/${capitulo.id}/leido`).catch((err) => {
            console.warn('[Tracking] No se pudo marcar como leído:', err?.response?.status);
          });
          observer.disconnect(); // Solo llamarlo una vez por capítulo
        }
      },
      { threshold: 0.1 } // Se activa cuando al menos el 10% del div es visible
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [capitulo?.id, user]);

  // ── Handlers de navegación ──
  const handleList = () => navigate(`/obra/${obraNombre}`);

  const handlePrev = () => {
    if (capitulo?.numeroAnterior == null) return;
    navigate(`/obra/${obraNombre}/capitulo/${capitulo.numeroAnterior}`);
  };

  const handleNext = () => {
    if (capitulo?.numeroSiguiente == null) return;
    navigate(`/obra/${obraNombre}/capitulo/${capitulo.numeroSiguiente}`);
  };

  const handleScrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Estados de carga / error ──
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-abyss-bg-fondo-capitulos)' }}
      >
        <p className="text-lg animate-pulse" style={{ color: 'var(--color-abyss-text-capitulos)' }}>
          Cargando capítulo...
        </p>
      </div>
    );
  }

  if (error || !capitulo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-abyss-bg-fondo-capitulos)' }}
      >
        <p className="text-xl font-bold" style={{ color: 'var(--color-abyss-text-capitulos)' }}>
          {error ?? 'Capítulo no encontrado.'}
        </p>
      </div>
    );
  }

  const tituloFormateado = obraNombre?.replace(/-/g, ' ') ?? '';

  return (
    <>
      <Navbar />
      <div
        ref={topRef}
        className="min-h-screen flex flex-col items-center"
        style={{ background: 'var(--color-abyss-bg-fondo-capitulos)' }}
      >
        <div className="w-full flex flex-col items-center pt-8 pb-2 px-4">
          <h1
            className="text-3xl md:text-4xl font-bold text-center tracking-wide"
            style={{ color: 'var(--color-abyss-text-capitulos)' }}
          >
            {tituloFormateado}
          </h1>
          <p
            className="mt-2 text-lg font-semibold"
          style={{ color: 'var(--color-abyss-text-capitulos)', opacity: 0.8 }}
        >
          Capítulo {capitulo.numero % 1 === 0 ? Math.floor(capitulo.numero) : capitulo.numero}
        </p>
      </div>

      {/* ── Barra de navegación superior ── */}
      <TopNavBar
        capitulo={capitulo}
        onPrev={handlePrev}
        onList={handleList}
        onNext={handleNext}
      />

      {/* ── Lista de páginas en cascada ── */}
      <div className="w-full max-w-3xl flex flex-col items-center mt-6">
        {capitulo.paginasUrls.length > 0 ? (
          capitulo.paginasUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Página ${index + 1}`}
              className="w-full block"
              style={{ display: 'block', lineHeight: 0 }}
              loading="lazy"
            />
          ))
        ) : (
          <p
            className="mt-20 text-center opacity-60"
            style={{ color: 'var(--color-abyss-text-capitulos)' }}
          >
            Este capítulo no tiene páginas cargadas aún.
          </p>
        )}
      </div>

      {/* ── Div invisible para detectar el final del capítulo ── */}
      <div ref={bottomRef} className="w-full h-1 invisible" />

      {/* ── Barra de navegación inferior (con botón de subir) ── */}
      <BottomNavBar
        capitulo={capitulo}
        onPrev={handlePrev}
        onList={handleList}
        onNext={handleNext}
        onScrollTop={handleScrollTop}
      />
    </div>
    </>
  );
}

```

---

## Archivo: `src/pages/GroupDetails.tsx`

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { obtenerGrupoPorId } from '../services/groupService';
import { eliminarGrupo, eliminarMiembro } from '../services/masterService';
import CreateWorkModal from '../components/modales/CreateWorkModal';
import CreateMemberModal from '../components/modales/CreateMemberModal';
import EditGroupModal from '../components/modales/EditGroupModal';
import iconCthulhu from '../assets/icono cthulhu.png';
import Navbar from '../components/Navbar';

interface Obra {
  id: number;
  titulo: string;
  portada?: string;
  vistas: number;
  likes: number;
}

interface Miembro {
  id: number;
  nombre: string;
  rol: string;
  fotoPerfil?: string;
}

interface GrupoDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  portada?: string;
  obras: Obra[];
  miembros: Miembro[];
}

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [grupo, setGrupo] = useState<GrupoDetalle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'obras' | 'miembros'>('obras');
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isMaster = user?.rol === 'MASTER';
  // canManageContent: Master o (Admin y además pertenecer al grupo - en el frontend el Admin solo ve su grupo o asume si llegó aquí es de su grupo, pero igual validamos)
  const canManageContent = isMaster || (user?.rol === 'MIEMBRO_ADMIN' && user?.grupoId === Number(id));

  const fetchGroup = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await obtenerGrupoPorId(id);
      setGrupo(data);
    } catch (error) {
      console.error("Error al obtener el grupo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleDeleteGrupo = async () => {
    if (!id || !masterPassword.trim()) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await eliminarGrupo(id, masterPassword);
      navigate('/master');
    } catch (error: any) {
      console.error("Error al eliminar grupo:", error);
      setDeleteError(error.response?.data?.message || "Contraseña incorrecta o error de servidor");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMiembro = async (miembroId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este miembro del staff?")) return;
    try {
      await eliminarMiembro(miembroId);
      fetchGroup(); // Recargar el grupo
    } catch (error: any) {
      console.error("Error al eliminar miembro:", error);
      alert(error.response?.data?.message || "Ocurrió un error al eliminar el miembro");
    }
  };

  const canDeleteMiembro = (miembroRol: string) => {
    if (isMaster) return true;
    if (user?.rol === 'MIEMBRO_ADMIN' && miembroRol !== 'MIEMBRO_ADMIN') return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-abyss-bg-Master flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-abyss-text-title-Master"></div>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="min-h-screen bg-abyss-bg-Master flex items-center justify-center text-abyss-text-title-Master text-2xl font-bold">
        Grupo no encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-abyss-bg-Master flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-col md:flex-row p-4 md:p-8 overflow-hidden gap-8 w-full max-w-7xl mx-auto">
      
      {/* Columna Izquierda: Portada del Grupo */}
      <div className="w-full md:w-1/4 flex flex-col items-center shrink-0">
        <div className="relative border-4 border-abyss-border-card-gp rounded-2xl overflow-hidden shadow-2xl w-full aspect-3/4 mb-4">
          {grupo.portada ? (
            <img 
              src={grupo.portada} 
              alt={`Portada de ${grupo.nombre}`} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center">
              <span className="text-abyss-text-card-gp font-bold text-xl opacity-70">Sin Portada</span>
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha / Principal: Contenido */}
      <div className="w-full md:w-3/4 flex flex-col">
        {/* Cabecera del grupo */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-abyss-text-title-Master mb-2 uppercase tracking-wider drop-shadow-lg">
            {grupo.nombre}
          </h1>
          <p className="text-lg md:text-xl text-abyss-text-title-Master opacity-80 font-medium">
            "{grupo.descripcion}"
          </p>
        </div>

        {/* Acciones de gestión de grupo */}
        {canManageContent && (
          <div className="flex flex-wrap gap-4 mb-6">
            <button 
              onClick={() => setIsEditGroupModalOpen(true)} 
              className="bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-2 border-abyss-border-button-on-sec-master py-2 px-6 rounded-xl font-bold uppercase hover:brightness-110 transition-all shadow-md active:scale-95"
            >
              Editar Culto
            </button>
            {isMaster && (
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="bg-red-900/80 text-white border-2 border-red-500 py-2 px-6 rounded-xl font-bold uppercase hover:bg-red-800 transition-all shadow-md active:scale-95"
              >
                Eliminar Culto
              </button>
            )}
          </div>
        )}

        {/* Modal Inline para Confirmar Eliminación (Solo Master) */}
        {showDeleteConfirm && (
          <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center gap-4 animate-fade-in">
            <div className="flex-1 text-red-100 font-bold">
              ¿Estás seguro que deseas eliminar el grupo "{grupo.nombre}"? Ingresa tu contraseña maestra:
            </div>
            <input 
              type="password" 
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Contraseña MASTER" 
              className="bg-black/50 text-white border border-red-500/50 rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-500"
            />
            <button 
              onClick={handleDeleteGrupo}
              disabled={isDeleting || !masterPassword.trim()}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Confirmar'}
            </button>
            <button 
              onClick={() => { setShowDeleteConfirm(false); setMasterPassword(''); setDeleteError(null); }}
              disabled={isDeleting}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            {deleteError && <div className="text-red-500 font-bold ml-2">{deleteError}</div>}
          </div>
        )}

        {/* Acciones de Contenido (Obras y Miembros) */}
        {canManageContent && (
          <div className="flex gap-4 mb-8 border-t border-abyss-border-card-gp pt-6">
            <button onClick={() => setIsWorkModalOpen(true)} className="bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-2 px-6 rounded-xl font-bold uppercase hover:brightness-110 transition-all shadow-md active:scale-95">
              + Agregar Obra
            </button>
            <button onClick={() => setIsMemberModalOpen(true)} className="bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-2 px-6 rounded-xl font-bold uppercase hover:brightness-110 transition-all shadow-md active:scale-95">
              + Agregar Miembro
            </button>
          </div>
        )}

        {/* Pestañas de Navegación */}
        <div className="flex justify-start mb-8 border-b-2 border-abyss-border-button-on-sec-master/30 w-full max-w-xl">
          <button
            onClick={() => setActiveTab('obras')}
            className={`flex-1 py-3 font-bold text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'obras' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Obras
          </button>
          <button
            onClick={() => setActiveTab('miembros')}
            className={`flex-1 py-3 font-bold text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'miembros' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Miembros del Staff
          </button>
        </div>

        {/* Contenido de Pestañas */}
        <div className="w-full h-full flex-1 transition-opacity duration-500">
          {activeTab === 'obras' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {grupo.obras && grupo.obras.length > 0 ? (
                grupo.obras.map((obra) => (
                  <div
                    key={obra.id}
                    className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer aspect-3/4 hover:-translate-y-2 transition-transform duration-300"
                    onClick={() => navigate(`/obra/${encodeURIComponent(obra.titulo)}`)}
                  >
                    {/* Portada ocupando total de tarjeta sin bordes */}
                    {obra.portada ? (
                      <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${obra.portada})` }}></div>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <span className="text-abyss-text-card-gp font-medium opacity-70">Sin Portada</span>
                      </div>
                    )}
                    {/* Gradiente para mejorar legibilidad */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                    {/* Información de la Obra */}
                    <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end z-10">
                      <h3 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-md truncate">
                        {obra.titulo}
                      </h3>
                      {/* Contadores planos */}
                      <div className="flex gap-3 text-white/80 text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          {obra.vistas}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                          {obra.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-abyss-text-title-Master text-lg font-medium opacity-80 py-8">
                  No hay obras en este culto aún.
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2">
                  Staff del Culto
                </h3>
                {grupo.miembros && grupo.miembros.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grupo.miembros.map((miembro) => (
                      <div key={miembro.id} className="flex items-center gap-4 p-4 bg-abyss-bg-item-select border border-abyss-border-item-select rounded-xl shadow-md hover:brightness-110 transition-all">
                        <img 
                          src={miembro.fotoPerfil || iconCthulhu} 
                          alt={miembro.nombre} 
                          className="w-12 h-12 rounded-full border-2 border-abyss-border-select-sec-master object-cover bg-abyss-bg-Master"
                        />
                        <div className="flex flex-col flex-1">
                          <span className="text-abyss-text-item-select font-bold text-lg leading-tight">
                            {miembro.nombre}
                          </span>
                          <span className="text-abyss-text-button-off-sec-master text-xs font-extrabold uppercase tracking-wider mt-1 opacity-80">
                            {miembro.rol}
                          </span>
                        </div>
                        {/* Botón Eliminar (X) */}
                        {canManageContent && canDeleteMiembro(miembro.rol) && (
                          <button
                            onClick={() => handleDeleteMiembro(miembro.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-900/30 p-2 rounded-full transition-all"
                            title="Eliminar miembro"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-abyss-text-select-sec-master text-lg font-medium opacity-80 py-4">
                    Sin miembros en el staff.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modales */}
      <CreateWorkModal 
        isOpen={isWorkModalOpen} 
        groupId={id || ''} 
        onClose={() => setIsWorkModalOpen(false)} 
        onSuccess={fetchGroup} 
      />
      <CreateMemberModal 
        isOpen={isMemberModalOpen} 
        groupId={id || ''} 
        onClose={() => setIsMemberModalOpen(false)} 
        onSuccess={fetchGroup} 
      />
      {grupo && (
        <EditGroupModal
          isOpen={isEditGroupModalOpen}
          groupId={id || ''}
          initialName={grupo.nombre}
          initialDescription={grupo.descripcion}
          initialPortada={grupo.portada}
          onClose={() => setIsEditGroupModalOpen(false)}
          onSuccess={fetchGroup}
        />
      )}
      </div>
    </div>
  );
};

export default GroupDetails;

```

---

## Archivo: `src/pages/Groups.tsx`

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { obtenerGrupos } from '../services/masterService';

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  portada?: string;
}

export default function Groups() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    obtenerGrupos()
      .then(data => setGrupos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--color-abyss-bg-principal)' }}>
      <Navbar />

      <main className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 space-y-12">
        <h1 
          className="text-4xl font-black text-center tracking-wider"
          style={{ color: 'var(--color-abyss-text-titles-principal)' }}
        >
          Grupos de Traducción
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-abyss-text-title-Master"></div>
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center text-xl font-medium opacity-80" style={{ color: 'var(--color-abyss-text-titles-principal)' }}>
            No hay grupos disponibles por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {grupos.map(grupo => (
              <div 
                key={grupo.id} 
                onClick={() => navigate(`/grupos/${grupo.id}`)}
                className="relative border-2 border-abyss-border-card-gp rounded-2xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300 h-[300px] group cursor-pointer"
              >
                {grupo.portada ? (
                  <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ backgroundImage: `url(${grupo.portada})` }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                    <span className="text-abyss-text-card-gp font-medium opacity-70">Sin Portada</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#012533]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                <div className="absolute bottom-0 left-0 w-full h-[85px] py-3 px-5 bg-abyss-bg-text-card-gp/65 backdrop-blur-sm flex flex-col justify-center z-10 border-t border-abyss-border-card-gp/30">
                  <h3 className="text-lg font-bold mb-1 text-abyss-text-card-gp truncate drop-shadow-md">
                    {grupo.nombre}
                  </h3>
                  <p className="text-abyss-text-card-gp text-sm font-medium line-clamp-2 truncate drop-shadow-md">
                    {grupo.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

```

---

## Archivo: `src/pages/Home.tsx`

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import api from '../services/api';

interface Caracteristica {
  id: number;
  nombre: string;
}

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  portada?: string;
  likes: number;
  vistas: number;
  tipo?: Caracteristica;
  demografia?: Caracteristica;
  generos?: Caracteristica[];
  ultimosCapitulos?: {numero: number, createdAt: string}[];
}

export default function Home() {
  const navigate = useNavigate();

  // Estados de datos
  const [topLikes, setTopLikes] = useState<Obra[]>([]);
  const [generos, setGeneros] = useState<Caracteristica[]>([]);
  const [selectedGeneroId, setSelectedGeneroId] = useState<number | null>(null);
  const [obrasGenero, setObrasGenero] = useState<Obra[]>([]);
  const [obrasRecientes, setObrasRecientes] = useState<Obra[]>([]);
  
  // Paginación recientes
  const [recientesPage, setRecientesPage] = useState(0);
  const [hasMoreRecientes, setHasMoreRecientes] = useState(true);

  // 1. Cargar top likes
  useEffect(() => {
    api.get('/catalogo?sort=likes,desc&size=10')
      .then(res => setTopLikes(res.data.content || res.data))
      .catch(console.error);
  }, []);

  // 2. Cargar lista de géneros
  useEffect(() => {
    api.get('/generos')
      .then(res => {
        const gen = res.data || [];
        setGeneros(gen);
        if (gen.length > 0) {
          setSelectedGeneroId(gen[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // 3. Cargar top por género cuando cambia el género seleccionado
  useEffect(() => {
    if (selectedGeneroId === null) return;
    api.get(`/catalogo?generoId=${selectedGeneroId}&sort=vistas,desc&size=10`)
      .then(res => setObrasGenero(res.data.content || res.data))
      .catch(console.error);
  }, [selectedGeneroId]);

  // 4. Cargar recientes (con paginación)
  const fetchRecientes = (page: number) => {
    api.get(`/obras/recientes?page=${page}&size=20`)
      .then(async res => {
        const newObras = res.data.content || [];
        
        const obrasConCapitulos = await Promise.all(newObras.map(async (obra: Obra) => {
          try {
            const capRes = await api.get(`/obras/${obra.id}/capitulos`);
            const capitulos = capRes.data || [];
            const ultimos2 = capitulos.sort((a: {numero: number}, b: {numero: number}) => b.numero - a.numero).slice(0, 2);
            return { ...obra, ultimosCapitulos: ultimos2 };
          } catch {
            return { ...obra, ultimosCapitulos: [] };
          }
        }));

        if (page === 0) {
          setObrasRecientes(obrasConCapitulos);
        } else {
          setObrasRecientes(prev => [...prev, ...obrasConCapitulos]);
        }
        setHasMoreRecientes(!res.data.last);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRecientes(0);
  }, []);

  const handleVerMasRecientes = () => {
    const nextPage = recientesPage + 1;
    setRecientesPage(nextPage);
    fetchRecientes(nextPage);
  };

  const handleScrollGeneros = (direction: 'left' | 'right') => {
    const container = document.getElementById('generos-scroll-container');
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  // Renderizador de card reutilizable
  const renderObraCard = (obra: Obra) => (
    <div 
      key={obra.id} 
      onClick={() => navigate(`/obra/${obra.titulo}`)}
      className="bg-abyss-bg-card-gp rounded-xl overflow-hidden border border-abyss-border-card-gp hover:shadow-[0_0_20px_rgba(0,168,157,0.4)] transition-all duration-300 group cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-abyss-bg-selecs">
        {obra.portada ? (
          <img 
            src={obra.portada} 
            alt={obra.titulo} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-abyss-text-muted bg-abyss-bg-selecs/50">
            <span className="text-sm font-medium">Sin portada</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#012533]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {obra.tipo && (
            <span className="bg-abyss-bg-text-card-gp/90 text-abyss-text-card-gp text-xs font-black px-2.5 py-1 rounded shadow backdrop-blur-sm tracking-wide">
              {obra.tipo.nombre}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between bg-abyss-bg-card-gp relative z-10">
        <div>
          <h3 className="font-bold text-abyss-text-barra-busqueda line-clamp-2 text-sm md:text-base leading-snug mb-1 group-hover:text-white transition-colors">
            {obra.titulo}
          </h3>
          {obra.demografia && (
            <span className="text-xs text-abyss-text-name-option/90 font-medium">
              {obra.demografia.nombre}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecienteCard = (obra: Obra) => (
    <div 
      key={`reciente-${obra.id}`} 
      onClick={() => navigate(`/obra/${obra.titulo}`)}
      className="bg-abyss-bg-card-gp rounded-xl overflow-hidden border border-abyss-border-card-gp hover:shadow-[0_0_20px_rgba(0,168,157,0.4)] transition-all duration-300 group cursor-pointer flex h-[160px] transform hover:-translate-y-1"
    >
      <div className="w-1/3 relative overflow-hidden bg-abyss-bg-selecs h-full flex-shrink-0">
        {obra.portada ? (
          <img 
            src={obra.portada} 
            alt={obra.titulo} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-abyss-text-muted bg-abyss-bg-selecs/50">
            <span className="text-xs">Sin portada</span>
          </div>
        )}
      </div>
      <div className="w-2/3 p-4 flex flex-col bg-abyss-bg-card-gp relative z-10">
        <h3 className="font-bold text-abyss-text-barra-busqueda line-clamp-2 text-sm md:text-base leading-snug mb-2 group-hover:text-white transition-colors">
          {obra.titulo}
        </h3>
        <div className="flex-grow flex flex-col justify-end space-y-2">
          {obra.ultimosCapitulos && obra.ultimosCapitulos.length > 0 ? (
            obra.ultimosCapitulos.map((cap, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-abyss-text-name-option/90 font-medium bg-abyss-bg-item-select/50 px-2 py-0.5 rounded border border-abyss-border-item-select/50">
                  Cap. {cap.numero}
                </span>
                <span className="text-abyss-text-muted font-medium ml-1 truncate">
                  {new Date(cap.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-abyss-text-muted">Sin capítulos</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-abyss-bg-principal)' }}>
      <Navbar />

      <main className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 space-y-20">
        
        {/* SECCIÓN 1: Los más gustados */}
        <section>
          <h1 
            className="text-4xl font-black mb-8 text-center tracking-wider"
            style={{ color: 'var(--color-abyss-text-titles-principal)' }}
          >
            Los mas gustados
          </h1>
          <Carousel obras={topLikes} />
        </section>

        {/* SECCIÓN 2: Los más vistos de su género */}
        <section>
          <h1 
            className="text-4xl font-black mb-8 text-center tracking-wider"
            style={{ color: 'var(--color-abyss-text-titles-principal)' }}
          >
            Los mas vistos de su genero
          </h1>
          
          {/* Scroll horizontal de géneros */}
          <div className="relative mb-8 flex items-center justify-center max-w-5xl mx-auto">
            <button 
              onClick={() => handleScrollGeneros('left')}
              className="absolute left-0 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full hidden md:flex items-center justify-center h-10 w-10 -ml-5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div 
              id="generos-scroll-container"
              className="flex space-x-3 overflow-x-auto py-4 px-8 scrollbar-hide scroll-smooth w-full mx-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {generos.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setSelectedGeneroId(gen.id)}
                  className="whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95"
                  style={{
                    backgroundColor: selectedGeneroId === gen.id ? 'var(--color-abyss-text-filter-genero)' : 'var(--color-abyss-bg-filter-genero)',
                    color: selectedGeneroId === gen.id ? 'var(--color-abyss-bg-filter-genero)' : 'var(--color-abyss-text-filter-genero)',
                    border: `2px solid var(--color-abyss-text-filter-genero)`
                  }}
                >
                  {gen.nombre}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleScrollGeneros('right')}
              className="absolute right-0 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full hidden md:flex items-center justify-center h-10 w-10 -mr-5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Grid de resultados de género */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8">
            {obrasGenero.map(renderObraCard)}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate(`/biblioteca?generoId=${selectedGeneroId}&sort=vistas,desc`)}
              className="px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--color-abyss-bg-filter-genero)',
                color: 'var(--color-abyss-text-filter-genero)'
              }}
            >
              Ver todos
            </button>
          </div>
        </section>

        {/* SECCIÓN 3: Últimos actualizados */}
        <section>
          <h1 
            className="text-4xl font-black mb-10 text-center tracking-wider"
            style={{ color: 'var(--color-abyss-text-titles-principal)' }}
          >
            Ultimos actualizados
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {obrasRecientes.map(renderRecienteCard)}
          </div>

          {hasMoreRecientes && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleVerMasRecientes}
                className="px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 bg-white text-black"
                style={{
                  backgroundColor: 'var(--color-abyss-text-titles-principal)',
                  color: 'var(--color-abyss-bg-principal)'
                }}
              >
                Ver más
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

```

---

## Archivo: `src/pages/Login.tsx`

```tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import bgLog from '../assets/bg-log.png';

interface LoginCredentials {
  email: string;
  password: string;
}

const Login = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiamos el error visual al intentar corregir los campos
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { 
        mail: credentials.email, 
        contrasena: credentials.password 
      });

      // Extraemos el token y la información del usuario de la respuesta
      const { token, ...userData } = response.data;
      
      // Guardamos la sesión en Zustand y LocalStorage
      login(token, userData);
      
      // Redirigimos según el rol
      if (userData.rol === 'LECTOR') {
        navigate('/');
      } else if (userData.rol === 'MASTER') {
        navigate('/master');
      } else if (userData.rol === 'MIEMBRO_ADMIN' || userData.rol === 'MIEMBRO') {
        if (userData.grupoId) {
          navigate(`/grupos/${userData.grupoId}`);
        } else {
          navigate('/master');
        }
      } else {
        navigate('/'); // Fallback
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("El abismo rechaza tus credenciales. Verifica tus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-abyss-bg-png overflow-hidden p-4">
      {/* Imagen de fondo semitransparente superpuesta al color */}
      <img 
        src={bgLog} 
        alt="Fondo del Abismo" 
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none" 
      />
      
      {/* Contenedor del formulario */}
      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 bg-abyss-bg-log border border-abyss-text-log rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 shadow-2xl"
      >
        <div className="flex flex-col gap-2 text-center mb-2">
          <h1 className="text-2xl font-bold text-abyss-text-log">
            El abismo observa tu regreso
          </h1>
          <p className="text-abyss-text-muted font-medium">
            Inicia sesión
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Usuario / Email"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
        </div>

        {error && (
          <div className="text-red-700 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full bg-abyss-text-log text-abyss-text-input font-bold rounded-xl p-3 transition-opacity mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
        >
          {isLoading ? 'Iniciando sesión...' : 'Inicia sesión'}
        </button>

        <div className="text-center mt-2">
          <Link 
            to="/register" 
            className="text-abyss-text-log font-semibold hover:text-abyss-text-muted transition-colors underline-offset-4 hover:underline"
          >
            ¿El abismo te rechaza? Regístrate
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;

```

---

## Archivo: `src/pages/MasterDashboard.tsx`

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerGrupos, obtenerCaracteristicas } from '../services/masterService';
import bgIcon from '../assets/bg icon.png';
import Navbar from '../components/Navbar';
import CreateGroupModal from '../components/modales/CreateGroupModal';
import CreateCharacteristicModal from '../components/modales/CreateCharacteristicModal';
import ManageCharacteristicsModal from '../components/modales/ManageCharacteristicsModal';
import type { CharacteristicType } from '../components/modales/CreateCharacteristicModal';

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  portada?: string;
}

interface Caracteristica {
  id?: number;
  nombre: string;
}

interface CaracteristicasState {
  generos: Caracteristica[];
  demografias: Caracteristica[];
  tipos: Caracteristica[];
}

const MasterDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'grupos' | 'caracteristicas'>('grupos');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<CaracteristicasState>({ generos: [], demografias: [], tipos: [] });
  const [loading, setLoading] = useState(true);

  // Estados de Modales
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isManageCharModalOpen, setIsManageCharModalOpen] = useState(false);
  const [currentCharType, setCurrentCharType] = useState<CharacteristicType>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [gruposData, caracteristicasData] = await Promise.all([
        obtenerGrupos(),
        obtenerCaracteristicas()
      ]);
      setGrupos(gruposData);
      setCaracteristicas(caracteristicasData);
    } catch (error) {
      console.error("Error al cargar datos del dashboard administrativo", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-abyss-bg-Master">
      <Navbar />

      {/* Fondo PNG al 85% de solidez */}
      <img 
        src={bgIcon} 
        alt="Fondo Icono" 
        className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none z-0" 
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center p-8 mt-4">
        {/* titulo */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-center uppercase tracking-widest text-abyss-text-title-Master drop-shadow-lg">
          Observa tus dominios
        </h1>

        {/* Barra de Navegación Interna (Tabs) */}
        <div className="flex justify-center mb-10 border-b-2 border-abyss-border-button-on-sec-master/30 w-full max-w-2xl">
          <button
            onClick={() => setActiveTab('grupos')}
            className={`flex-1 py-4 font-bold text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'grupos' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Grupos
          </button>
          <button
            onClick={() => setActiveTab('caracteristicas')}
            className={`flex-1 py-4 font-bold text-lg transition-all duration-300 border-t-2 border-l-2 border-r-2 rounded-t-xl ${
              activeTab === 'caracteristicas' 
                ? 'bg-abyss-bg-button-on-sec-master text-abyss-text-button-on-sec-master border-abyss-border-button-on-sec-master shadow-[0_-4px_15px_rgba(2,151,151,0.4)] z-10 scale-105' 
                : 'bg-abyss-bg-button-off-sec-master text-abyss-text-button-off-sec-master border-transparent hover:opacity-80'
            }`}
          >
            Características
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-abyss-text-title-Master"></div>
          </div>
        ) : (
          <div className="w-full transition-opacity duration-500">
            {activeTab === 'grupos' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Botón Crear Grupo */}
                <div onClick={() => setIsGroupModalOpen(true)} className="bg-abyss-bg-card-crear-gp border-2 border-abyss-border-card-crear-gp rounded-2xl flex flex-col items-center justify-center p-8 min-h-[300px] cursor-pointer hover:opacity-80 transition-opacity shadow-lg group">
                  <div className="w-16 h-16 rounded-full bg-abyss-border-card-crear-gp flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl text-abyss-text-card-crear-gp font-bold">+</span>
                  </div>
                  <h3 className="text-xl font-bold text-abyss-text-card-crear-gp text-center">Crear Nuevo Grupo</h3>
                </div>

                {/* Listado de Grupos */}
                {grupos.length > 0 && grupos.map((grupo, index) => (
                  <div key={index} onClick={() => navigate(`/grupos/${grupo.id}`)} className="relative border-2 border-abyss-border-card-gp rounded-2xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300 h-[300px] group cursor-pointer">
                    {grupo.portada ? (
                      <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${grupo.portada})` }}></div>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-abyss-bg-card-gp flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <span className="text-abyss-text-card-gp font-medium opacity-70">Sin Portada</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full h-[85px] py-3 px-5 bg-abyss-bg-text-card-gp/65 backdrop-blur-sm flex flex-col justify-center z-10 border-t border-abyss-border-card-gp/30">
                      <h3 className="text-lg font-bold mb-1 text-abyss-text-card-gp truncate drop-shadow-md">{grupo.nombre}</h3>
                      <p className="text-abyss-text-card-gp text-sm font-medium line-clamp-2 truncate drop-shadow-md">{grupo.descripcion}</p>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                
                {/* Generos */}
                <div className="bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2">
                    Géneros
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-6 flex-1">
                    {caracteristicas.generos.length > 0 ? caracteristicas.generos.map((g: Caracteristica, i: number) => (
                      <span key={i} className="px-4 py-2 bg-abyss-bg-item-select text-abyss-text-item-select border border-abyss-border-item-select rounded-lg font-bold shadow-md opacity-90 hover:opacity-100 transition-opacity cursor-default">
                        {g.nombre}
                      </span>
                    )) : <p className="text-abyss-text-select-sec-master opacity-70 italic text-sm">Vacio.</p>}
                  </div>
                  <button onClick={() => { setCurrentCharType('genero'); setIsCharModalOpen(true); }} className="w-full bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-3 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 mb-3">
                    + Crear Género
                  </button>
                  <button onClick={() => { setCurrentCharType('genero'); setIsManageCharModalOpen(true); }} className="w-full bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc py-2 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 text-sm opacity-90 hover:opacity-100">
                    Gestionar Géneros
                  </button>
                </div>

                {/* Demografías */}
                <div className="bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2">
                    Demografías
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-6 flex-1">
                    {caracteristicas.demografias.length > 0 ? caracteristicas.demografias.map((d: Caracteristica, i: number) => (
                      <span key={i} className="px-4 py-2 bg-abyss-bg-item-select text-abyss-text-item-select border border-abyss-border-item-select rounded-lg font-bold shadow-md opacity-100 hover:brightness-110 transition-all cursor-default">
                        {d.nombre}
                      </span>
                    )) : <p className="text-abyss-text-select-sec-master opacity-70 italic text-sm">Vacio.</p>}
                  </div>
                  <button onClick={() => { setCurrentCharType('demografia'); setIsCharModalOpen(true); }} className="w-full bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-3 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 mb-3">
                    + Crear Demografía
                  </button>
                  <button onClick={() => { setCurrentCharType('demografia'); setIsManageCharModalOpen(true); }} className="w-full bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc py-2 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 text-sm opacity-90 hover:opacity-100">
                    Gestionar Demografías
                  </button>
                </div>

                {/* Tipos */}
                <div className="bg-abyss-bg-select-sec-master border border-abyss-border-select-sec-master rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-6 text-abyss-text-select-sec-master uppercase tracking-wide border-b-2 border-abyss-border-select-sec-master pb-2">
                    Tipos
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-6 flex-1">
                    {caracteristicas.tipos.length > 0 ? caracteristicas.tipos.map((t: Caracteristica, i: number) => (
                      <span key={i} className="px-4 py-2 bg-abyss-bg-item-select text-abyss-text-item-select border border-abyss-border-item-select rounded-lg font-bold shadow-md opacity-80 hover:opacity-100 transition-opacity cursor-default">
                        {t.nombre}
                      </span>
                    )) : <p className="text-abyss-text-select-sec-master opacity-70 italic text-sm">Vacio.</p>}
                  </div>
                  <button onClick={() => { setCurrentCharType('tipo'); setIsCharModalOpen(true); }} className="w-full bg-abyss-bg-button-create-caract text-abyss-text-button-create-caract border-2 border-abyss-border-button-create-caract py-3 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 mb-3">
                    + Crear Tipo
                  </button>
                  <button onClick={() => { setCurrentCharType('tipo'); setIsManageCharModalOpen(true); }} className="w-full bg-abyss-coment-cc text-abyss-text-button-cc border-2 border-abyss-border-button-cc py-2 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 text-sm opacity-90 hover:opacity-100">
                    Gestionar Tipos
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales Transaccionales */}
      <CreateGroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <CreateCharacteristicModal 
        isOpen={isCharModalOpen} 
        type={currentCharType} 
        onClose={() => setIsCharModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <ManageCharacteristicsModal
        isOpen={isManageCharModalOpen}
        type={currentCharType}
        onClose={() => setIsManageCharModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default MasterDashboard;

```

---

## Archivo: `src/pages/Register.tsx`

```tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import bgLog from '../assets/bg-log.png';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiamos el error visual al intentar corregir los campos
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor, verifica e inténtalo de nuevo.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        nombre: formData.nombre,
        mail: formData.email,
        contrasena: formData.password
      });

      // Si el registro es exitoso, lo enviamos al login para que inicie sesión
      navigate('/login');
    } catch (err) {
      console.error("Error en registro:", err);
      // Intentamos obtener el mensaje de error del backend de forma segura usando un Type Guard
      if (axios.isAxiosError(err)) {
        const backendMessage = err.response?.data?.message || err.response?.data;
        if (typeof backendMessage === 'string') {
          setError(backendMessage);
          return;
        }
      }
      setError("Error al registrarse. Puede que el email ya pertenezca a otro cultista.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-abyss-bg-png overflow-hidden p-4">
      {/* Imagen de fondo semitransparente superpuesta al color */}
      <img 
        src={bgLog} 
        alt="Fondo del Abismo" 
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none" 
      />
      
      {/* Contenedor del formulario */}
      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 bg-abyss-bg-log border border-abyss-text-log rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 shadow-2xl"
      >
        <div className="flex flex-col gap-2 text-center mb-2">
          <h1 className="text-2xl font-bold text-abyss-text-log">
            Un nuevo culto emerge del abismo
          </h1>
          <p className="text-abyss-text-muted font-medium">
            Regístrate
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar Contraseña"
            className="w-full bg-abyss-bg-input border border-abyss-border-input text-abyss-text-input placeholder:text-abyss-text-muted rounded-xl p-3 outline-none focus:border-abyss-text-muted focus:ring-1 focus:ring-abyss-text-muted transition-all"
          />
        </div>

        {error && (
          <div className="text-red-700 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full bg-abyss-text-log text-abyss-text-input font-bold rounded-xl p-3 transition-opacity mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
        >
          {isLoading ? 'Registrando...' : 'Regístrate'}
        </button>

        <div className="text-center mt-2">
          <Link 
            to="/login" 
            className="text-abyss-text-log font-semibold hover:text-abyss-text-muted transition-colors underline-offset-4 hover:underline"
          >
            ¿Ya perteneces al abismo? Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;

```

---

## Archivo: `src/pages/UserProfile.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import cthulhuIcon from '../assets/icono cthulhu.png';
import bgLog from '../assets/bg-log.png';
import EditProfileModal from '../components/modales/EditProfileModal';
import Navbar from '../components/Navbar';


// ── Tipos ─────────────────────────────────────────────────────
type EstadoGuardado = 'SIGUIENDO' | 'LEYENDO' | 'LEIDO';
type TabActiva = 'historial' | 'guardados';

interface HistorialItem {
  id: number;
  obraId: number;
  obraTitulo: string;
  obraPortada: string | null;
  capituloId: number;
  capituloNumero: number;
  updatedAt: string;
}

interface GuardadoItem {
  id: number;
  estado: EstadoGuardado;
  obraId: number;
  obraTitulo: string;
  obraPortada: string | null;
}

// ── Helpers ───────────────────────────────────────────────────
function obraSlug(titulo: string): string {
  return titulo.replace(/ /g, '-');
}

function formatFecha(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Componente principal ───────────────────────────────────────
export default function UserProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [tabActiva, setTabActiva] = useState<TabActiva>('historial');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [descripcionPerfil, setDescripcionPerfil] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  // Cargar descripción real del usuario
  useEffect(() => {
    api.get<{ descripcion: string | null }>('/usuarios/me')
      .then(res => setDescripcionPerfil(res.data.descripcion))
      .catch(() => {});
  }, []);

  // Historial
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Guardados
  const [guardados, setGuardados] = useState<GuardadoItem[]>([]);
  const [loadingGuardados, setLoadingGuardados] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoGuardado>('SIGUIENDO');
  // Cargar historial al montar
  useEffect(() => {
    setLoadingHistorial(true);
    api.get<HistorialItem[]>('/historial')
      .then(res => setHistorial(res.data))
      .catch(err => console.error('Error cargando historial', err))
      .finally(() => setLoadingHistorial(false));
  }, []);

  // Cargar guardados una sola vez al montar
  useEffect(() => {
    setLoadingGuardados(true);
    api.get<GuardadoItem[]>('/guardados')
      .then(res => setGuardados(res.data))
      .catch(err => console.error('Error cargando guardados', err))
      .finally(() => setLoadingGuardados(false));
  }, []);

  // Filtro local de guardados (sin refetch)
  const guardadosFiltrados = guardados.filter(g => g.estado === filtroEstado);

  const estadoLabels: Record<EstadoGuardado, string> = {
    SIGUIENDO: 'Siguiendo',
    LEYENDO: 'Leyendo',
    LEIDO: 'Leído',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-abyss-bg-perfil)' }}>
      <Navbar />

      {/* ── Banner decorativo ── */}
      <div className="relative w-full h-[30vh] overflow-hidden shrink-0" style={{ background: 'var(--color-abyss-bg-png-perfil)' }}>
        <img
          src={bgLog}
          alt="Fondo de perfil"
          className="w-full h-full object-cover opacity-60 select-none"
          draggable={false}
        />
      </div>

      {/* ── Sección de perfil: avatar izq + nombre centro ── */}
      <div className="relative w-full max-w-5xl mx-auto px-2">
        <div className="flex items-start gap-4 -mt-12">

          {/* ── Columna izquierda: Avatar + descripción + botón ── */}
          <div className="flex flex-col items-center gap-3 shrink-0 z-10">
            {/* Avatar 2x (w-48 h-48 vs w-24 h-24 anterior) */}
            <div
              className="w-48 h-48 rounded-full overflow-hidden border-4 shadow-2xl"
              style={{ borderColor: 'var(--color-abyss-bg-png-perfil)' }}
            >
              <img
                src={user?.fotoPerfil ?? cthulhuIcon}
                alt={user?.nombre ?? 'Avatar'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Descripción */}
            <p className="text-xs text-center max-w-[180px] leading-relaxed" style={{ color: 'var(--color-abyss-text-capitulos)', opacity: descripcionPerfil ? 0.7 : 0.4 }}>
              {descripcionPerfil ?? 'Un lector más del abismo.'}
            </p>

            {/* Botón editar perfil */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_18px_rgba(0,235,219,0.3)]"
              style={{
                background: 'linear-gradient(135deg, #00EBDB22, #0099cc22)',
                border: '1px solid rgba(0,235,219,0.35)',
                color: '#00EBDB',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar perfil
            </button>

            {/* Botón cerrar sesión */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_18px_rgba(235,0,0,0.3)] mt-2"
              style={{
                background: 'linear-gradient(135deg, rgba(235,0,0,0.1), rgba(204,0,0,0.1))',
                border: '1px solid rgba(235,0,0,0.35)',
                color: '#ff4444',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>

          {/* ── Centro: Nombre de usuario ── */}
          <div className="flex-1 flex justify-center pt-16">
            <h1
              className="text-[1.7rem] font-bold text-center leading-tight"
              style={{ color: 'var(--color-abyss-text-capitulos)' }}
            >
              {user?.nombre ?? 'Lector'}
            </h1>
          </div>

          {/* ── Espacio derecho (balanceo visual) ── */}
          <div className="w-48 shrink-0" />
        </div>
      </div>

      {/* ── Tabs de navegación ── */}
      <div className="flex justify-center gap-2 px-4 mt-2 mb-4">
        {(['historial', 'guardados'] as TabActiva[]).map(tab => {
          const activo = tabActiva === tab;
          return (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className="px-8 py-2.5 rounded-t-lg font-semibold capitalize transition-all duration-200"
              style={
                activo
                  ? {
                      color: 'var(--color-abyss-text-button-on-seccion-perfil)',
                      background: `linear-gradient(to bottom, var(--color-abyss-bg-gradiente-1-button-on-seccion-perfil), var(--color-abyss-bg-gradiente-2-button-on-seccion-perfil))`,
                    }
                  : {
                      color: 'var(--color-abyss-text-button-off-seccion-perfil)',
                      background: 'transparent',
                      borderBottom: `2px solid var(--color-abyss-linea-button-off-seccion-perfil)`,
                    }
              }
            >
              {tab === 'historial' ? 'Mi historial' : 'Mis guardados'}
            </button>
          );
        })}
      </div>

      {/* ── Contenido dinámico ── */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-12">

        {/* ── SECCIÓN: HISTORIAL ── */}
        {tabActiva === 'historial' && (
          <section>
            {loadingHistorial ? (
              <p className="text-center py-12 animate-pulse" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                Cargando historial...
              </p>
            ) : historial.length === 0 ? (
              <p className="text-center py-12 opacity-60" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                Aún no has leído ningún capítulo.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {historial.map(item => (
                  <Link
                    key={item.id}
                    to={`/obra/${obraSlug(item.obraTitulo)}`}
                    className="rounded-xl overflow-hidden border border-transparent hover:scale-[1.02] transition-transform duration-200 shadow-md"
                    style={{ background: 'var(--color-abyss-bg-card-historial)' }}
                  >
                    {/* Portada */}
                    {item.obraPortada ? (
                      <img
                        src={item.obraPortada}
                        alt={item.obraTitulo}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center opacity-40" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        Sin portada
                      </div>
                    )}
                    {/* Info */}
                    <div className="p-3 flex flex-col gap-1">
                      <p className="font-bold text-sm leading-tight line-clamp-2" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        {item.obraTitulo}
                      </p>
                      <p className="text-xs opacity-80" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        Cap. {item.capituloNumero % 1 === 0 ? Math.floor(item.capituloNumero) : item.capituloNumero}
                      </p>
                      <p className="text-xs opacity-60 mt-auto" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        {formatFecha(item.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── SECCIÓN: GUARDADOS ── */}
        {tabActiva === 'guardados' && (
          <section>
            {/* Sub-botones de filtro por estado */}
            <div className="flex gap-3 mb-6 justify-center flex-wrap">
              {(Object.keys(estadoLabels) as EstadoGuardado[]).map(estado => {
                const activo = filtroEstado === estado;
                return (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                    style={
                      activo
                        ? {
                            color: 'var(--color-abyss-text-button-estados-on)',
                            background: `radial-gradient(circle, var(--color-abyss-bg-gradiente-1-button-estados-on), var(--color-abyss-bg-gradiente-2-button-estados-on))`,
                            border: 'none',
                          }
                        : {
                            color: 'var(--color-abyss-text-button-estados-off)',
                            background: 'var(--color-abyss-bg-button-estados-off)',
                            border: `1px solid var(--color-abyss-border-button-estados-off)`,
                          }
                    }
                  >
                    {estadoLabels[estado]}
                  </button>
                );
              })}
            </div>

            {/* Grid de tarjetas filtradas */}
            {loadingGuardados ? (
              <p className="text-center py-12 animate-pulse" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                Cargando biblioteca...
              </p>
            ) : guardadosFiltrados.length === 0 ? (
              <p className="text-center py-12 opacity-60" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                No tenés obras en "{estadoLabels[filtroEstado]}".
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {guardadosFiltrados.map(item => (
                  <Link
                    key={item.id}
                    to={`/obra/${obraSlug(item.obraTitulo)}`}
                    className="rounded-xl overflow-hidden hover:scale-[1.03] transition-transform duration-200 shadow-md"
                    style={{ background: 'var(--color-abyss-bg-card-historial)' }}
                  >
                    {/* Portada */}
                    {item.obraPortada ? (
                      <img
                        src={item.obraPortada}
                        alt={item.obraTitulo}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center opacity-40" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        Sin portada
                      </div>
                    )}
                    {/* Título */}
                    <div className="p-2">
                      <p className="font-bold text-xs line-clamp-2 leading-tight" style={{ color: 'var(--color-abyss-text-card-historial)' }}>
                        {item.obraTitulo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Modal de edición de perfil ── */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        descripcionActual={descripcionPerfil}
        onSuccess={(nuevaDesc, nuevoNombre) => {
          setDescripcionPerfil(nuevaDesc);
          void nuevoNombre; // el store ya se actualizó en el modal
        }}
      />
      {/* ── Modal de Cerrar Sesión ── */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09151A] border border-[#00EBDB]/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(0,235,219,0.15)] flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-[#00EBDB] mb-3">
              ¿Deseas cerrar sesión?
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Tendrás que volver a iniciar sesión para acceder a tu historial y guardados.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg font-bold text-[#00EBDB] border border-[#00EBDB]/50 hover:bg-[#00EBDB]/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg font-bold text-[#09151A] bg-[#00EBDB] hover:brightness-110 shadow-[0_0_15px_rgba(0,235,219,0.4)] transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## Archivo: `src/pages/Work.tsx`

```tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import CreateChapterModal from '../components/modales/CreateChapterModal';
import EditChapterModal from '../components/modales/EditChapterModal';
import EditWorkModal from '../components/modales/EditWorkModal';
import DeleteChapterModal from '../components/modales/DeleteChapterModal';
import Navbar from '../components/Navbar';

type EstadoGuardado = 'SIGUIENDO' | 'LEYENDO' | 'LEIDO';

interface GuardadoResponseDTO {
  id: number;
  estado: EstadoGuardado;
  obraId: number;
  obraTitulo: string;
  obraPortada: string | null;
}

interface Capitulo {
  id: number;
  numero: number;
  createdAt: string | null;
  leido?: boolean;
}

interface ObraDetalle {
  id: number;
  titulo: string;
  descripcion: string | null;
  portada: string | null;
  vistas: number;
  likes: number;
  estado: string;
  tipoNombre: string | null;
  demografiaNombre: string | null;
  grupoNombre: string | null;
  grupoId: number | null;
  staffNombres: string[];
  generosNombres: string[];
  capitulos?: Capitulo[];
}

export default function Work() {
  const { obraNombre } = useParams<{ obraNombre: string }>();
  const [obra, setObra] = useState<ObraDetalle | null>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalEditarObraAbierto, setModalEditarObraAbierto] = useState(false);
  const [modalEliminarCapituloAbierto, setModalEliminarCapituloAbierto] = useState(false);
  // Estados para eliminar obra
  const [showDeleteObraConfirm, setShowDeleteObraConfirm] = useState(false);
  const [deleteObraStep, setDeleteObraStep] = useState<'confirm' | 'password'>('confirm');
  const [deleteObraPassword, setDeleteObraPassword] = useState('');
  const [isDeletingObra, setIsDeletingObra] = useState(false);
  const [deleteObraError, setDeleteObraError] = useState<string | null>(null);
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado | ''>('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  // Estado optimista de likes
  const [localLikes, setLocalLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const { user } = useAuthStore();

  const navigate = useNavigate();
  
  const canEdit = Boolean(
    user && obra && (
      user.rol === 'MASTER' ||
      (user.rol === 'MIEMBRO_ADMIN' && user.grupoId === obra.grupoId) ||
      (user.rol === 'MIEMBRO' && user.grupoId === obra.grupoId && obra.staffNombres?.includes(user.nombre))
    )
  );

  const fetchObra = useCallback(async () => {
    if (!obraNombre) return;
    try {
      const response = await api.get(`/obra/${obraNombre}`);
      setObra(response.data);
    } catch (err) {
      console.error('Error fetching obra', err);
      setError('Obra no encontrada o hubo un error al cargarla.');
    }
  }, [obraNombre]);

  // Fetch separado de capitulos usando el ID de la obra
  const fetchCapitulos = useCallback(async (obraId: number) => {
    try {
      const response = await api.get<Capitulo[]>(`/obras/${obraId}/capitulos`);
      setCapitulos(response.data);
    } catch (err) {
      console.error('Error al cargar capítulos', err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchObra().then(() => { if (cancelled) return; });
    return () => { cancelled = true; };
  }, [fetchObra]);

  // Cuando se carga la obra, cargar capítulos, estado guardado y estado de like
  useEffect(() => {
    if (!obra?.id) return;
    fetchCapitulos(obra.id);
    setLocalLikes(obra.likes);

    if (user) {
      // Cargar estado guardado
      api.get<GuardadoResponseDTO[]>('/guardados')
        .then(res => {
          const guardado = res.data.find(g => g.obraId === obra.id);
          if (guardado) setEstadoGuardado(guardado.estado);
        })
        .catch(() => {});

      // Cargar estado de like
      api.get<{ liked: boolean }>(`/obras/${obra.id}/like`)
        .then(res => setLiked(res.data.liked))
        .catch(() => {});
    }
  }, [obra?.id, fetchCapitulos, user]);

  const handleGuardarEstado = async (nuevoEstado: EstadoGuardado | '') => {
    if (!obra) return;
    
    // Si se selecciona la misma opción, se deselecciona (toggle off)
    if (nuevoEstado === '' || nuevoEstado === estadoGuardado) {
      try {
        await api.delete(`/guardados/${obra.id}`);
        setEstadoGuardado('');
      } catch (err) {
        console.error('Error al eliminar guardado', err);
      }
      return;
    }
    
    setEstadoGuardado(nuevoEstado);
    setGuardandoEstado(true);
    try {
      await api.post('/guardados', { obraId: obra.id, estado: nuevoEstado });
    } catch (err) {
      console.error('Error al guardar estado de la obra', err);
    } finally {
      setGuardandoEstado(false);
    }
  };

  const handleVerCapitulo = (numero: number) => {
    navigate(`/obra/${obraNombre}/capitulo/${numero}`);
  };

  const handleChapterCreated = () => {
    if (obra?.id) {
      console.log('✅ Capítulo creado correctamente. Actualizando lista...');
      fetchCapitulos(obra.id);
    }
  };

  const handleEliminarObra = async () => {
    if (!obra || !deleteObraPassword.trim()) return;
    setIsDeletingObra(true);
    setDeleteObraError(null);
    try {
      await api.delete(`/obras/${obra.id}`, { data: { password: deleteObraPassword } });
      navigate(-1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setDeleteObraError(e.response?.data?.message || 'Contraseña incorrecta o error de servidor.');
    } finally {
      setIsDeletingObra(false);
    }
  };

  const resetDeleteObraModal = () => {
    setShowDeleteObraConfirm(false);
    setDeleteObraStep('confirm');
    setDeleteObraPassword('');
    setDeleteObraError(null);
  };

  // UI optimista de like
  const handleToggleLike = async () => {
    if (!user || !obra || likeLoading) return;
    const prevLiked = liked;
    const prevLikes = localLikes;
    // Actualizar UI al instante (optimista)
    setLiked(!prevLiked);
    setLocalLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);
    setLikeLoading(true);
    try {
      const res = await api.post<{ liked: boolean; likes: number }>(`/obras/${obra.id}/like`);
      // Sincronizar con el valor real del backend
      setLiked(res.data.liked);
      setLocalLikes(res.data.likes);
    } catch {
      // Revertir en caso de error
      setLiked(prevLiked);
      setLocalLikes(prevLikes);
      alert('No se pudo procesar el like. Intentá de nuevo.');
    } finally {
      setLikeLoading(false);
    }
  };

  if (error) return <div className="min-h-screen bg-abyss-bg-obras text-red-500 flex items-center justify-center p-8">{error}</div>;
  if (!obra) return <div className="min-h-screen bg-abyss-bg-obras text-white flex items-center justify-center p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-abyss-bg-obras text-white flex flex-col w-full">
      <Navbar />
      <div className="flex flex-col items-center py-10 px-4 w-full">

      {/* Modal de creación de capítulo */}
      <CreateChapterModal
        isOpen={modalAbierto}
        obraId={obra.id}
        obraNombre={obra.titulo}
        onClose={() => setModalAbierto(false)}
        onSuccess={handleChapterCreated}
      />

      {/* Modal de edición de capítulo */}
      <EditChapterModal
        isOpen={modalEditarAbierto}
        obraId={obra.id}
        obraNombre={obra.titulo}
        onClose={() => setModalEditarAbierto(false)}
        onSuccess={() => { if (obra?.id) fetchCapitulos(obra.id); }}
      />

      {/* Modal de edición de obra */}
      <EditWorkModal
        isOpen={modalEditarObraAbierto}
        obraId={obra.id}
        onClose={() => setModalEditarObraAbierto(false)}
        onSuccess={() => { fetchObra(); }}
      />

      {/* Modal de eliminar capítulo */}
      <DeleteChapterModal
        isOpen={modalEliminarCapituloAbierto}
        capitulos={capitulos}
        onClose={() => setModalEliminarCapituloAbierto(false)}
        onSuccess={() => obra?.id && fetchCapitulos(obra.id)}
      />

      {/* Modal de eliminación de Obra (MASTER) */}
      {showDeleteObraConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetDeleteObraModal} />
          <div className="relative z-10 bg-abyss-bg-form-crear border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-300 uppercase tracking-wide">
                {deleteObraStep === 'confirm' ? 'Eliminar Obra' : 'Confirmar identidad'}
              </h2>
            </div>

            {deleteObraStep === 'confirm' ? (
              <>
                <p className="text-abyss-text-titles-form-crear/80">
                  ¿Estás seguro que deseas eliminar <span className="font-bold text-white">"{obra.titulo}"</span>?
                  Esta acción es permanente e irreversible. Se eliminarán todos los capítulos y páginas asociados.
                </p>
                <div className="flex gap-3">
                  <button onClick={resetDeleteObraModal} className="flex-1 bg-abyss-bg-input-form-crear text-abyss-text-titles-form-crear border border-abyss-border-input-form-crear rounded-lg py-2.5 font-semibold hover:brightness-110 transition">
                    Cancelar
                  </button>
                  <button onClick={() => setDeleteObraStep('password')} className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg py-2.5 transition">
                    Sí, eliminar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-abyss-text-titles-form-crear/70 text-sm">
                  Ingresá tu contraseña para confirmar la eliminación definitiva.
                </p>
                <input
                  type="password"
                  value={deleteObraPassword}
                  onChange={e => setDeleteObraPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isDeletingObra && deleteObraPassword.trim() && handleEliminarObra()}
                  placeholder="Contraseña"
                  className="bg-abyss-bg-input-form-crear text-abyss-text-input-form-crear border border-abyss-border-input-form-crear rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/50 transition-shadow"
                />
                {deleteObraError && <p className="text-red-400 text-sm font-bold">{deleteObraError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setDeleteObraStep('confirm')} disabled={isDeletingObra} className="flex-1 bg-abyss-bg-input-form-crear text-abyss-text-titles-form-crear border border-abyss-border-input-form-crear rounded-lg py-2.5 font-semibold hover:brightness-110 transition disabled:opacity-50">
                    Volver
                  </button>
                  <button
                    onClick={handleEliminarObra}
                    disabled={!deleteObraPassword.trim() || isDeletingObra}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg py-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isDeletingObra ? 'Eliminando...' : 'Confirmar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Card Obra */}
      <div className="w-full max-w-4xl bg-abyss-bg-card-obra rounded-xl p-6 shadow-lg border border-abyss-border-card-gp flex flex-col md:flex-row gap-8 mb-8">
        {/* Izquierda: Portada + Selector de Biblioteca */}
        <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-3">
          {obra.portada ? (
            <img src={obra.portada} alt={obra.titulo} className="w-full h-auto rounded-lg object-cover shadow-md" />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
              Sin portada
            </div>
          )}

          {/* Selector de biblioteca + Botón like */}
          {user && (
            <div className="flex items-center gap-2 w-full">
              {/* Select "Guardar como" rediseñado */}
              <div className="relative flex-1">
                <select
                  id="biblioteca-select"
                  value={estadoGuardado}
                  onChange={e => handleGuardarEstado(e.target.value as EstadoGuardado | '')}
                  disabled={guardandoEstado}
                  className="w-full cursor-pointer appearance-none bg-abyss-bg-selecs text-abyss-text-name-option border border-abyss-border-input rounded-lg px-3 py-2 pr-8 font-semibold text-xs outline-none transition-all disabled:opacity-50 focus:ring-1 focus:ring-abyss-border-input"
                >
                  <option value="">&#128218; Guardar como</option>
                  <option value="SIGUIENDO">&#128065; Siguiendo</option>
                  <option value="LEYENDO">&#128218; Leyendo</option>
                  <option value="LEIDO">&#10003; Leído</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-abyss-text-name-option opacity-50">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>

              {/* Botón corazón / like */}
              <button
                onClick={handleToggleLike}
                disabled={likeLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 disabled:opacity-50 shrink-0"
                style={{
                  background: liked
                    ? 'linear-gradient(135deg, #e11d48, #9f1239)'
                    : 'rgba(255,255,255,0.08)',
                  border: liked ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.15)',
                  color: liked ? '#fff' : 'rgba(255,255,255,0.7)',
                }}
                title={liked ? 'Quitar like' : 'Dar like'}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-150 ${liked ? 'scale-110' : ''}`}
                  fill={liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{localLikes}</span>
              </button>
            </div>
          )}
        </div>

        {/* Derecha: Info de la obra */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-abyss-text-name-obra">{obra.titulo}</h1>
          </div>

          {/* Stats: Vistas y Likes (queda solo el contador de vistas) */}
          <div className="flex gap-4 mb-4 text-sm text-abyss-text-description-obra font-medium">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {obra.vistas} Vistas
            </span>
          </div>

          <p className="text-abyss-text-description-obra mb-4 text-lg flex-1">
            {obra.descripcion || 'Sin descripción disponible para esta obra.'}
          </p>

          {/* Grupo y Staff */}
          {obra.grupoNombre && (
            <div 
              className="mb-6 p-4 rounded-lg shadow-md border border-abyss-border-card-gp/30"
              style={{ backgroundColor: 'var(--color-abyss-bg-grupo-obra)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-abyss-text-description-obra font-bold">
                  Traducido por:
                </span>
                <span 
                  className="font-medium text-base cursor-pointer hover:underline tracking-wide" 
                  onClick={() => navigate(`/grupos/${obra.grupoId}`)}
                  style={{ color: 'var(--color-abyss-text-grupo-obra)', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  {obra.grupoNombre}
                </span>
              </div>
              {obra.staffNombres && obra.staffNombres.length > 0 && (
                <div className="text-abyss-text-description-obra text-sm mt-2 font-medium opacity-90">
                  <span className="font-bold">Staff: </span>
                  {obra.staffNombres.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Atributos: Tipo, Estado, Demografía */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            {obra.tipoNombre && (
              <span className="bg-abyss-bg-selecs text-abyss-text-name-option px-3 py-1 rounded text-xs font-bold uppercase shadow-sm border border-abyss-border-input">
                {obra.tipoNombre}
              </span>
            )}
            <span className="text-abyss-text-description-obra text-xs font-bold uppercase tracking-wider opacity-80">
              {obra.estado}
            </span>
            {obra.demografiaNombre && (
              <span className="text-abyss-text-description-obra text-sm font-semibold opacity-80">
                {obra.demografiaNombre}
              </span>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-abyss-title-generos-obra font-bold text-xl mb-3 uppercase tracking-wider">Géneros</h2>
            <div className="flex flex-wrap gap-2">
              {obra.generosNombres && obra.generosNombres.length > 0 ? (
                obra.generosNombres.map((genero, index) => (
                  <span key={index} className="bg-abyss-bg-item-select text-abyss-text-item-select px-3 py-1 rounded-full text-sm font-bold border border-abyss-border-item-select shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                    {genero}
                  </span>
                ))
              ) : (
                <span className="text-abyss-text-description-obra italic text-sm">Sin géneros asignados.</span>
              )}
            </div>
          </div>

          {/* Botones de Obra según rol */}
          {canEdit && (
            <div className="flex gap-4 mt-auto border-t border-abyss-border-card-gp/30 pt-4">
              <button 
                onClick={() => setModalEditarObraAbierto(true)}
                className="bg-abyss-bg-button-editar text-abyss-text-button-editar border border-abyss-border-button-editar px-5 py-2.5 rounded font-bold hover:brightness-110 transition shadow-sm"
              >
                Editar Obra
              </button>
              {user?.rol === 'MASTER' && (
                <button 
                  onClick={() => setShowDeleteObraConfirm(true)}
                  className="bg-abyss-bg-button-eliminar text-abyss-text-button-eliminar border border-abyss-border-button-eliminar px-5 py-2.5 rounded font-bold hover:brightness-110 transition shadow-sm"
                >
                  Eliminar Obra
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección Inferior: Card Capitulos + Botones */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Card Capitulos */}
        <div className="w-full md:w-[60%] bg-abyss-bg-card-capitulos rounded-xl p-6 shadow-lg border border-abyss-border-card-gp flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-abyss-text-name-obra mb-2">Capítulos</h2>

          <div className="flex flex-col gap-3">
            {capitulos.length === 0 ? (
              <p className="text-abyss-text-description-obra italic text-center py-6">
                Esta obra aún no tiene capítulos.
              </p>
            ) : (
              capitulos.map(cap => (
                <button
                  key={cap.id ?? cap.numero}
                  onClick={() => handleVerCapitulo(cap.numero)}
                  className="w-full bg-abyss-bg-boton-capituloX text-abyss-text-boton-capituloX border border-abyss-border-boton-capituloX rounded p-4 flex justify-between items-center hover:brightness-110 transition shadow-sm"
                >
                  <span className="font-bold flex items-center gap-2">
                    {cap.leido ? (
                      <svg className="w-5 h-5 text-[#439892]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                    Capítulo {cap.numero % 1 === 0 ? Math.floor(cap.numero) : cap.numero}
                  </span>
                  <span className="text-sm font-medium opacity-80">
                    {cap.createdAt
                      ? new Date(cap.createdAt).toLocaleDateString('es-AR')
                      : ''}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Botones de Capitulos a la derecha */}
        {canEdit && (
          <div className="w-full md:w-[40%] flex flex-col gap-4 pt-14">
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-abyss-bg-button-editar text-abyss-text-button-editar border border-abyss-border-button-editar px-5 py-3 rounded font-bold hover:brightness-110 transition shadow-sm w-full"
            >
              Subir Capitulo
            </button>
            <button
              onClick={() => setModalEditarAbierto(true)}
              disabled={capitulos.length === 0}
              className="bg-abyss-bg-button-eliminar text-abyss-text-button-eliminar border border-abyss-border-button-eliminar px-5 py-3 rounded font-bold hover:brightness-110 transition shadow-sm w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Editar Capitulo
            </button>
            <button
              onClick={() => setModalEliminarCapituloAbierto(true)}
              disabled={capitulos.length === 0}
              className="bg-red-900/70 text-red-200 border border-red-500/50 px-5 py-3 rounded font-bold hover:bg-red-900 transition shadow-sm w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Eliminar Capitulo
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}


```

---

## Archivo: `src/services/api.ts`

```ts
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Interceptor para inyectar automáticamente el token JWT en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

```

---

## Archivo: `src/services/chapterService.ts`

```ts
import api from './api';

export interface CapituloResponseDTO {
  id: number;
  numero: number;
  obraId: number;
  createdAt: string;
  updatedAt: string;
  paginasUrls: string[];
  capituloAnteriorId: number | null;
  capituloSiguienteId: number | null;
  /** Número exacto del capítulo anterior (null si no existe) */
  numeroAnterior: number | null;
  /** Número exacto del capítulo siguiente (null si no existe) */
  numeroSiguiente: number | null;
}

/**
 * Obtiene los datos de un capítulo (incluyendo las URLs de las páginas y los IDs
 * de navegación) desde el endpoint público GET /api/obras/{nombreObra}/capitulos/{numero}.
 *
 * @param nombreObra - nombre de la obra tal como aparece en la URL (con guiones o espacios)
 * @param numero     - número del capítulo
 */
export async function obtenerCapituloDeObra(
  nombreObra: string,
  numero: number
): Promise<CapituloResponseDTO> {
  const response = await api.get<CapituloResponseDTO>(
    `/obras/${nombreObra}/capitulos/${numero}`
  );
  return response.data;
}

```

---

## Archivo: `src/services/groupService.ts`

```ts
import api from './api';

export const obtenerGrupoPorId = async (id: string) => {
  const response = await api.get(`/grupos/${id}`);
  return response.data;
};

```

---

## Archivo: `src/services/masterService.ts`

```ts
import api from './api';

export interface GrupoData {
  nombre: string;
  descripcion: string;
  portada?: string;
}

// Obtener todos los grupos
export const obtenerGrupos = async () => {
  const response = await api.get('/grupos');
  return response.data;
};

// Crear un nuevo grupo
export const crearGrupo = async (formData: FormData) => {
  const response = await api.post('/grupos', formData);
  return response.data;
};

// Editar grupo
export const editarGrupo = async (id: string | number, formData: FormData) => {
  const response = await api.put(`/grupos/${id}`, formData);
  return response.data;
};

// Eliminar grupo (requiere contraseña de MASTER)
export const eliminarGrupo = async (id: string | number, password: string) => {
  const response = await api.delete(`/grupos/${id}`, {
    data: { password }
  });
  return response.data;
};

// Eliminar miembro
export const eliminarMiembro = async (id: string | number) => {
  const response = await api.delete(`/miembros/${id}`);
  return response.data;
};

// Obtener todas las características en paralelo (Géneros, Demografías, Tipos)
export const obtenerCaracteristicas = async () => {
  // Promise.all permite ejecutar las tres peticiones simultáneamente
  const [generos, demografias, tipos] = await Promise.all([
    api.get('/generos'),
    api.get('/demografias'),
    api.get('/tipos')
  ]);
  
  return {
    generos: generos.data,
    demografias: demografias.data,
    tipos: tipos.data
  };
};

// Crear una nueva Característica
export const crearGenero = async (data: { nombre: string }) => {
  const response = await api.post('/generos', data);
  return response.data;
};

export const crearTipo = async (data: { nombre: string }) => {
  const response = await api.post('/tipos', data);
  return response.data;
};

export const crearDemografia = async (data: { nombre: string }) => {
  const response = await api.post('/demografias', data);
  return response.data;
};

// Editar y Eliminar
export const editarCaracteristica = async (tipo: 'generos' | 'tipos' | 'demografias', id: number, nombre: string) => {
  const response = await api.put(`/${tipo}/${id}`, { nombre });
  return response.data;
};

export const eliminarCaracteristica = async (tipo: 'generos' | 'tipos' | 'demografias', id: number) => {
  const response = await api.delete(`/${tipo}/${id}`);
  return response.data;
};

```

---

## Archivo: `src/store/useAuthStore.ts`

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  nombre: string;
  rol: string;
  mail: string;
  fotoPerfil?: string | null;
  grupoId?: number | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // Nombre bajo el cual se guardará en localStorage
    }
  )
);

```

