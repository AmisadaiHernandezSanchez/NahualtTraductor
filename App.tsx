
import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Copy, Save, X, HelpCircle, Settings, RefreshCw, Check, Bookmark, Zap, Book, Database, Sparkles
} from 'lucide-react';
import { Header } from './components/Header';
import { HistoryList } from './components/HistoryList';
import { StatCard } from './components/StatCard';
import { DetailsCard } from './components/DetailsCard';
import { translateText, getWordDetails, dbManager, sessionManager } from './services/nahuatlService';
import { AppStats, TranslationDirection, TranslationHistoryItem, WordDetail } from './types';

function App() {
  // State
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [direction, setDirection] = useState<TranslationDirection>("auto");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AppStats>({ total: 0, na_es: 0, es_na: 0, sessions: 0 });
  
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [savedItems, setSavedItems] = useState<TranslationHistoryItem[]>([]);
  
  const [status, setStatus] = useState<'Conectado' | 'Conectando'>("Conectando");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'exists'>('idle');
  const [dbNotification, setDbNotification] = useState<boolean>(false);
  
  const [selectedDetail, setSelectedDetail] = useState<WordDetail | null>(null);

  // Initialize DB and Session
  useEffect(() => {
    sessionManager.createSession(navigator.userAgent);
    refreshData();
    // Simulate connection check
    setTimeout(() => setStatus("Conectado"), 500);
  }, []);

  const refreshData = async () => {
    // These functions now call the API
    const h = await dbManager.getHistory();
    const s = await dbManager.getCustomDictionary();
    const st = await dbManager.getStatistics();
    
    setHistory(h);
    setSavedItems(s);
    setStats(st);
  };

  // Handle Translation
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setOutputText(""); 
    setDetectedLang(null);
    setConfidence(null);
    setSelectedDetail(null);
    setSaveStatus('idle');
    setDbNotification(false);
    
    try {
      // The service automatically saves to DB history
      const res = await translateText(inputText, direction);
      
      setOutputText(res.translated_text);
      setDetectedLang(res.detected_language);
      setConfidence(res.confidence);
      
      // Auto-analyze details: Try Output words first
      const words = res.translated_text.split(' ');
      let foundDetail = null;
      
      for (const w of words) {
        const d = getWordDetails(w);
        if (d) {
          foundDetail = d;
          break;
        }
      }
      
      // If no details found in output, check original input text
      if (!foundDetail) {
         const inputWords = inputText.split(' ');
         for (const w of inputWords) {
            const d = getWordDetails(w);
            if (d) {
                foundDetail = d;
                break;
            }
         }
      }
      
      setSelectedDetail(foundDetail);
      
      await refreshData(); // Update UI from DB (Async now)
      
      // Show DB save notification
      setDbNotification(true);
      setTimeout(() => setDbNotification(false), 3000);

    } catch (error) {
      console.error("Translation error", error);
      setOutputText("Error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!outputText || !inputText) return;
    
    const sourceLang = detectedLang || (direction === 'na-es' ? 'na' : 'es'); 
    const targetLang = sourceLang === 'na' ? 'es' : 'na';

    const success = await dbManager.addCustomTranslation(
      inputText, 
      outputText, 
      sourceLang, 
      targetLang, 
      sessionManager.getCurrentSessionId() || 'unknown'
    );

    if (!success) {
      setSaveStatus('exists');
    } else {
      setSaveStatus('saved');
      await refreshData();
    }
    
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDeleteSaved = async (id: string | number) => {
    await dbManager.removeCustomTranslation(id);
    await refreshData();
  };

  const handleClearHistory = async () => {
    await dbManager.clearHistory();
    await refreshData();
  };

  const clearInput = () => {
    setInputText("");
    setOutputText("");
    setCopied(false);
    setSaveStatus('idle');
    setSelectedDetail(null);
    setDetectedLang(null);
    setConfidence(null);
  };

  const handleWordClick = (word: string) => {
    // If word contains parens from synonyms (e.g. "Word (Context)"), clean it
    const cleanWord = word.replace(/\s*\(.*?\)\s*/g, '');
    const details = getWordDetails(cleanWord);
    setSelectedDetail(details); 
  };

  const renderConfidenceBar = () => {
    if (confidence === null) return null;
    
    let color = 'bg-rose-500';
    let text = 'Revisión';
    if (confidence > 0.8) { color = 'bg-emerald-500'; text = 'Alta Precisión'; }
    else if (confidence > 0.5) { color = 'bg-amber-500'; text = 'Aceptable'; }

    return (
      <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-700">{Math.round(confidence * 100)}%</span>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
                      style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
            </div>
        </div>
        <Zap size={14} className={confidence > 0.8 ? "text-emerald-500" : "text-amber-500"} />
      </div>
    );
  };

  const renderInteractiveOutput = () => {
    if (!outputText) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 select-none">
          <div className="p-4 bg-slate-50 rounded-full">
            <Sparkles size={24} className="text-slate-300" />
          </div>
          <span className="text-sm font-medium tracking-wide">Esperando análisis...</span>
        </div>
      );
    }

    const words = outputText.split(' ');
    return (
      <p className="text-2xl font-serif text-institution-900 leading-loose">
        {words.map((word, index) => (
          <React.Fragment key={index}>
            <span 
              role="button"
              className="cursor-pointer hover:text-institution-primary hover:bg-blue-50 px-1 rounded transition-colors relative"
              onClick={() => handleWordClick(word)}
              title="Analizar palabra"
            >
              {word}
            </span>
            {index < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans relative selection:bg-institution-primary/20 selection:text-institution-900">
      {/* Abstract Background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl mix-blend-multiply filter opacity-70"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-amber-50 rounded-full blur-3xl mix-blend-multiply filter opacity-70"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <Header status={status} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT COLUMN (TRANSLATOR) --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
              <div className="p-1">
                 <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100/50">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-institution-primary rounded-full"></span>
                            <h2 className="text-xs font-bold text-institution-900 uppercase tracking-widest">Entrada de Texto</h2>
                        </div>
                        
                        {detectedLang && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-slate-200 text-institution-primary shadow-sm animate-in fade-in">
                              {detectedLang === 'na' ? 'NÁHUATL' : 'ESPAÑOL'} DETECTADO
                          </span>
                        )}
                    </div>

                    <textarea 
                        className="w-full h-40 bg-transparent border-0 resize-none focus:ring-0 text-xl text-institution-900 placeholder:text-slate-300 leading-relaxed"
                        placeholder="Escriba aquí para comenzar la traducción..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        spellCheck="false"
                    ></textarea>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200/50">
                        <button 
                          onClick={clearInput} 
                          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${inputText ? 'text-red-500 hover:bg-red-50' : 'text-slate-300 cursor-default'}`}
                          disabled={!inputText}
                        >
                          <X size={12} /> Limpiar
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{inputText.length} chars</span>
                    </div>
                 </div>
              </div>

              {/* Controls Bar */}
              <div className="px-6 py-4 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-50">
                <div className="flex bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
                  {['auto', 'na-es', 'es-na'].map((opt) => (
                    <button 
                        key={opt}
                        onClick={() => { setDirection(opt as TranslationDirection); setDetectedLang(null); }}
                        className={`flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                            direction === opt 
                            ? 'bg-white text-institution-900 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {opt === 'auto' ? 'Automático' : opt === 'na-es' ? 'Na → Es' : 'Es → Na'}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full sm:w-auto bg-gradient-to-r from-institution-900 to-institution-800 hover:from-institution-primary hover:to-blue-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm tracking-wide transition-all shadow-lg shadow-slate-200 hover:shadow-blue-500/30 transform active:scale-[0.98]"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                  TRADUCIR AHORA
                </button>
              </div>
            </div>

            {/* Output Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 min-h-[260px] flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-institution-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-institution-primary">
                        <Book size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-institution-900 uppercase tracking-wide">Traducción</h2>
                        <p className="text-[10px] text-slate-400 font-medium">Motor: Trie + Morfología + Fuzzy</p>
                    </div>
                </div>
                {renderConfidenceBar()}
              </div>
              
              <div className="flex-1 px-1">
                {renderInteractiveOutput()}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-50">
                <button 
                  onClick={handleCopy} 
                  disabled={!outputText}
                  className={`group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${copied ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} className="group-hover/btn:scale-110 transition-transform"/>}
                  {copied ? 'COPIADO' : 'COPIAR'}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!outputText}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border ${
                    saveStatus !== 'idle'
                      ? 'bg-amber-50 text-amber-700 border-amber-100' 
                      : 'bg-white text-institution-900 border-institution-900 hover:bg-institution-900 hover:text-white'
                  }`}
                >
                  {saveStatus !== 'idle' ? <Bookmark size={14} fill="currentColor" /> : <Save size={14} />}
                  {saveStatus === 'saved' ? 'GUARDADO' : saveStatus === 'exists' ? 'YA EXISTE' : 'GUARDAR'}
                </button>
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (SIDEBAR) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            <HistoryList 
              history={history} 
              saved={savedItems}
              onClearHistory={handleClearHistory} 
              onDeleteSaved={handleDeleteSaved}
            />

            <DetailsCard detail={selectedDetail} onWordSelect={handleWordClick} />

            <StatCard stats={stats} />

          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="border-t border-slate-200 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-slate-400 pb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="font-bold text-slate-600">Sistema Operativo v2.1</span>
            </div>
            <span className="hidden md:inline text-slate-300">/</span>
            <span>Licencia Académica</span>
          </div>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <button className="hover:text-institution-primary transition-colors flex items-center gap-1"><HelpCircle size={12}/> Ayuda</button>
            <button className="hover:text-institution-primary transition-colors flex items-center gap-1"><Settings size={12}/> Configuración</button>
          </div>
        </div>

      </div>

      {/* --- DATABASE NOTIFICATION TOAST --- */}
      {dbNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
           <div className="bg-institution-900/95 backdrop-blur-md text-white pl-4 pr-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/10">
              <div className="bg-emerald-500/20 p-1.5 rounded-full">
                 <Database size={14} className="text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wide">Registro Guardado</span>
                <span className="text-[10px] text-slate-400">Base de datos sincronizada</span>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default App;
