
import { TranslationDirection, TranslationResponse, WordDetail, TranslationHistoryItem, AppStats, Session } from '../types';

// --- TRIE DATA STRUCTURE (Frontend Logic - Fast & Low Latency) ---
class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  translation: string | null;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.translation = null;
  }
}

class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, translation: string) {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.translation = translation;
  }

  search(word: string): string | null {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        return null;
      }
      current = current.children.get(char)!;
    }
    return current.isEndOfWord ? current.translation : null;
  }
}

// --- DATA INITIALIZATION ---

const rawNahuatlData = [
  { w: "pialli", t: "hola" },
  { w: "cualli tonalli", t: "buenos dias" },
  { w: "tlazocamati", t: "gracias" },
  { w: "atl", t: "agua" },
  { w: "tletl", t: "fuego" },
  { w: "tlalli", t: "tierra" },
  { w: "xochitl", t: "flor" },
  { w: "calli", t: "casa" },
  { w: "chichi", t: "perro" },
  { w: "itzcuintli", t: "perro" }, // Added synonym
  { w: "miztli", t: "gato" },
  { w: "tlazohtlaliztli", t: "amor" },
  { w: "tonatiuh", t: "sol" },
  { w: "metztli", t: "luna" },
  { w: "yollotl", t: "corazon" },
  { w: "nantli", t: "madre" },
  { w: "tahtli", t: "padre" },
  { w: "pilli", t: "niño" },
  { w: "nemiliztli", t: "vida" },
  { w: "miquiztli", t: "muerte" },
  { w: "tepetl", t: "montaña" },
  { w: "ehecatl", t: "viento" },
  { w: "cihuatl", t: "mujer" },
  { w: "tlacatl", t: "hombre" }
];

// Initialize Tries
const nahuatlTrie = new Trie();
const spanishTrie = new Trie();

// Populate Tries
rawNahuatlData.forEach(item => {
  nahuatlTrie.insert(item.w, item.t);
  spanishTrie.insert(item.t, item.w);
});

