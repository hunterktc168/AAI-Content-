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
    themeGlow:
      'bg-cyan-500/15 border-cyan-600/30 text-cyan-800 dark:border-cyan-500/40 dark:text-cyan-400',
  },
  {
    id: 'phd_authority',
    label: 'Academic Rigor',
    tagline: 'Scholarly Publication Register',
    description:
      'Elevates prose to scholarly precision with disciplined transitions and formal register.',
    icon: 'GraduationCap',
    badgeColor: 'purple',
    themeGlow:
      'bg-purple-500/15 border-purple-600/30 text-purple-800 dark:border-purple-500/40 dark:text-purple-400',
  },
  {
    id: 'gonzo',
    label: 'Vivid Narrative',
    tagline: 'Kinetic & Electric Cadence',
    description:
      'Injects kinetic pacing and arresting imagery while keeping every stated fact intact.',
    icon: 'Zap',
    badgeColor: 'amber',
    themeGlow:
      'bg-amber-500/15 border-amber-600/30 text-amber-800 dark:border-amber-500/40 dark:text-amber-400',
  },
  {
    id: 'executive',
    label: 'Executive Brief',
    tagline: 'Decision-Grade Synthesis',
    description:
      'Distills key decisions, evidence, and takeaways into scannable, high-signal prose.',
    icon: 'FileText',
    badgeColor: 'emerald',
    themeGlow:
      'bg-emerald-500/15 border-emerald-600/30 text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-400',
  },
];
