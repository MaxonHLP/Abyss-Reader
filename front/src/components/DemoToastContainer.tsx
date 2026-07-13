import React from 'react';
import { useToastStore } from '../store/useToastStore';
import type { ToastType } from '../store/useToastStore';

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'DATA_CORE':
      return <span className="text-2xl mr-3" role="img" aria-label="shield">🛡️</span>;
    case 'ISOLATION':
      return <span className="text-2xl mr-3" role="img" aria-label="stop">🛑</span>;
    case 'LIMIT':
      return <span className="text-2xl mr-3" role="img" aria-label="warning">⚠️</span>;
  }
};

const DemoToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => {
        let bgColor = '';
        let title = '';
        switch (toast.type) {
          case 'DATA_CORE':
            bgColor = 'bg-amber-600 border-amber-400';
            title = 'Contenido de Exhibición';
            break;
          case 'ISOLATION':
            bgColor = 'bg-red-700 border-red-500';
            title = 'Acceso Denegado';
            break;
          case 'LIMIT':
            bgColor = 'bg-orange-600 border-orange-400';
            title = 'Límite Demo Alcanzado';
            break;
        }

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white px-5 py-4 rounded-xl shadow-2xl border-2 flex items-center min-w-[300px] animate-fade-in cursor-pointer hover:brightness-110 transition-all`}
            onClick={() => removeToast(toast.id)}
          >
            <ToastIcon type={toast.type} />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight drop-shadow-md">{title}</span>
              <span className="text-sm font-medium opacity-90 drop-shadow-sm">{toast.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DemoToastContainer;
