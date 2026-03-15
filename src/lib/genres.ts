export const GENRES = [
  'Unexplained Disappearances',
  'Mass Hysteria & Panic',
  'Cursed Objects & Places',
  'Bizarre Deaths',
  'Cryptids & Creature Sightings',
  'Paranormal Investigations',
  'Medical Oddities',
  'Strange Weather & Natural Anomalies',
  'Eerie Coincidences',
  'Forgotten Experiments',
  'Bizarre Laws & Trials',
  'Haunted History',
  'Strange Crimes',
  'Mysterious Signals & Messages',
  'Doomsday Predictions & Cults',
  'Time Slips & Glitches',
  'Odd Traditions & Rituals',
  'Weird Science',
  'Lost Civilizations & Ruins',
  'Unsolved Mysteries',
] as const;

export type Genre = (typeof GENRES)[number];

export function getRandomGenre(): Genre {
  return GENRES[Math.floor(Math.random() * GENRES.length)];
}
