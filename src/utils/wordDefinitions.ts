import { getStoreData, setStoreData } from './localStorageFuncs';

const CACHE_KEY = 'wordvibe_word_definitions';
const MAX_CACHE_ENTRIES = 200;
const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

export interface WordDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface CachedDefinitions {
  [word: string]: WordDefinition;
}

async function getCachedDefinitions(): Promise<CachedDefinitions> {
  try {
    const data = await getStoreData(CACHE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return {};
}

async function setCachedDefinition(word: string, definition: WordDefinition): Promise<void> {
  try {
    const cache = await getCachedDefinitions();

    // Evict oldest entries before adding to keep cache within limit
    const keys = Object.keys(cache);
    if (keys.length >= MAX_CACHE_ENTRIES) {
      const toRemove = keys.slice(0, keys.length - MAX_CACHE_ENTRIES + 1);
      for (const key of toRemove) {
        delete cache[key];
      }
    }

    cache[word] = definition;

    await setStoreData(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

export async function fetchWordDefinition(
  word: string,
  language: string
): Promise<WordDefinition | null> {
  // Only English definitions are supported via the free API
  if (language !== 'en') return null;

  // Check cache first
  const cache = await getCachedDefinitions();
  if (cache[word]) return cache[word];

  try {
    const response = await fetch(`${API_URL}${word.toLowerCase()}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    const meanings = entry.meanings;
    if (!meanings || meanings.length === 0) return null;

    const meaning = meanings[0];
    const def = meaning.definitions?.[0];
    if (!def) return null;

    const result: WordDefinition = {
      word: entry.word,
      phonetic: entry.phonetic || undefined,
      partOfSpeech: meaning.partOfSpeech || '',
      definition: def.definition || '',
      example: def.example || undefined,
    };

    // Cache the result
    await setCachedDefinition(word, result);
    return result;
  } catch {
    return null;
  }
}
