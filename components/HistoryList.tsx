
import React, { useState, useEffect } from 'react';
import { History, Bookmark, Trash2, X, Database, ChevronRight, Clock, Search, ChevronDown, BookMarked } from 'lucide-react';
import { TranslationHistoryItem } from '../types';

interface HistoryListProps {
  history: TranslationHistoryItem[];
  saved: TranslationHistoryItem[];
  onClearHistory: () => void;
  onDeleteSaved: (id: string | number) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, saved, onClearHistory, onDeleteSaved }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  // Reset page when tab or search changes
  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab, searchTerm]);

  const rawItems = activeTab === 'history' ? history : saved;
  
  const filteredItems = rawItems.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.original_text.toLowerCase().includes(term) ||
      item.translated_text.toLowerCase().includes(term)
    );
  });

  const displayItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col h-fit">
      {/* Modern Tabs */}
      <div className="p-2 bg-slate-50 border-b border-slate-100">
        <div className="flex p-1 bg-white rounded-xl border border-slate-200/50 shadow-sm">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'history' 
                ? 'bg-institution-900 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History size={14} /> Historial
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'saved' 
                ? 'bg-institution-accent text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark size={14} /> Guardadas
          </button>
        </div>
      </div>

      <div className="p-4 bg-white flex-1 flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            {activeTab === 'history' ? <Clock size={10} /> : <Bookmark size={10} />}
            {activeTab === 'history' ? 'Recientes' : 'Favoritos'}
            <span className="ml-1 bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-500">{filteredItems.length}</span>
          </span>
          {activeTab === 'history' && history.length > 0 && (
            <button 
              onClick={onClearHistory} 
              className="text-[10px] text-red-500 hover:bg-red-50 px-2 py-1 rounded font-bold transition-colors"
            >
              LIMPIAR TODO
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar en historial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-institution-primary/20 focus:border-institution-primary transition-all"
          />
        </div>

        {/* List */}
        <div className="max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 flex flex-col gap-2">
          {displayItems.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-100 bg-slate-50/50">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 shadow-sm">
                <Search size={18} />
              </div>
              <p className="text-slate-500 text-xs font-semibold">
                {searchTerm ? 'No se encontraron resultados' : (activeTab === 'history' ? 'Sin registros recientes' : 'No hay elementos guardados')}
              </p>
            </div>
          ) : (
            <>
              {displayItems.map((item) => (
                <div key={item.id} className={`group relative bg-white border hover:shadow-lg hover:shadow-blue-900/5 rounded-xl transition-all duration-300 overflow-hidden shrink-0 ${activeTab === 'saved' ? 'border-amber-100 hover:border-amber-200' : 'border-slate-100 hover:border-institution-primary/30'}`}>
                  {activeTab === 'saved' ? (
                     <div className="absolute top-0 left-0 w-1 h-full bg-institution-accent"></div>
                  ) : (
                     <div className={`absolute top-0 left-0 w-1 h-full ${item.source_language === 'na' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></div>
                  )}
                  
                  <div className="p-3 pl-4 pr-8">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        {activeTab === 'saved' && <BookMarked size={10} className="text-institution-accent" />}
                        {item.source_language === 'na' ? 'Náhuatl' : 'Español'}
                      </span>
                      {activeTab === 'history' && (
                        <span className="text-[9px] text-slate-300 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    
                    <div className="font-bold text-institution-900 text-sm mb-1 truncate">{item.original_text}</div>
                    <div className="text-slate-500 text-xs truncate">{item.translated_text}</div>
                  </div>
                  
                  {activeTab === 'saved' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSaved(item.id); }}
                      className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar guardado"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              
              {hasMore && (
                <button 
                  onClick={handleLoadMore}
                  className="w-full py-2 text-xs font-bold text-institution-primary hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronDown size={12} />
                  Ver más registros
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
