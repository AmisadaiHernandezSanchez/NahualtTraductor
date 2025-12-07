
export type TranslationDirection = 'auto' | 'na-es' | 'es-na';

export interface TranslationHistoryItem {
  id: string | number;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  timestamp: number | string;
  session_id?: string;
  confidence_score?: number; // Added confidence score
}

export interface AppStats {
  total: number;
  na_es: number;
  es_na: number;
  sessions: number;
}

export interface TranslationResponse {
  original_text: string;
  translated_text: string;
  detected_language: string;
  confidence: number; // 0.0 to 1.0
  match_type: 'exact' | 'root' | 'fuzzy' | 'none';
}

export interface WordDetail {
  word: string;
  meaning: string;
  partOfSpeech: string;
  etymology?: string;
  example?: string;
  synonyms?: string[]; // New: List of synonyms
  related?: string[];  // New: Related concepts
}

export interface Session {
  session_id: string;
  start_time: number;
  end_time?: number;
  device_info: string;
  ip_address: string;
}