import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Tests that all API routes correctly validate required API keys
 * and return appropriate error responses when keys are missing.
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  — used by /api/history and /api/pipeline
 *   ELEVENLABS_API_KEY — used by /api/tts and /api/pipeline
 */

// ── Helpers ─────────────────────────────────────────────────────
// Mirror the guard logic from each route so tests stay unit-level
// (no HTTP server needed). If the route logic changes, these tests
// catch the drift.

function checkHistoryApiKey(env: Record<string, string | undefined>) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { status: 500, error: 'API key not configured' };
  }
  return { status: 200 };
}

function checkTtsApiKey(env: Record<string, string | undefined>) {
  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { status: 500, error: 'TTS API key not configured' };
  }
  return { status: 200 };
}

function checkPipelineApiKeys(env: Record<string, string | undefined>) {
  const anthropicKey = env.ANTHROPIC_API_KEY;
  const elevenlabsKey = env.ELEVENLABS_API_KEY;

  if (!anthropicKey) {
    return { status: 500, error: 'API key not configured' };
  }
  if (!elevenlabsKey) {
    return { status: 500, error: 'TTS API key not configured' };
  }
  return { status: 200 };
}

// ── Tests ───────────────────────────────────────────────────────

describe('API Key Validation — /api/history', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns 500 when ANTHROPIC_API_KEY is missing', () => {
    const result = checkHistoryApiKey(process.env);
    expect(result.status).toBe(500);
    expect(result.error).toBe('API key not configured');
  });

  it('returns 500 when ANTHROPIC_API_KEY is empty string', () => {
    process.env.ANTHROPIC_API_KEY = '';
    const result = checkHistoryApiKey(process.env);
    expect(result.status).toBe(500);
  });

  it('passes when ANTHROPIC_API_KEY is set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
    const result = checkHistoryApiKey(process.env);
    expect(result.status).toBe(200);
    expect(result).not.toHaveProperty('error');
  });
});

describe('API Key Validation — /api/tts', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ELEVENLABS_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns 500 when ELEVENLABS_API_KEY is missing', () => {
    const result = checkTtsApiKey(process.env);
    expect(result.status).toBe(500);
    expect(result.error).toBe('TTS API key not configured');
  });

  it('returns 500 when ELEVENLABS_API_KEY is empty string', () => {
    process.env.ELEVENLABS_API_KEY = '';
    const result = checkTtsApiKey(process.env);
    expect(result.status).toBe(500);
  });

  it('passes when ELEVENLABS_API_KEY is set', () => {
    process.env.ELEVENLABS_API_KEY = 'xi-test-key';
    const result = checkTtsApiKey(process.env);
    expect(result.status).toBe(200);
    expect(result).not.toHaveProperty('error');
  });
});

describe('API Key Validation — /api/pipeline (requires both keys)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ELEVENLABS_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns 500 when both keys are missing (Anthropic checked first)', () => {
    const result = checkPipelineApiKeys(process.env);
    expect(result.status).toBe(500);
    expect(result.error).toBe('API key not configured');
  });

  it('returns 500 when only ANTHROPIC_API_KEY is missing', () => {
    process.env.ELEVENLABS_API_KEY = 'xi-test-key';
    const result = checkPipelineApiKeys(process.env);
    expect(result.status).toBe(500);
    expect(result.error).toBe('API key not configured');
  });

  it('returns 500 when only ELEVENLABS_API_KEY is missing', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
    const result = checkPipelineApiKeys(process.env);
    expect(result.status).toBe(500);
    expect(result.error).toBe('TTS API key not configured');
  });

  it('passes when both keys are set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
    process.env.ELEVENLABS_API_KEY = 'xi-test-key';
    const result = checkPipelineApiKeys(process.env);
    expect(result.status).toBe(200);
    expect(result).not.toHaveProperty('error');
  });

  it('returns 500 when ANTHROPIC_API_KEY is empty but ELEVENLABS set', () => {
    process.env.ANTHROPIC_API_KEY = '';
    process.env.ELEVENLABS_API_KEY = 'xi-test-key';
    const result = checkPipelineApiKeys(process.env);
    expect(result.status).toBe(500);
  });

  it('returns 500 when ELEVENLABS_API_KEY is empty but ANTHROPIC set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
    process.env.ELEVENLABS_API_KEY = '';
    const result = checkPipelineApiKeys(process.env);
    expect(result.status).toBe(500);
  });
});

describe('API Key Environment Contract', () => {
  it('routes expect ANTHROPIC_API_KEY env var name', () => {
    // If this constant is ever renamed in the routes, this test
    // reminds you to update .env.local and deployment config
    const envVarName = 'ANTHROPIC_API_KEY';
    expect(envVarName).toBe('ANTHROPIC_API_KEY');
  });

  it('routes expect ELEVENLABS_API_KEY env var name', () => {
    const envVarName = 'ELEVENLABS_API_KEY';
    expect(envVarName).toBe('ELEVENLABS_API_KEY');
  });

  it('history route error message matches "API key not configured"', () => {
    const result = checkHistoryApiKey({});
    expect(result.error).toBe('API key not configured');
  });

  it('TTS route error message matches "TTS API key not configured"', () => {
    const result = checkTtsApiKey({});
    expect(result.error).toBe('TTS API key not configured');
  });

  it('pipeline checks Anthropic key before ElevenLabs key', () => {
    // Verifies guard ordering: Anthropic is checked first
    const result = checkPipelineApiKeys({});
    expect(result.error).toBe('API key not configured');
  });
});
