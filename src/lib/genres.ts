export const GENRES = [
  'True Crime',
  'Conspiracy & Mystery',
  'War & Military',
  'Science & Discovery',
  'Love & Romance',
  'Betrayal & Revenge',
  'Survival & Exploration',
  'Rise & Fall of Empires',
  'Innovation & Invention',
  'Art & Culture',
  'Sports & Competition',
  'Espionage & Spies',
  'Natural Disasters',
  'Revolution & Rebellion',
  'Medicine & Plague',
  'Money & Economics',
  'Religion & Faith',
  'Women Who Changed History',
  'Unsolved Mysteries',
  'Food & Cuisine',
] as const;

export type Genre = (typeof GENRES)[number];

export function getRandomGenre(): Genre {
  return GENRES[Math.floor(Math.random() * GENRES.length)];
}
