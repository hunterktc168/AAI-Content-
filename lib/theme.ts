export type ThemeMode = 'obsidian' | 'editorial' | 'cyber';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  tagline: string;
  iconName: string;
  isDark: boolean;
  shell: string;
  header: string;
  panel: string;
  panelHeader: string;
  tray: string;
  subtleSurface: string;
  border: string;
  borderHover: string;
  ink: string;
  inkHover: string;
  inkMuted: string;
  inkSubtle: string;
  surfaceHover: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentFg: string;
  accentBadge: string;
  accentRing: string;
  openBorderRing: string;
  highlightBg: string;
  activeSegmentBg: string;
  activeSegmentText: string;
  activeSegmentShadow: string;
  disabledButton: string;
  errorSurface: string;
  errorTitle: string;
  warningSurface: string;
  kbd: string;
  dropzoneIdle: string;
  dropzoneActive: string;
  progressBarTrack: string;
  progressBarFill: string;
  linkedCard: string;
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Studio',
    tagline: 'Dark Engineering Console',
    iconName: 'Moon',
    isDark: true,
    shell: 'bg-[#080B11] text-[#F1F5F9]',
    header: 'bg-[#0B0F18]/95 border-[#1A2333] text-[#F1F5F9]',
    panel: 'bg-[#0E1420] border-[#1C2638] shadow-[0_8px_30px_rgba(0,0,0,0.45)]',
    panelHeader: 'bg-[#111927] border-[#1C2638]',
    tray: 'bg-[#141C2B] border-[#222E42]',
    subtleSurface: 'bg-[#0B101A] border-[#1E293B]',
    border: 'border-[#1C2638]',
    borderHover: 'hover:border-[#2C3B55]',
    ink: 'text-[#F1F5F9]',
    inkHover: 'hover:text-[#F1F5F9]',
    inkMuted: 'text-[#94A3B8]',
    inkSubtle: 'text-[#64748B]',
    surfaceHover: 'hover:bg-white/5',
    accent: 'bg-gradient-to-r from-[#00D2FF] to-[#0090FF]',
    accentHover: 'hover:from-[#00BCF0] hover:to-[#007EE0]',
    accentText: 'text-[#080B11] font-bold',
    accentFg: 'text-cyan-400',
    accentBadge: 'bg-[#00D2FF]/15 text-[#00E5FF] border border-[#00D2FF]/30',
    accentRing: 'focus-visible:ring-[#00D2FF]',
    openBorderRing: 'ring-2 ring-[#00D2FF]/40 border-[#00D2FF]/60',
    highlightBg: 'bg-[#00D2FF]/20 text-[#00E5FF]',
    activeSegmentBg: 'bg-[#00D2FF] text-[#080B11] font-semibold',
    activeSegmentText: 'text-[#080B11]',
    activeSegmentShadow: 'shadow-[0_2px_10px_rgba(0,210,255,0.3)]',
    disabledButton: 'border-white/5 bg-white/5 text-zinc-500 cursor-not-allowed',
    errorSurface: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    errorTitle: 'text-rose-200',
    warningSurface: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    kbd: 'bg-white/10 border border-white/15 text-white',
    dropzoneIdle: 'border-white/15 bg-black/20 hover:border-cyan-400/50 hover:bg-black/30',
    dropzoneActive: 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,210,255,0.2)]',
    progressBarTrack: 'bg-white/10',
    progressBarFill: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.6)]',
    linkedCard: 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,210,255,0.15)] ring-1 ring-cyan-400',
  },
  editorial: {
    id: 'editorial',
    name: 'Monograph Paper',
    tagline: 'Warm Literary Monograph',
    iconName: 'BookOpen',
    isDark: false,
    shell: 'bg-[#FAF6EF] text-[#1A1715]',
    header: 'bg-[#FFFDF9]/95 border-[#E6DDCE] text-[#1A1715]',
    panel: 'bg-[#FFFDF9] border-[#E6DDCE] shadow-[0_4px_24px_rgba(30,24,18,0.06)]',
    panelHeader: 'bg-[#F5EFE3] border-[#E6DDCE]',
    tray: 'bg-[#EFE7D8] border-[#DECFC0]',
    subtleSurface: 'bg-[#FAF6EF] border-[#E6DDCE]',
    border: 'border-[#E6DDCE]',
    borderHover: 'hover:border-[#B8A58D]',
    ink: 'text-[#1A1715]',
    inkHover: 'hover:text-[#1A1715]',
    inkMuted: 'text-[#5C5349]',
    inkSubtle: 'text-[#7A7065]',
    surfaceHover: 'hover:bg-black/5',
    accent: 'bg-[#C2410C]',
    accentHover: 'hover:bg-[#9A3412]',
    accentText: 'text-white font-semibold',
    accentFg: 'text-[#C2410C]',
    accentBadge: 'bg-[#C2410C]/10 text-[#9A3412] border border-[#C2410C]/25',
    accentRing: 'focus-visible:ring-[#C2410C]',
    openBorderRing: 'ring-2 ring-[#C2410C]/30 border-[#C2410C]/60',
    highlightBg: 'bg-[#C2410C]/15 text-[#9A3412]',
    activeSegmentBg: 'bg-[#C2410C] text-white font-semibold',
    activeSegmentText: 'text-white',
    activeSegmentShadow: 'shadow-[0_2px_8px_rgba(194,65,12,0.25)]',
    disabledButton: 'border-[#DECFC0] bg-[#EFE7D8]/70 text-[#8D8276] cursor-not-allowed',
    errorSurface: 'border-rose-300 bg-rose-50 text-rose-900',
    errorTitle: 'text-rose-950',
    warningSurface: 'border-amber-300 bg-amber-50 text-amber-900',
    kbd: 'bg-[#EFE7D8] border border-[#D4C5B3] text-[#1A1715]',
    dropzoneIdle: 'border-[#C9B9A5] bg-[#FAF6EF] hover:border-[#C2410C]/60 hover:bg-[#F5EFE3]',
    dropzoneActive: 'border-[#C2410C] bg-[#C2410C]/10 shadow-[0_0_16px_rgba(194,65,12,0.15)]',
    progressBarTrack: 'bg-[#DECFC0]',
    progressBarFill: 'bg-[#C2410C] shadow-[0_0_8px_rgba(194,65,12,0.35)]',
    linkedCard: 'border-[#C2410C] bg-[#C2410C]/10 shadow-[0_0_12px_rgba(194,65,12,0.12)] ring-1 ring-[#C2410C]',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Matrix',
    tagline: 'Phosphor Matrix Terminal',
    iconName: 'Terminal',
    isDark: true,
    shell: 'bg-[#070A09] text-[#E2E8F0]',
    header: 'bg-[#0A0F0D]/95 border-[#15231C] text-[#E2E8F0]',
    panel: 'bg-[#0D1411] border-[#182921] shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
    panelHeader: 'bg-[#101915] border-[#182921]',
    tray: 'bg-[#14211C] border-[#1F332A]',
    subtleSurface: 'bg-[#0A110E] border-[#1B2E25]',
    border: 'border-[#182921]',
    borderHover: 'hover:border-[#274538]',
    ink: 'text-[#E2E8F0]',
    inkHover: 'hover:text-[#E2E8F0]',
    inkMuted: 'text-[#89A598]',
    inkSubtle: 'text-[#5F7B6D]',
    surfaceHover: 'hover:bg-emerald-500/10',
    accent: 'bg-gradient-to-r from-[#10B981] to-[#059669]',
    accentHover: 'hover:from-[#0EA574] hover:to-[#047857]',
    accentText: 'text-[#070A09] font-bold',
    accentFg: 'text-emerald-400',
    accentBadge: 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30',
    accentRing: 'focus-visible:ring-[#10B981]',
    openBorderRing: 'ring-2 ring-[#10B981]/40 border-[#10B981]/60',
    highlightBg: 'bg-[#10B981]/20 text-[#10B981]',
    activeSegmentBg: 'bg-[#10B981] text-[#070A09] font-semibold',
    activeSegmentText: 'text-[#070A09]',
    activeSegmentShadow: 'shadow-[0_2px_12px_rgba(16,185,129,0.35)]',
    disabledButton: 'border-emerald-950/60 bg-emerald-950/30 text-emerald-700/80 cursor-not-allowed',
    errorSurface: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    errorTitle: 'text-rose-200',
    warningSurface: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    kbd: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300',
    dropzoneIdle: 'border-[#274538] bg-[#0A110E] hover:border-emerald-400/60 hover:bg-[#0F1A15]',
    dropzoneActive: 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    progressBarTrack: 'bg-emerald-950/60',
    progressBarFill: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    linkedCard: 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400',
  },
};