const wordDetailsDb: Record<string, WordDetail> = {
  // --- NAHUATL ---
  "pialli": { 
    word: "Pialli", 
    meaning: "Hola / Saludo", 
    partOfSpeech: "Interjección", 
    etymology: "Derivado del verbo 'pia' (tener/guardar/custodiar). Literalmente 'lo tienes'.", 
    example: "Pialli, ¿quenin tica?",
    synonyms: ["Niltze", "Hao"],
    related: ["Tlahpaloliztli (Saludo)"]
  },
  "cualli": { 
    word: "Cualli", 
    meaning: "Bueno / Aceptable / Algo que se puede comer o asimilar", 
    partOfSpeech: "Adjetivo", 
    etymology: "De 'cualo' (lo que es comido/asimilable).", 
    example: "Cualli tonalli",
    synonyms: ["Yectli"],
    related: ["Cualnezqui (Bonito)"]
  },
  "tonalli": { 
    word: "Tonalli", 
    meaning: "Día / Sol / Destino / Calor solar", 
    partOfSpeech: "Sustantivo", 
    etymology: "Raíz 'tona' (hacer calor/sol). Se refiere a la energía solar y el destino.", 
    example: "Ce cualli tonalli",
    related: ["Tonatiuh", "Tonalpohualli"]
  },
  "tlazocamati": { 
    word: "Tlazocamati", 
    meaning: "Gracias", 
    partOfSpeech: "Interjección", 
    etymology: "Literalmente 'se aprecia con amor' (tlazohtla: amar).", 
    example: "Tlazocamati huel miac",
    synonyms: ["Ompa nimitztlazocamachilia"]
  },
  "atl": { 
    word: "Atl", 
    meaning: "Agua / Líquido vital", 
    partOfSpeech: "Sustantivo", 
    etymology: "Elemento primario en la cosmovisión nahua.", 
    example: "In atl, in tepetl (El agua, el cerro = La ciudad)",
    related: ["Ameyalli (Manantial)", "Atepetl"]
  },
  "tletl": { word: "Tletl", meaning: "Fuego", partOfSpeech: "Sustantivo", etymology: "Energía transformadora.", example: "Xikpoa in tletl", related: ["Tlecuil (Fogón)"] },
  "tlalli": { word: "Tlalli", meaning: "Tierra", partOfSpeech: "Sustantivo", etymology: "Madre tierra, suelo.", example: "Tlalli iyollo (Corazón de la tierra)", related: ["Milli (Campo)"] },
  "xochitl": { word: "Xochitl", meaning: "Flor", partOfSpeech: "Sustantivo", etymology: "Símbolo de belleza, arte y efimeridad.", example: "In xochitl, in cuicatl (Flor y canto = Poesía)", related: ["Xochipilli", "Xochimilco"] },
  "calli": { word: "Calli", meaning: "Casa", partOfSpeech: "Sustantivo", etymology: "Estructura que resguarda.", example: "No cal (Mi casa)", synonyms: ["Chantli (Hogar)"] },
  "chichi": { 
    word: "Chichi", 
    meaning: "Perro", 
    partOfSpeech: "Sustantivo", 
    etymology: "Posiblemente onomatopéyico (chi-chi) o coloquial.", 
    example: "In chichi choca",
    synonyms: ["Itzcuintli (Término formal/genérico)"],
    related: ["Xoloitzcuintli"]
  },
  "itzcuintli": { 
    word: "Itzcuintli", 
    meaning: "Perro (Término formal)", 
    partOfSpeech: "Sustantivo", 
    etymology: "De 'itz' (navaja/diente) y 'cuintli' (diente/morder).", 
    example: "Itzcuintli tlacua",
    synonyms: ["Chichi"],
  },
  "miztli": { word: "Miztli", meaning: "Gato / Felino", partOfSpeech: "Sustantivo", etymology: "Felino. Relacionado con puma (miztli).", example: "Mizton (Gatito)", synonyms: ["Mizton"] },
  "tlazohtlaliztli": { word: "Tlazohtlaliztli", meaning: "Amor", partOfSpeech: "Sustantivo", etymology: "Sustantivación del verbo 'tlazohtla' (amar).", example: "Nimitztlazohtla (Te amo)" },
  "tonatiuh": { word: "Tonatiuh", meaning: "Sol", partOfSpeech: "Sustantivo", etymology: "El que va brillando / El que va calentando.", example: "Tonatiuh ilhuicac (Sol en el cielo)", related: ["Tonalli"] },
  "metztli": { word: "Metztli", meaning: "Luna", partOfSpeech: "Sustantivo", etymology: "También significa 'pierna' en algunos contextos, pero aquí es el astro.", example: "Metztli yohualli (Luna nocturna)" },
  "yollotl": { word: "Yollotl", meaning: "Corazón", partOfSpeech: "Sustantivo", etymology: "Raíz 'yollo' (vida/movimiento). Centro de la voluntad.", example: "Noyollo (Mi corazón)" },
  "nantli": { word: "Nantli", meaning: "Madre", partOfSpeech: "Sustantivo", etymology: "Concepto de origen.", example: "Nonan (Mi madre)", synonyms: ["Tonantzin (Nuestra madrecita)"] },
  "tahtli": { word: "Tahtli", meaning: "Padre", partOfSpeech: "Sustantivo", etymology: "Figura paterna.", example: "Notah (Mi padre)" },
  "pilli": { word: "Pilli", meaning: "Niño / Noble", partOfSpeech: "Sustantivo", etymology: "Polisémico: puede significar hijo pequeño o persona de la nobleza.", example: "Nopiltzin (Mi amado hijo/Señor)", synonyms: ["Conetl (Niño pequeño)"] },
  "nemiliztli": { word: "Nemiliztli", meaning: "Vida / Historia / Costumbre", partOfSpeech: "Sustantivo", etymology: "Del verbo 'nemi' (vivir/habitar).", example: "Cualli nemiliztli (Buena vida)", synonyms: ["Yoliliztli"] },
  "miquiztli": { word: "Miquiztli", meaning: "Muerte", partOfSpeech: "Sustantivo", etymology: "Del verbo 'miqui' (morir). Signo del calendario.", example: "Miquiztli in tonalli" },
  "tepetl": { word: "Tepetl", meaning: "Montaña / Cerro", partOfSpeech: "Sustantivo", etymology: "Lugar alto/poblado.", example: "Popocatepetl (Montaña que humea)", related: ["Altepetl (Pueblo)"] },
  "ehecatl": { word: "Ehecatl", meaning: "Viento / Aire", partOfSpeech: "Sustantivo", etymology: "Aliento divino/aire.", example: "Ehecatl quihualica (El viento lo trae)" },
  "cihuatl": { word: "Cihuatl", meaning: "Mujer", partOfSpeech: "Sustantivo", etymology: "Femenino.", example: "Cihuatl tlamatini (Mujer sabia)", synonyms: ["Ichpochtli (Joven)"] },
  "tlacatl": { word: "Tlacatl", meaning: "Hombre / Persona / Ser Humano", partOfSpeech: "Sustantivo", etymology: "Ser humano (genérico).", example: "Ce tlacatl (Una persona)", synonyms: ["Oquichtli (Varón)"] },
  
  // --- SPANISH (For reverse translation analysis) ---
  "hola": { word: "Hola", meaning: "Saludo", partOfSpeech: "Interjección", etymology: "Posiblemente del inglés 'hello' o alemán 'hallo', o expresivo.", example: "Hola, ¿cómo estás?", synonyms: ["Saludos", "Buen día"] },
  "buenos": { word: "Buenos", meaning: "Adjetivo de cualidad positiva", partOfSpeech: "Adjetivo", etymology: "Del latín 'bonus'.", example: "Buenos días" },
  "dias": { word: "Días", meaning: "Período de 24 horas", partOfSpeech: "Sustantivo", etymology: "Del latín 'dies'.", example: "Buenos días tengan todos" },
  "gracias": { word: "Gracias", meaning: "Expresión de agradecimiento", partOfSpeech: "Interjección", etymology: "Del latín 'gratia' (favor/cualidad agradable).", example: "Muchas gracias por todo", synonyms: ["Agradecido"] },
  "agua": { word: "Agua", meaning: "Sustancia líquida (H2O)", partOfSpeech: "Sustantivo", etymology: "Del latín 'aqua'.", example: "Beber agua pura", related: ["Líquido", "Hidratación"] },
  "fuego": { word: "Fuego", meaning: "Combustión / Calor y luz", partOfSpeech: "Sustantivo", etymology: "Del latín 'focus' (hogar/fogón).", example: "El fuego calienta", synonyms: ["Lumbre", "Incendio"] },
  "tierra": { word: "Tierra", meaning: "Planeta / Suelo", partOfSpeech: "Sustantivo", etymology: "Del latín 'terra'.", example: "Trabajar la tierra", synonyms: ["Suelo", "Terreno"] },
  "flor": { word: "Flor", meaning: "Estructura reproductiva planta", partOfSpeech: "Sustantivo", etymology: "Del latín 'flos, floris'.", example: "Una flor roja" },
  "casa": { word: "Casa", meaning: "Edificio para habitar", partOfSpeech: "Sustantivo", etymology: "Del latín 'casa' (choza).", example: "Voy a casa", synonyms: ["Hogar", "Vivienda", "Domicilio"] },
  "perro": { word: "Perro", meaning: "Mamífero doméstico", partOfSpeech: "Sustantivo", etymology: "Incierta, exclusivo del castellano.", example: "El perro ladra", synonyms: ["Can", "Chucho"] },
  "gato": { word: "Gato", meaning: "Felino doméstico", partOfSpeech: "Sustantivo", etymology: "Del latín tardío 'cattus'.", example: "El gato maúlla", synonyms: ["Minino", "Felino"] },
  "amor": { word: "Amor", meaning: "Sentimiento de afecto", partOfSpeech: "Sustantivo", etymology: "Del latín 'amor'.", example: "Amor verdadero", synonyms: ["Cariño", "Afecto", "Pasión"] },
  "sol": { word: "Sol", meaning: "Estrella central", partOfSpeech: "Sustantivo", etymology: "Del latín 'sol'.", example: "El sol brilla", related: ["Luz", "Día"] },
  "luna": { word: "Luna", meaning: "Satélite natural", partOfSpeech: "Sustantivo", etymology: "Del latín 'luna' (luminosa).", example: "Luna llena", related: ["Noche", "Satélite"] },
  "corazon": { word: "Corazón", meaning: "Órgano vital / Centro", partOfSpeech: "Sustantivo", etymology: "Del latín 'cor, cordis'.", example: "Me duele el corazón" },
  "madre": { word: "Madre", meaning: "Progenitora femenina", partOfSpeech: "Sustantivo", etymology: "Del latín 'mater'.", example: "Amor de madre", synonyms: ["Mamá"] },
  "padre": { word: "Padre", meaning: "Progenitor masculino", partOfSpeech: "Sustantivo", etymology: "Del latín 'pater'.", example: "Padre de familia", synonyms: ["Papá"] },
  "niño": { word: "Niño", meaning: "Persona de corta edad", partOfSpeech: "Sustantivo", etymology: "Voz expresiva infantil.", example: "El niño juega", synonyms: ["Chico", "Infante"] },
  "vida": { word: "Vida", meaning: "Existencia", partOfSpeech: "Sustantivo", etymology: "Del latín 'vita'.", example: "La vida es bella", synonyms: ["Existencia"] },
  "muerte": { word: "Muerte", meaning: "Fin de la vida", partOfSpeech: "Sustantivo", etymology: "Del latín 'mors, mortis'.", example: "Vida y muerte", synonyms: ["Fallecimiento", "Deceso"] },
  "montaña": { word: "Montaña", meaning: "Elevación natural", partOfSpeech: "Sustantivo", etymology: "De 'monte'.", example: "Subir la montaña", synonyms: ["Monte", "Cerro"] },
  "viento": { word: "Viento", meaning: "Corriente de aire", partOfSpeech: "Sustantivo", etymology: "Del latín 'ventus'.", example: "Viento del norte", synonyms: ["Aire", "Brisca"] },
  "mujer": { word: "Mujer", meaning: "Persona adulta femenina", partOfSpeech: "Sustantivo", etymology: "Del latín 'mulier'.", example: "Mujer trabajadora", synonyms: ["Dama", "Señora"] },
  "hombre": { word: "Hombre", meaning: "Ser humano / Varón", partOfSpeech: "Sustantivo", etymology: "Del latín 'homo'.", example: "El hombre piensa", synonyms: ["Varón", "Caballero"] }
};

