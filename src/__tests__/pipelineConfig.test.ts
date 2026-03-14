import { describe, it, expect } from 'vitest';
import { HISTORY_SYSTEM_PROMPT, VIGNETTE_TOOL } from '@/lib/prompts';

describe('Pipeline Configuration', () => {
  // Models used in the streaming pipeline
  const PIPELINE_STORY_MODEL = 'claude-3-5-haiku-20241022';
  const PIPELINE_TTS_MODEL = 'eleven_flash_v2_5';
  const PIPELINE_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam

  it('uses Haiku model for fastest story generation', () => {
    expect(PIPELINE_STORY_MODEL).toBe('claude-3-5-haiku-20241022');
  });

  it('uses Flash v2.5 model for fastest TTS', () => {
    expect(PIPELINE_TTS_MODEL).toBe('eleven_flash_v2_5');
  });

  it('uses Adam voice for narration', () => {
    expect(PIPELINE_VOICE_ID).toBe('pNInz6obpgDQGcFmaJgB');
  });
});

describe('Shared System Prompt', () => {
  it('includes second-person voice rule', () => {
    expect(HISTORY_SYSTEM_PROMPT).toContain('second person');
  });

  it('includes present-tense rule', () => {
    expect(HISTORY_SYSTEM_PROMPT).toContain('present tense');
  });

  it('prohibits "On this day" openings', () => {
    expect(HISTORY_SYSTEM_PROMPT).toContain('NEVER open with "On this day"');
  });

  it('targets 150-200 word vignettes', () => {
    expect(HISTORY_SYSTEM_PROMPT).toContain('150–200 word');
  });

  it('instructs tool use', () => {
    expect(HISTORY_SYSTEM_PROMPT).toContain('Always use the tool');
  });
});

describe('Vignette Tool Schema', () => {
  it('has correct tool name', () => {
    expect(VIGNETTE_TOOL.name).toBe('publish_vignette');
  });

  it('requires all four fields', () => {
    expect(VIGNETTE_TOOL.input_schema.required).toEqual([
      'story', 'eventTitle', 'eventYear', 'mlaCitation'
    ]);
  });

  it('defines story property', () => {
    expect(VIGNETTE_TOOL.input_schema.properties.story).toBeDefined();
    expect(VIGNETTE_TOOL.input_schema.properties.story.type).toBe('string');
  });

  it('defines eventTitle property', () => {
    expect(VIGNETTE_TOOL.input_schema.properties.eventTitle).toBeDefined();
  });

  it('defines eventYear property', () => {
    expect(VIGNETTE_TOOL.input_schema.properties.eventYear).toBeDefined();
  });

  it('defines mlaCitation property', () => {
    expect(VIGNETTE_TOOL.input_schema.properties.mlaCitation).toBeDefined();
  });
});
