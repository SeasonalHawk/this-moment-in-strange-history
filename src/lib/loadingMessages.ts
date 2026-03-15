/**
 * Themed loading messages for each pipeline phase.
 *
 * Phase 1 (story generation): eerie investigation / archive theme
 * Phase 2 (audio narration): paranormal / strange discovery theme
 */

export const STORY_PHASE_MESSAGES = [
  'Searching the forbidden archives...',
  'Dusting off a classified file...',
  'Decoding a strange manuscript...',
  'Opening the vault of forgotten oddities...',
  'Something stirs in the historical record...',
];

export const AUDIO_PHASE_MESSAGES = [
  'The signal is coming through — brace yourself...',
  'Tuning into a frequency from the past...',
  'The recording device is picking something up...',
  'A voice from another time is emerging...',
  'The static is clearing — listen closely...',
  'Something wants to be heard...',
];

/** Pick a random element from a non-empty array. */
export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
