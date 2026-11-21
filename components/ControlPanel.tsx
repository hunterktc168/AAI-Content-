'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Cpu,
  FileText,
  GraduationCap,
  HeartHandshake,
  Layers,
  Loader2,
  Scale,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AUDIENCES, DEPTHS, TONES } from '@/lib/constants';
import { PRESETS_META } from '@/lib/presets.meta';
import type { Audience, Depth, PresetId, Tone } from '@/lib/types';
import type { ThemeConfig } from '@/lib/theme';
import CustomDropdown, { type DropdownOption } from './CustomDropdown';

const PRESET_ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  GraduationCap,
  Zap,
  FileText,
};

const TONE_META: Record<Tone, { label: string; icon: LucideIcon }> = {
  neutral: { label: 'Neutral', icon: Scale },
  warm: { label: 'Warm', icon: HeartHandshake },
  authoritative: { label: 'Authoritative', icon: Award },
  playful: { label: 'Playful', icon: Sparkles },
};

const AUDIENCE_OPTIONS: DropdownOption<Audience>[] = [
  {
    value: 'general',
    label: 'General Audience',
    tagline: 'Universal accessibility & direct clarity',
    icon: Users,
    themeGlow:
      'bg-cyan-500/15 border-cyan-600/30 text-cyan-800 dark:border-cyan-500/30 dark:text-cyan-400',
  },
  {
    value: 'executive',
    label: 'Executive Leadership',
    tagline: 'High-signal briefings & strategic takeaways',
    icon: Briefcase,
    themeGlow:
      'bg-amber-500/15 border-amber-600/30 text-amber-800 dark:border-amber-500/30 dark:text-amber-400',
  },
  {
    value: 'specialist',
    label: 'Technical Specialist',
    tagline: 'Domain rigour, exact terminology & data',
    icon: Cpu,
    themeGlow:
      'bg-purple-500/15 border-purple-600/30 text-purple-800 dark:border-purple-500/30 dark:text-purple-400',
  },
  {
    value: 'student',
    label: 'Student / Learner',
    tagline: 'Step-by-step scaffolding & clear analogies',
    icon: GraduationCap,
    themeGlow:
      'bg-emerald-500/15 border-emerald-600/30 text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-400',
  },
];

const DEPTH_META: Record<Depth, { label: string; hint: string; icon: LucideIcon }> = {
  quick: { label: 'Quick', hint: '≤40%', icon: Zap },
  standard: { label: 'Standard', hint: '80–120%', icon: Sliders },
  deep: { label: 'Deep', hint: '130–160%', icon: Layers },
};

export interface ControlPanelProps {
  presetId: PresetId;
  onPresetChange: (presetId: PresetId) => void;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
  depth: Depth;
  onDepthChange: (depth: Depth) => void;
  onTransform: () => void;
  isTransforming: boolean;
  isSourceEmpty: boolean;
  theme: ThemeConfig;
}

interface SelectorFieldsProps {
  idPrefix: string;
  presetId: PresetId;
  onPresetChange: (presetId: PresetId) => void;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
  depth: Depth;
  onDepthChange: (depth: Depth) => void;
  theme: ThemeConfig;
}

