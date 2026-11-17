import { PRESET_IDS, TONES, AUDIENCES, DEPTHS } from './constants';

export type PresetId = (typeof PRESET_IDS)[number];
export type Tone = (typeof TONES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type Depth = (typeof DEPTHS)[number];

export interface TransformRequest {
  sourceText: string;
  presetId: PresetId;
  tone: Tone;
  audience: Audience;
  depth: Depth;
}

export interface ChangeItem {
  type: 'add' | 'remove' | 'rewrite';
  excerpt: string;
  rationale: string;
}

export interface TransformResponse {
  ok: true;
  transformedText: string;
  changeLog: ChangeItem[];
}

export interface TransformError {
  ok: false;
  code: 'validation' | 'too_large' | 'upstream' | 'unknown';
  error: string;
}

export type TransformResult = TransformResponse | TransformError;

export interface PresetMeta {
  id: PresetId;
  label: string;
  description: string;
  icon: string; // lucide-react icon name, e.g. 'Sparkles'
}
