import type { PresetMeta } from './types';

export const PRESETS_META: PresetMeta[] = [
  {
    id: 'clarity',
    label: 'Crystal Clarity',
    tagline: 'High Precision & Directness',
    description:
      'Streamlines syntax, eliminates redundancy, and sharpens structure without losing nuance.',
    icon: 'Sparkles',
    badgeColor: 'cyan',
    themeGlow: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
  },
  {
    id: 'phd_authority',
    label: 'Academic Rigor',
    tagline: 'Scholarly Publication Register',
    description:
      'Elevates prose to scholarly precision with disciplined transitions and formal register.',
    icon: 'GraduationCap',
    badgeColor: 'purple',
    themeGlow: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400',
  },
  {
    id: 'gonzo',
    label: 'Vivid Narrative',
    tagline: 'Kinetic & Electric Cadence',
    description:
      'Injects kinetic pacing and arresting imagery while keeping every stated fact intact.',
    icon: 'Zap',
    badgeColor: 'amber',
    themeGlow: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
  },
  {
    id: 'executive',
    label: 'Executive Brief',
    tagline: 'Decision-Grade Synthesis',
    description:
      'Distills key decisions, evidence, and takeaways into scannable, high-signal prose.',
    icon: 'FileText',
    badgeColor: 'emerald',
    themeGlow: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
  },
];