function SelectorFields({
  idPrefix,
  presetId,
  onPresetChange,
  tone,
  onToneChange,
  audience,
  onAudienceChange,
  depth,
  onDepthChange,
  theme,
}: SelectorFieldsProps) {
  const presetDropdownOptions: DropdownOption<PresetId>[] = PRESETS_META.map(
    (meta) => ({
      value: meta.id,
      label: meta.label,
      tagline: meta.tagline,
      description: meta.description,
      icon: PRESET_ICON_MAP[meta.icon] ?? Sparkles,
      themeGlow: meta.themeGlow,
    })
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Dynamic Style Preset Custom Dropdown */}
      <CustomDropdown<PresetId>
        id={`${idPrefix}-preset-dropdown`}
        label="Transformation Preset"
        options={presetDropdownOptions}
        value={presetId}
        onChange={onPresetChange}
        theme={theme}
      />

      {/* Target Audience Custom Dropdown */}
      <CustomDropdown<Audience>
        id={`${idPrefix}-audience-dropdown`}
        label="Target Audience"
        options={AUDIENCE_OPTIONS}
        value={audience}
        onChange={onAudienceChange}
        theme={theme}
      />

      {/* Tone Segmented Tray */}
      <div className="flex flex-col gap-1.5">
        <span
          id={`${idPrefix}-tone-label`}
          className={`text-xs font-semibold ${theme.inkMuted}`}
        >
          Tone Calibration
        </span>
        <div
          role="group"
          aria-labelledby={`${idPrefix}-tone-label`}
          className={`grid grid-cols-2 gap-1 rounded-xl p-1 border ${theme.tray} ${theme.border}`}
        >
          {TONES.map((item) => {
            const active = tone === item;
            const meta = TONE_META[item];
            const ToneIcon = meta.icon;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onToneChange(item)}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                  theme.accentRing
                } ${
                  active
                    ? `${theme.activeSegmentBg} ${theme.activeSegmentShadow}`
                    : `${theme.inkMuted} ${theme.inkHover} ${theme.surfaceHover}`
                }`}
              >
                <ToneIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Depth Segmented Tray */}
      <div className="flex flex-col gap-1.5">
        <span
          id={`${idPrefix}-depth-label`}
          className={`text-xs font-semibold ${theme.inkMuted}`}
        >
          Output Depth & Length
        </span>
        <div
          role="group"
          aria-labelledby={`${idPrefix}-depth-label`}
          className={`grid grid-cols-3 gap-1 rounded-xl p-1 border ${theme.tray} ${theme.border}`}
        >
          {DEPTHS.map((item) => {
            const active = depth === item;
            const meta = DEPTH_META[item];
            const DepthIcon = meta.icon;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onDepthChange(item)}
                className={`flex flex-col items-center justify-center rounded-lg px-1.5 py-1.5 text-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                  theme.accentRing
                } ${
                  active
                    ? `${theme.activeSegmentBg} ${theme.activeSegmentShadow}`
                    : `${theme.inkMuted} ${theme.inkHover} ${theme.surfaceHover}`
                }`}
              >
                <div className="flex items-center gap-1">
                  <DepthIcon className="h-3 w-3" aria-hidden="true" />
                  <span className="text-xs font-bold whitespace-nowrap">
                    {meta.label}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-[10px] opacity-80">
                  {meta.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Future-proofing slot for custom style profiles; intentionally disabled until user-defined style presets are supported */}
      <details
        aria-disabled="true"
        className={`border-t pt-3 text-xs ${theme.border} ${theme.inkSubtle}`}
      >
        <summary
          className={`cursor-pointer select-none font-medium ${theme.inkHover} focus-visible:outline-none focus-visible:ring-2 ${theme.accentRing} rounded`}
        >
          Custom Writing Style (Coming Soon)
        </summary>
        <div className="mt-2.5">
          <label
            htmlFor={`${idPrefix}-custom-style-select`}
            className="sr-only"
          >
            Custom Writing Style
          </label>
          <select
            id={`${idPrefix}-custom-style-select`}
            disabled
            aria-disabled="true"
            defaultValue=""
            className={`w-full rounded-lg border px-2.5 py-1.5 text-xs cursor-not-allowed ${
              theme.tray
            } ${theme.border} ${theme.inkSubtle}`}
          >
            <option value="">No custom profiles saved</option>
          </select>
        </div>
      </details>
    </div>
  );
}

export function DesktopControlPanel({
  presetId,
  onPresetChange,
  tone,
  onToneChange,
  audience,
  onAudienceChange,
  depth,
  onDepthChange,
  onTransform,
  isTransforming,
  isSourceEmpty,
  theme,
}: ControlPanelProps) {
  return (
    <aside
      aria-label="Transformation controls"
      className={`flex flex-col gap-5 rounded-2xl border p-5 ${theme.panel} ${theme.border}`}
    >
      <div className={`border-b pb-3.5 flex items-center justify-between ${theme.border}`}>
        <div className="flex items-center gap-2">
          <Sliders className={`h-4 w-4 ${theme.accentFg}`} aria-hidden="true" />
          <h2 className={`text-sm font-bold tracking-tight ${theme.ink}`}>
            Transformation Matrix
          </h2>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${theme.accentBadge}`}>
          Medium Think
        </span>
      </div>

      <SelectorFields
        idPrefix="desktop"
        presetId={presetId}
        onPresetChange={onPresetChange}
        tone={tone}
        onToneChange={onToneChange}
        audience={audience}
        onAudienceChange={onAudienceChange}
        depth={depth}
        onDepthChange={onDepthChange}
        theme={theme}
      />

      <div className="mt-auto pt-2 flex flex-col gap-2">
        <button
          type="button"
          disabled={isSourceEmpty || isTransforming}
          aria-busy={isTransforming}
          onClick={onTransform}
          className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-150 whitespace-nowrap shadow-md border focus-visible:outline-none focus-visible:ring-2 ${
            theme.accentRing
          } focus-visible:ring-offset-2 ${
            isSourceEmpty || isTransforming
              ? theme.disabledButton
              : `${theme.accent} ${theme.accentHover} ${theme.accentText} border-transparent cursor-pointer active:scale-[0.98]`
          }`}
        >
          {isTransforming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <span>Transform Content</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
        <p className={`text-center text-[11px] ${theme.inkSubtle}`}>
          Shortcut: <kbd className={`font-mono px-1.5 py-0.5 rounded ${theme.kbd}`}>⌘ / Ctrl + Enter</kbd>
        </p>
      </div>
    </aside>
  );
}

export function MobileControlBar({
  presetId,
  onPresetChange,
  tone,
  onToneChange,
  audience,
  onAudienceChange,
  depth,
  onDepthChange,
  onTransform,
  isTransforming,
  isSourceEmpty,
  theme,
}: ControlPanelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const settingsToggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isDrawerOpen) {
      wasOpenRef.current = true;
      const drawerEl = drawerRef.current;
      if (!drawerEl) return;

      const getFocusable = () =>
        Array.from(
          drawerEl.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"]):not([disabled])'
          )
        );

      const rafId = window.requestAnimationFrame(() => {
        const focusables = getFocusable();
        focusables[0]?.focus();
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (drawerEl.getClientRects().length === 0) return;

        if (event.key === 'Escape') {
          event.preventDefault();
          setIsDrawerOpen(false);
          return;
        }
        if (event.key !== 'Tab') return;

        const focusables = getFocusable();
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
          if (active === first || !drawerEl.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !drawerEl.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      };

      const desktopQuery = window.matchMedia('(min-width: 768px)');
      const handleViewportChange = (event: MediaQueryListEvent) => {
        if (event.matches) {
          setIsDrawerOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      desktopQuery.addEventListener('change', handleViewportChange);
      return () => {
        window.cancelAnimationFrame(rafId);
        document.removeEventListener('keydown', handleKeyDown);
        desktopQuery.removeEventListener('change', handleViewportChange);
      };
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      settingsToggleRef.current?.focus();
    }
  }, [isDrawerOpen]);

  return (
    <>
      {isDrawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            aria-hidden="true"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div
            id="mobile-settings-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Transformation settings"
            className={`relative z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t p-5 shadow-2xl ${
              theme.panel
            } ${theme.border}`}
          >
            <div className={`mb-4 flex items-center justify-between border-b pb-3 ${theme.border}`}>
              <div className="flex items-center gap-2">
                <Sliders className={`h-4 w-4 ${theme.accentFg}`} aria-hidden="true" />
                <h2 className={`text-base font-bold ${theme.ink}`}>
                  Transformation Matrix
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setIsDrawerOpen(false)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${
                  theme.tray
                } ${theme.border} ${theme.inkMuted} ${theme.inkHover} cursor-pointer`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <SelectorFields
              idPrefix="mobile"
              presetId={presetId}
              onPresetChange={onPresetChange}
              tone={tone}
              onToneChange={onToneChange}
              audience={audience}
              onAudienceChange={onAudienceChange}
              depth={depth}
              onDepthChange={onDepthChange}
              theme={theme}
            />

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className={`flex-1 rounded-xl border py-3 text-sm font-semibold cursor-pointer ${
                  theme.tray
                } ${theme.border} ${theme.ink}`}
              >
                Done
              </button>
              <button
                type="button"
                disabled={isSourceEmpty || isTransforming}
                onClick={() => {
                  setIsDrawerOpen(false);
                  onTransform();
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold shadow-lg ${
                  isSourceEmpty || isTransforming
                    ? theme.disabledButton
                    : `${theme.accent} ${theme.accentText} border-transparent cursor-pointer`
                }`}
              >
                <span>Transform Now</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sticky mobile action bar (<768px) */}
      <div
        className={`sticky bottom-0 z-30 md:hidden border-t px-4 py-2.5 backdrop-blur-md ${
          theme.header
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            ref={settingsToggleRef}
            type="button"
            aria-expanded={isDrawerOpen}
            aria-controls="mobile-settings-drawer"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              theme.tray
            } ${theme.border} ${theme.ink}`}
          >
            <SlidersHorizontal className={`h-4 w-4 ${theme.accentFg}`} aria-hidden="true" />
            <span>Options</span>
          </button>

          <button
            type="button"
            disabled={isSourceEmpty || isTransforming}
            aria-busy={isTransforming}
            onClick={onTransform}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold shadow-md whitespace-nowrap ${
              isSourceEmpty || isTransforming
                ? theme.disabledButton
                : `${theme.accent} ${theme.accentText} border-transparent cursor-pointer`
            }`}
          >
            {isTransforming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span>Transform</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
