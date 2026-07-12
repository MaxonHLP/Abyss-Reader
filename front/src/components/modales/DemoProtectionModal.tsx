import { useEffect, useState } from 'react';

/**
 * Modal que intercepta eventos globales de restricción de Demo ("demo:restriction").
 * Se muestra cuando un usuario Demo intenta modificar datos Core de la aplicación.
 */
export default function DemoProtectionModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleDemoRestriction = () => {
      setIsOpen(true);
    };

    window.addEventListener('demo:restriction', handleDemoRestriction);
    return () => {
      window.removeEventListener('demo:restriction', handleDemoRestriction);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] transition-opacity p-4">
      <div 
        className="bg-[#0b0f19] p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-full max-w-md border border-[#1a2235] flex flex-col items-center gap-6 text-center transform transition-transform"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Icono de prohibido animado */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-red-500 animate-pulse" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Modo Demostración
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            No puedes modificar o eliminar las obras originales de <span className="font-semibold text-white">Abyss Reader</span> para proteger la experiencia de otros visitantes.
          </p>
          <p className="text-gray-300 text-sm font-medium mt-2">
            ¡Pero siéntete libre de crear tu propio manga y luego editarlo o eliminarlo!
          </p>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b0f19]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
