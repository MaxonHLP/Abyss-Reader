import { useEffect } from 'react';

/**
 * Hook que cierra un modal cuando el usuario presiona Escape.
 * Complementa el backdrop onClick para una UX completa.
 */
export function useModalBackdrop(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
