import { describe, it, expect } from 'vitest';
import { validateRequest, monthName, buildUserMessage } from '@/lib/validation';

describe('validateRequest', () => {
  it('accepts valid input without genre', () => {
    const result = validateRequest({ month: 3, day: 13 });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toEqual({ month: 3, day: 13, genre: null });
    }
  });

  it('accepts valid input with genre', () => {
    const result = validateRequest({ month: 3, day: 13, genre: 'True Crime' });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toEqual({ month: 3, day: 13, genre: 'True Crime' });
    }
  });

  it('rejects invalid genre', () => {
    const result = validateRequest({ month: 3, day: 13, genre: 'Not A Real Genre' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Invalid genre');
    }
  });

  it('rejects null body', () => {
    const result = validateRequest(null);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Request body is required');
    }
  });

  it('rejects missing month', () => {
    const result = validateRequest({ day: 1 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('month is required');
    }
  });

  it('rejects missing day', () => {
    const result = validateRequest({ month: 1 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('day is required');
    }
  });

  it('rejects month out of range (0)', () => {
    const result = validateRequest({ month: 0, day: 1 });
    expect(result.valid).toBe(false);
  });

  it('rejects month out of range (13)', () => {
    const result = validateRequest({ month: 13, day: 1 });
    expect(result.valid).toBe(false);
  });

  it('rejects day out of range (0)', () => {
    const result = validateRequest({ month: 1, day: 0 });
    expect(result.valid).toBe(false);
  });

  it('rejects day out of range (32)', () => {
    const result = validateRequest({ month: 1, day: 32 });
    expect(result.valid).toBe(false);
  });

  it('rejects non-integer month', () => {
    const result = validateRequest({ month: 1.5, day: 1 });
    expect(result.valid).toBe(false);
  });

  it('accepts string numbers (coercion)', () => {
    const result = validateRequest({ month: '6', day: '15' });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toEqual({ month: 6, day: 15, genre: null });
    }
  });

  it('accepts boundary values', () => {
    expect(validateRequest({ month: 1, day: 1 }).valid).toBe(true);
    expect(validateRequest({ month: 12, day: 31 }).valid).toBe(true);
  });
});

describe('monthName', () => {
  it('returns correct month names', () => {
    expect(monthName(1)).toBe('January');
    expect(monthName(6)).toBe('June');
    expect(monthName(12)).toBe('December');
  });

  it('falls back to January for invalid input', () => {
    expect(monthName(0)).toBe('January');
    expect(monthName(13)).toBe('January');
  });
});

describe('buildUserMessage', () => {
  it('builds base message without genre', () => {
    const msg = buildUserMessage(7, 4);
    expect(msg).toContain('July 4');
    expect(msg).not.toContain('GENRE LENS');
  });

  it('includes genre instruction when genre provided', () => {
    const msg = buildUserMessage(7, 4, 'True Crime');
    expect(msg).toContain('July 4');
    expect(msg).toContain('GENRE LENS');
    expect(msg).toContain('True Crime');
  });

  it('includes storytelling guidance in genre instruction', () => {
    const msg = buildUserMessage(3, 14, 'Espionage & Spies');
    expect(msg).toContain('tone, pacing, and atmosphere');
    expect(msg).toContain('sensory details');
    expect(msg).toContain('historically accurate');
  });
});