// --- ALGORITHMS ---

// 1. Language Detection (Heuristic)
const detectLanguage = (text: string): 'na' | 'es' => {
  const t = text.toLowerCase();
  
  // Nahuatl Phonemes & Patterns
  const naPatterns = [/tl/g, /tz/g, /hua/g, /qui/g, /ll/g, /z/g];
  const naEndings = [/(tl|tli|li|in|uh)$/];
  
  // Spanish Phonemes & Patterns
  const esPatterns = [/ción/g, /dad/g, /ñ/g, /que/g, /b/g, /d/g, /f/g, /r/g]; // b,d,f,r often less common in classical nahuatl or used differently
  
  let naScore = 0;
  let esScore = 0;

  naPatterns.forEach(p => { if (t.match(p)) naScore++; });
  naEndings.forEach(p => { if (t.match(p)) naScore += 2; });

  esPatterns.forEach(p => { if (t.match(p)) esScore++; });
  if (/[aeiou]$/.test(t) && !t.endsWith('hua')) esScore += 0.5; // Spanish often ends in vowel

  // Bias check: check if words exist in tries
  if (nahuatlTrie.search(t)) return 'na';
  if (spanishTrie.search(t)) return 'es';

  return naScore >= esScore ? 'na' : 'es';
};

// 2. Morphological Analyzer (Rule-based Stemming for Nahuatl)
const stripNahuatlMorphology = (word: string): string[] => {
  const stems: string[] = [];
  let w = word.toLowerCase();

  // Prefixes (Possessives, Subject)
  const prefixes = ['no', 'mo', 'i', 'to', 'amo', 'in', 'ni', 'ti', 'qui'];
  for (const p of prefixes) {
    if (w.startsWith(p)) {
      stems.push(w.slice(p.length));
    }
  }

  // Suffixes (Absolutive, Diminutive, Reverential)
  const suffixes = ['tli', 'tl', 'li', 'in', 'tzin', 'ton'];
  for (const s of suffixes) {
    if (w.endsWith(s)) {
      stems.push(w.slice(0, -s.length));
    }
  }
  
  // Attempt to strip both
  for (const p of prefixes) {
    for (const s of suffixes) {
        if (w.startsWith(p) && w.endsWith(s)) {
             stems.push(w.slice(p.length, -s.length));
        }
    }
  }

  return stems;
};

