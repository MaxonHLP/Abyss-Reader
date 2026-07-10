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
    <div className="relative w-full max-w-5xl mx-auto h-[450px] md:h-[400px] overflow-hidden rounded-xl shadow-2xl group">
      {/* Cards Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {obras.map((obra) => (
          <div 
            key={obra.id} 
            className="w-full h-full flex-shrink-0 cursor-pointer flex flex-col md:flex-row"
            style={{ backgroundColor: 'var(--color-abyss-bg-carrusel)' }}
            onClick={() => navigate(`/obra/${obra.titulo}`)}
          >
            {/* Left/Top side: Portada */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center justify-center overflow-hidden">
              {obra.portada && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
                  style={{ backgroundImage: `url('${obra.portada}')` }}
                />
              )}
              {obra.portada ? (
                <img 
                  src={obra.portada} 
                  alt={obra.titulo} 
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/20 text-white/50 relative z-10 text-sm md:text-base">
                  Sin portada
                </div>
              )}
            </div>

            {/* Right/Bottom side: Info */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-8 flex flex-col justify-center overflow-hidden relative z-10">
              <h2 
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 md:mb-4 line-clamp-2"
                style={{ color: 'var(--color-abyss-text-carrusel)' }}
              >
                {obra.titulo}
              </h2>
              <p 
                className="text-sm sm:text-base md:text-lg line-clamp-3 sm:line-clamp-4 md:line-clamp-6 opacity-90"
                style={{ color: 'var(--color-abyss-text-carrusel)' }}
              >
                {obra.descripcion || 'Sin descripción.'}
              </p>
              <div className="mt-4 md:mt-6 flex items-center space-x-2" style={{ color: 'var(--color-abyss-text-carrusel)' }}>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span className="font-semibold text-sm md:text-base">{obra.likes} Me gustas</span>
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
            className="absolute left-2 md:left-4 top-1/4 md:top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 md:p-3 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-2 md:right-4 top-1/4 md:top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 md:p-3 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {obras.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
