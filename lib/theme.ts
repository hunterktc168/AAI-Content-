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
  border: string;
  borderHover: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentBadge: string;
  accentRing: string;
  highlightBg: string;
  activeSegmentBg: string;
  activeSegmentText: string;
  activeSegmentShadow: string;
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
    border: 'border-[#1C2638]',
    borderHover: 'hover:border-[#2C3B55]',
    ink: 'text-[#F1F5F9]',
    inkMuted: 'text-[#94A3B8]',
    inkSubtle: 'text-[#64748B]',
    accent: 'bg-gradient-to-r from-[#00D2FF] to-[#0090FF]',
    accentHover: 'hover:from-[#00BCF0] hover:to-[#007EE0]',
    accentText: 'text-[#080B11] font-bold',
    accentBadge: 'bg-[#00D2FF]/15 text-[#00E5FF] border border-[#00D2FF]/30',
    accentRing: 'focus-visible:ring-[#00D2FF]',
    highlightBg: 'bg-[#00D2FF]/20 text-[#00E5FF]',
    activeSegmentBg: 'bg-[#00D2FF] text-[#080B11] font-semibold',
    activeSegmentText: 'text-[#080B11]',
    activeSegmentShadow: 'shadow-[0_2px_10px_rgba(0,210,255,0.3)]',
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
    border: 'border-[#E6DDCE]',
    borderHover: 'hover:border-[#C4B49E]',
    ink: 'text-[#1A1715]',
    inkMuted: 'text-[#6E645A]',
    inkSubtle: 'text-[#948A7D]',
    accent: 'bg-[#C2410C]',
    accentHover: 'hover:bg-[#9A3412]',
    accentText: 'text-white font-semibold',
    accentBadge: 'bg-[#C2410C]/10 text-[#C2410C] border border-[#C2410C]/25',
    accentRing: 'focus-visible:ring-[#C2410C]',
    highlightBg: 'bg-[#C2410C]/15 text-[#9A3412]',
    activeSegmentBg: 'bg-[#C2410C] text-white font-semibold',
    activeSegmentText: 'text-white',
    activeSegmentShadow: 'shadow-[0_2px_8px_rgba(194,65,12,0.25)]',
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
    border: 'border-[#182921]',
    borderHover: 'hover:border-[#274538]',
    ink: 'text-[#E2E8F0]',
    inkMuted: 'text-[#7A9387]',
    inkSubtle: 'text-[#4A6356]',
    accent: 'bg-gradient-to-r from-[#10B981] to-[#059669]',
    accentHover: 'hover:from-[#0EA574] hover:to-[#047857]',
    accentText: 'text-[#070A09] font-bold',
    accentBadge: 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30',
    accentRing: 'focus-visible:ring-[#10B981]',
    highlightBg: 'bg-[#10B981]/20 text-[#10B981]',
    activeSegmentBg: 'bg-[#10B981] text-[#070A09] font-semibold',
    activeSegmentText: 'text-[#070A09]',
    activeSegmentShadow: 'shadow-[0_2px_12px_rgba(16,185,129,0.35)]',
  },
};