// 3. Levenshtein Distance (Fuzzy Matching)
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator,
      );
    }
  }
  return matrix[b.length][a.length];
};

const findClosestMatch = (word: string, lang: 'na' | 'es'): { match: string, distance: number } | null => {
  const targets = rawNahuatlData.map(item => lang === 'na' ? item.w : item.t);
  let bestWord = null;
  let minDistance = Infinity;

  for (const target of targets) {
    const dist = levenshteinDistance(word, target);
    if (dist < minDistance) {
      minDistance = dist;
      bestWord = target;
    }
  }

  // Threshold: only return if distance is reasonable (e.g., < 3 or < 40% of length)
  if (bestWord && minDistance <= Math.max(2, word.length * 0.4)) {
      return { match: bestWord, distance: minDistance };
  }
  return null;
};

// --- EXPORTED FUNCTIONS ---

export const translateText = async (text: string, direction: TranslationDirection): Promise<TranslationResponse> => {
  // 1. Detect Direction
  let sourceLang: 'na' | 'es' = 'na';
  if (direction === 'auto') {
    sourceLang = detectLanguage(text);
  } else {
    sourceLang = direction === 'na-es' ? 'na' : 'es';
  }

  const targetLang = sourceLang === 'na' ? 'es' : 'na';
  const trie = sourceLang === 'na' ? nahuatlTrie : spanishTrie;
  
  const words = text.split(/[\s,.;?¿!¡]+/);
  const translatedWords: string[] = [];
  let totalConfidence = 0;
  let wordCount = 0;
  let matchTypeStats: Record<string, number> = { exact: 0, root: 0, fuzzy: 0, none: 0 };

  for (const rawWord of words) {
    if (!rawWord) continue;
    wordCount++;
    const word = rawWord.toLowerCase();
    
    // Strategy A: Exact Match (O(L))
    const exactMatch = trie.search(word);
    if (exactMatch) {
      translatedWords.push(exactMatch);
      totalConfidence += 1.0;
      matchTypeStats.exact++;
      continue;
    }

    // Strategy B: Morphological Analysis (Root Finding) - Only for Nahuatl Source
    if (sourceLang === 'na') {
      const potentialRoots = stripNahuatlMorphology(word);
      let foundRoot = null;
      for (const root of potentialRoots) {
        const rootMatch = trie.search(root);
        if (rootMatch) {
          foundRoot = rootMatch;
          break;
        }
      }
      if (foundRoot) {
        translatedWords.push(foundRoot); // In a real app, we might conjugate this back
        totalConfidence += 0.85;
        matchTypeStats.root++;
        continue;
      }
    }

    // Strategy C: Fuzzy Matching (Levenshtein)
    const fuzzy = findClosestMatch(word, sourceLang);
    if (fuzzy) {
        // Look up the translation of the fuzzy match
        const translation = trie.search(fuzzy.match);
        if (translation) {
            translatedWords.push(translation + "?"); // Indicate uncertainty
            totalConfidence += 0.6;
            matchTypeStats.fuzzy++;
            continue;
        }
    }

    // Fallback: Keep original
    translatedWords.push(`[${rawWord}]`);
    totalConfidence += 0.0;
    matchTypeStats.none++;
  }

  const resultText = translatedWords.join(' ');
  const avgConfidence = wordCount > 0 ? totalConfidence / wordCount : 0;
  
  // Determine dominant match type
  let dominantType: any = 'none';
  let maxCount = -1;
  Object.entries(matchTypeStats).forEach(([type, count]) => {
      if (count > maxCount) {
          maxCount = count;
          dominantType = type;
      }
  });

  // DB Save (LocalStorage)
  const currentSessionId = sessionManager.getCurrentSessionId();
  await dbManager.addHistory(currentSessionId, text, resultText, sourceLang, targetLang, avgConfidence);

  return {
    original_text: text,
    translated_text: resultText.charAt(0).toUpperCase() + resultText.slice(1),
    detected_language: sourceLang,
    confidence: avgConfidence,
    match_type: dominantType
  };
};

