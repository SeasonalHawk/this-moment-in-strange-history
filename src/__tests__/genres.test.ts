import { describe, it, expect } from 'vitest';
import { GENRES, getRandomGenre } from '@/lib/genres';

describe('GENRES', () => {
  it('contains exactly 20 genres', () => {
    expect(GENRES).toHaveLength(20);
  });

  it('contains only non-empty strings', () => {
    for (const genre of GENRES) {
      expect(typeof genre).toBe('string');
      expect(genre.length).toBeGreaterThan(0);
    }
  });

  it('contains no duplicates', () => {
    const unique = new Set(GENRES);
    expect(unique.size).toBe(GENRES.length);
  });
});

describe('getRandomGenre', () => {
  it('returns a value from the GENRES list', () => {
    const genre = getRandomGenre();
    expect((GENRES as readonly string[]).includes(genre)).toBe(true);
  });

  it('returns different values over multiple calls', () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(getRandomGenre());
    }
    // With 20 genres and 50 calls, we should get at least 2 different results
    expect(results.size).toBeGreaterThan(1);
  });
});
