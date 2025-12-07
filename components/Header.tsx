import React from 'react';
import { Network } from 'lucide-react';

interface HeaderProps {
  status: 'Conectado' | 'Desconectado' | 'Conectando';
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Conectado': return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
      case 'Conectando': return 'bg-amber-400';
      default: return 'bg-rose-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'Conectado': return 'Sistema Online';
      case 'Conectando': return 'Conectando...';
      default: return 'Offline';
    }
  };

  return (
    <div className="bg-institution-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex items-center gap-4 z-10">
        <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
          <Network size={28} className="text-blue-300" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Nahuatlahtolli</h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium tracking-wide uppercase">Sistema de Traducción Institucional</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0 bg-institution-800/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md z-10">
        <span className={`h-2 w-2 rounded-full ${getStatusColor()} transition-all duration-1000`}></span>
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{getStatusText()}</span>
      </div>
    </div>
  );
};