import { answersEN, answersTR } from '../words';

// Seeded random number generator (Mulberry32)
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Get a consistent date string in UTC to ensure same word globally
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert date string to a numeric seed
function dateToSeed(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get the daily word for a specific date
export function getDailyWord(dateString: string, language: 'en' | 'tr' = 'en'): string {
  const answers = language === 'en' ? answersEN : answersTR;
  const seed = dateToSeed(dateString + language); // Include language in seed for different words
  const rng = mulberry32(seed);
  const index = Math.floor(rng() * answers.length);
  return answers[index];
}

// Get today's daily word
export function getTodaysDailyWord(language: 'en' | 'tr' = 'en'): string {
  return getDailyWord(getTodayDateString(), language);
}

// Get a random word (for unlimited mode)
export function getRandomWord(language: 'en' | 'tr' = 'en'): string {
  const answers = language === 'en' ? answersEN : answersTR;
  return answers[Math.floor(Math.random() * answers.length)];
}

// Check if a saved game is for today's daily challenge
export function isGameForToday(savedDate: string): boolean {
  return savedDate === getTodayDateString();
}

// Calculate days since epoch for streak calculations
export function getDayNumber(): number {
  const now = new Date();
  const start = new Date(Date.UTC(2022, 0, 1)); // Jan 1, 2022 as epoch
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Get time until next daily word
export function getTimeUntilNextWord(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  ));
  const diff = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

// Format time until next word as string
export function formatTimeUntilNextWord(): string {
  const { hours, minutes, seconds } = getTimeUntilNextWord();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