export const getWordDetails = (word: string): WordDetail | null => {
  const cleanWord = word.toLowerCase().replace(/[?,.!¡¿]/g, '');
  
  // Direct lookup
  if (wordDetailsDb[cleanWord]) {
    return wordDetailsDb[cleanWord];
  }
  
  // Strip suffix lookup (basic)
  if (cleanWord.endsWith('s')) {
     const singular = cleanWord.slice(0, -1);
     if (wordDetailsDb[singular]) return wordDetailsDb[singular];
  }

  return null;
};

// Advanced Dictionary Search
export const searchDictionary = (query: string): WordDetail[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: WordDetail[] = [];
  
  Object.values(wordDetailsDb).forEach(detail => {
    // Search by word
    if (detail.word.toLowerCase().includes(q)) {
      results.push(detail);
      return;
    }
    // Search by meaning
    if (detail.meaning.toLowerCase().includes(q)) {
      results.push(detail);
      return;
    }
    // Search by synonym (if available)
    if (detail.synonyms && detail.synonyms.some(s => s.toLowerCase().includes(q))) {
      results.push(detail);
      return;
    }
  });

  return results.slice(0, 10); // Limit results
};

// --- DATABASE MANAGER (LocalStorage Implementation) ---
class DatabaseManager {
  private HISTORY_KEY = 'nahuatl_history';
  private SAVED_KEY = 'nahuatl_saved';
  private STATS_KEY = 'nahuatl_stats';
  private SESSIONS_KEY = 'nahuatl_sessions';

