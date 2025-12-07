import React from 'react';
import { BarChart3, ArrowRightLeft, Database, Activity } from 'lucide-react';
import { AppStats } from '../types';

interface StatCardProps {
  stats: AppStats;
}

export const StatCard: React.FC<StatCardProps> = ({ stats }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-institution-900 font-bold">
          <Activity className="text-institution-primary" size={20} />
          <span className="text-sm uppercase tracking-wide">Métricas</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-100">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-bold text-emerald-700 uppercase">En Línea</span>
        </div>
      </div>
      
      <div className="bg-institution-900 rounded-xl p-5 text-white mb-4 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-institution-primary/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Traducciones</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">{stats.total.toLocaleString()}</p>
            <span className="text-[10px] text-institution-primary font-bold">+12% hoy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
             <span className="w-1 h-3 rounded-full bg-emerald-500"></span>
             <span className="text-[10px] text-slate-500 font-bold uppercase">Náhuatl</span>
          </div>
          <div className="text-xl font-bold text-slate-800">{stats.na_es}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
             <span className="w-1 h-3 rounded-full bg-indigo-500"></span>
             <span className="text-[10px] text-slate-500 font-bold uppercase">Español</span>
          </div>
          <div className="text-xl font-bold text-slate-800">{stats.es_na}</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>ID SESIÓN: {stats.sessions}</span>
        <span className="flex items-center gap-1"><Database size={10}/> SQLITE</span>
      </div>
    </div>
  );
};