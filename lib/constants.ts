export const MAX_INPUT_CHARS = 40000;
export const FACTUAL_FIDELITY_CLAUSE =
  'Maintain strict factual fidelity to the source text. Never extrapolate, invent, or hallucinate facts, dates, names, or statistics not explicitly present in the source text.';
export const TONES = ['neutral', 'warm', 'authoritative', 'playful'] as const;
export const AUDIENCES = ['general', 'executive', 'specialist', 'student'] as const;
export const DEPTHS = ['quick', 'standard', 'deep'] as const;
export const PRESET_IDS = ['clarity', 'phd_authority', 'gonzo', 'executive'] as const;
export const DEFAULT_SELECTIONS = {
  presetId: 'clarity',
  tone: 'neutral',
  audience: 'general',
  depth: 'standard',
} as const;
