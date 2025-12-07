
import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Quote, Search, Hash, ArrowRight } from 'lucide-react';
import { WordDetail } from '../types';
import { searchDictionary } from '../services/nahuatlService';

interface DetailsCardProps {
  detail: WordDetail | null;
  onWordSelect?: (word: string) => void;
}

export const DetailsCard: React.FC<DetailsCardProps> = ({ detail, onWordSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsSearching(true);
      const results = searchDictionary(searchQuery);
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  // If a detail is selected externally, clear search
  useEffect(() => {
    if (detail) {
      setSearchQuery('');
    }
  }, [detail]);

  const handleSelectResult = (word: string) => {
    if (onWordSelect) {
      onWordSelect(word);
      setSearchQuery('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 min-h-[400px] flex flex-col transition-all relative overflow-hidden">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-24 h-24 bg-institution-primary/5 rounded-bl-full -mr-4 -mt-4"></div>

       <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-4 relative z-10">
          <div className="flex items-center gap-2 text-institution-900 font-bold">
            <GraduationCap className="text-institution-accent" size={20}/>
            <span>Diccionario</span>
          </div>
      </div>

      {/* Dictionary Search Bar */}
      <div className="relative mb-6 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar término o definición..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-institution-primary/20 focus:border-institution-primary outline-none transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {isSearching ? (
          <div className="flex-1 overflow-y-auto pr-1">
             <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Resultados de búsqueda</p>
             {searchResults.length > 0 ? (
               <div className="space-y-2">
                 {searchResults.map((res, idx) => (
                   <button 
                     key={idx}
                     onClick={() => handleSelectResult(res.word)}
                     className="w-full text-left p-3 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all group"
                   >
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-institution-900">{res.word}</span>
                       <span className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-500 uppercase">{res.partOfSpeech}</span>
                     </div>
                     <p className="text-xs text-slate-500 line-clamp-1 group-hover:text-slate-700">{res.meaning}</p>
                   </button>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-slate-400 text-xs">
                 No se encontraron resultados para "{searchQuery}"
               </div>
             )}
          </div>
        ) : detail ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-y-auto pr-2 custom-scrollbar">
             <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-2xl font-serif font-bold text-institution-900 capitalize tracking-tight">{detail.word}</h3>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded">
                  {detail.partOfSpeech}
                </span>
             </div>

             <div className="space-y-5 mt-4">
               <div>
                 <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Definición</p>
                 <p className="text-slate-700 font-medium text-sm leading-relaxed">{detail.meaning}</p>
               </div>
               
               {detail.etymology && (
                 <div>
                   <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Etimología</p>
                   <p className="text-slate-600 text-xs italic leading-relaxed border-l-2 border-institution-accent/50 pl-3">
                     "{detail.etymology}"
                   </p>
                 </div>
               )}

               {/* Synonyms & Related */}
               {(detail.synonyms?.length || detail.related?.length) ? (
                 <div className="space-y-3 pt-2">
                    {detail.synonyms && detail.synonyms.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">
                          <Hash size={10} /> Sinónimos
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {detail.synonyms.map((syn, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleSelectResult(syn.split(' ')[0])} // Simple split to handle variants like "Word (Desc)"
                              className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                            >
                              {syn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {detail.related && detail.related.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">
                          <ArrowRight size={10} /> Relacionados
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {detail.related.map((rel, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleSelectResult(rel.split(' ')[0])}
                              className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium hover:bg-slate-100 transition-colors"
                            >
                              {rel}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
               ) : null}

               {detail.example && (
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                   <div className="flex gap-2 items-start">
                     <Quote size={12} className="text-institution-primary shrink-0 mt-1 rotate-180"/>
                     <div>
                       <p className="text-[10px] text-institution-primary uppercase font-bold mb-1">Ejemplo en contexto</p>
                       <p className="text-slate-800 text-sm font-medium font-serif italic">{detail.example}</p>
                     </div>
                   </div>
                 </div>
               )}
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 opacity-50">
             <div className="bg-slate-50 p-4 rounded-full mb-3">
                <BookOpen size={24} className="text-slate-300" />
             </div>
             <p className="text-slate-400 text-xs font-medium">Use el buscador o seleccione una palabra de la traducción.</p>
          </div>
        )}
      </div>
    </div>
  );
};