  // Helper to get from localstorage safely
  private getStorage(key: string): any[] {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch { return []; }
  }

  private setStorage(key: string, data: any[]) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) { console.error("Storage limit", e); }
  }

  public async addHistory(
    sessionId: string | undefined, 
    originalText: string, 
    translatedText: string, 
    sourceLang: string, 
    targetLang: string, 
    confidence: number
  ) {
    const history = this.getStorage(this.HISTORY_KEY);
    const newItem: TranslationHistoryItem = {
        id: Date.now() + Math.random(), // Unique ID
        original_text: originalText,
        translated_text: translatedText,
        source_language: sourceLang,
        target_language: targetLang,
        timestamp: Date.now(),
        session_id: sessionId,
        confidence_score: confidence
    };
    
    // Add to beginning
    history.unshift(newItem);
    // Keep max 1000 items
    if (history.length > 1000) history.pop();
    
    this.setStorage(this.HISTORY_KEY, history);
    
    await this.updateStats(sourceLang, targetLang);
  }

  public async getHistory(limit: number = 1000): Promise<TranslationHistoryItem[]> {
    return this.getStorage(this.HISTORY_KEY).slice(0, limit);
  }

  public async clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
  }

  public async addCustomTranslation(
    word: string, 
    translation: string, 
    sourceLang: string, 
    targetLang: string, 
    sessionId: string
  ): Promise<boolean> {
    const saved = this.getStorage(this.SAVED_KEY);
    
    // Check duplicates
    const exists = saved.some(item => 
        item.original_text.toLowerCase() === word.toLowerCase() && 
        item.translated_text.toLowerCase() === translation.toLowerCase()
    );
    if (exists) return false;

    const newItem: TranslationHistoryItem = {
      id: Date.now() + Math.random(),
      original_text: word,
      translated_text: translation,
      source_language: sourceLang,
      target_language: targetLang,
      timestamp: Date.now(),
      session_id: sessionId
    };

    saved.unshift(newItem);
    this.setStorage(this.SAVED_KEY, saved);
    return true;
  }

  public async getCustomDictionary(): Promise<TranslationHistoryItem[]> {
    return this.getStorage(this.SAVED_KEY);
  }

  public async removeCustomTranslation(id: string | number) {
    let saved = this.getStorage(this.SAVED_KEY);
    saved = saved.filter(item => item.id !== id);
    this.setStorage(this.SAVED_KEY, saved);
  }

  private async updateStats(sourceLang: string, targetLang: string) {
      let stats = await this.getStatistics();
      stats.total++;
      if (sourceLang === 'na') stats.na_es++;
      else stats.es_na++;
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  public async getStatistics(): Promise<AppStats> {
    const stored = localStorage.getItem(this.STATS_KEY);
    if (stored) return JSON.parse(stored);
    
    // Recalculate if missing
    const history = this.getStorage(this.HISTORY_KEY);
    const sessions = this.getStorage(this.SESSIONS_KEY);
    
    return {
        total: history.length,
        na_es: history.filter(h => h.source_language === 'na').length,
        es_na: history.filter(h => h.source_language === 'es').length,
        sessions: sessions.length || 1
    };
  }

  public async saveSession(session: Session) {
     const sessions = this.getStorage(this.SESSIONS_KEY);
     sessions.push(session);
     this.setStorage(this.SESSIONS_KEY, sessions);
     
     // Update session stats
     let stats = await this.getStatistics();
     stats.sessions = sessions.length;
     localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }
}

class SessionManager {
  private currentSessionId: string | null = null;
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  public createSession(deviceInfo: string) {
    this.currentSessionId = crypto.randomUUID();
    const session: Session = {
      session_id: this.currentSessionId,
      start_time: Date.now(),
      device_info: deviceInfo,
      ip_address: '127.0.0.1' // Mock
    };
    this.db.saveSession(session);
  }

  public getCurrentSessionId() {
    return this.currentSessionId || undefined;
  }
}

export const dbManager = new DatabaseManager();
export const sessionManager = new SessionManager(dbManager);
