'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FileText,
  GraduationCap,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AUDIENCES, DEPTHS, TONES } from '@/lib/constants';
import { PRESETS_META } from '@/lib/presets.meta';
import type { Audience, Depth, PresetId, Tone } from '@/lib/types';

const PRESET_ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  GraduationCap,
  Zap,
  FileText,
};

const TONE_LABELS: Record<Tone, string> = {
  neutral: 'Neutral',
  warm: 'Warm',
  authoritative: 'Authoritative',
  playful: 'Playful',
};

const AUDIENCE_LABELS: Record<Audience, string> = {
  general: 'General',
  executive: 'Executive',
  specialist: 'Specialist',
  student: 'Student',
};

const DEPTH_META: Record<Depth, { label: string; hint: string }> = {
  quick: { label: 'Quick', hint: '≤40%' },
  standard: { label: 'Standard', hint: '80–120%' },
  deep: { label: 'Deep', hint: '130–160%' },
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
}: SelectorFieldsProps) {
  const activePreset =
    PRESETS_META.find((preset) => preset.id === presetId) ?? PRESETS_META[0];
  const ActivePresetIcon = PRESET_ICON_MAP[activePreset.icon] ?? Sparkles;

  return (
    <div className="flex flex-col gap-4">
      {/* Preset Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}-preset-select`}
          className="text-xs font-semibold text-zinc-700"
        >
          Style Preset
        </label>
        <div className="relative">
          <select
            id={`${idPrefix}-preset-select`}
            value={presetId}
            onChange={(e) => onPresetChange(e.target.value as PresetId)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer"
          >
            {PRESETS_META.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-start gap-2 pt-1 text-xs text-zinc-500 leading-snug">
          <ActivePresetIcon
            className="h-3.5 w-3.5 shrink-0 text-blue-700 mt-0.5"
            aria-hidden="true"
          />
          <span>{activePreset.description}</span>
        </div>
      </div>

      {/* Tone Selector */}
      <div className="flex flex-col gap-1.5">
        <span
          id={`${idPrefix}-tone-label`}
          className="text-xs font-semibold text-zinc-700"
        >
          Tone
        </span>
        <div
          role="group"
          aria-labelledby={`${idPrefix}-tone-label`}
          className="grid grid-cols-2 gap-1.5"
        >
          {TONES.map((item) => {
            const active = tone === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onToneChange(item)}
                className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors duration-150 whitespace-nowrap truncate cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  active
                    ? 'border-blue-700 bg-blue-50 text-blue-900'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {TONE_LABELS[item]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Audience Selector */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}-audience-select`}
          className="text-xs font-semibold text-zinc-700"
        >
          Target Audience
        </label>
        <select
          id={`${idPrefix}-audience-select`}
          value={audience}
          onChange={(e) => onAudienceChange(e.target.value as Audience)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer"
        >
          {AUDIENCES.map((item) => (
            <option key={item} value={item}>
              {AUDIENCE_LABELS[item]}
            </option>
          ))}
        </select>
      </div>

      {/* Depth Selector */}
      <div className="flex flex-col gap-1.5">
        <span
          id={`${idPrefix}-depth-label`}
          className="text-xs font-semibold text-zinc-700"
        >
          Depth
        </span>
        <div
          role="group"
          aria-labelledby={`${idPrefix}-depth-label`}
          className="grid grid-cols-3 gap-1.5"
        >
          {DEPTHS.map((item) => {
            const active = depth === item;
            const meta = DEPTH_META[item];
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onDepthChange(item)}
                className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2 text-center transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  active
                    ? 'border-blue-700 bg-blue-50 text-blue-900'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <span className="text-xs font-medium whitespace-nowrap">
                  {meta.label}
                </span>
                <span className="font-mono tabular-nums text-[10px] text-zinc-500">
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
        className="rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2 text-xs text-zinc-500"
      >
        <summary className="cursor-pointer select-none font-medium text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded">
          Custom Writing Style (Coming Soon)
        </summary>
        <div className="mt-2.5 pt-2 border-t border-zinc-200">
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
            className="w-full rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-1.5 text-xs text-zinc-400 cursor-not-allowed"
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
}: ControlPanelProps) {
  return (
    <aside
      aria-label="Transformation controls"
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div className="border-b border-zinc-200 pb-3">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
          Transform Controls
        </h2>
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
      />

      <div className="mt-1 flex flex-col gap-1.5">
        <button
          type="button"
          disabled={isSourceEmpty || isTransforming}
          aria-busy={isTransforming}
          onClick={onTransform}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${
            isSourceEmpty || isTransforming
              ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
              : 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer'
          }`}
        >
          {isTransforming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Transforming...</span>
            </>
          ) : (
            <span>Transform</span>
          )}
        </button>
        <p className="text-center text-[11px] text-zinc-500">
          Shortcut: <kbd className="font-mono">⌘</kbd> / <kbd className="font-mono">Ctrl</kbd> + <kbd className="font-mono">Enter</kbd>
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
            className="fixed inset-0 bg-zinc-900/40"
            aria-hidden="true"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div
            id="mobile-settings-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Transformation settings"
            className="relative z-50 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-zinc-200 bg-white px-4 pt-4 pb-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-sm font-semibold text-zinc-900">
                Transform Settings
              </h2>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer"
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
            />

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer"
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
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  isSourceEmpty || isTransforming
                    ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                    : 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer'
                }`}
              >
                <span>Transform</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sticky mobile action bar (<768px) */}
      <div className="sticky bottom-0 z-30 md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <button
            ref={settingsToggleRef}
            type="button"
            aria-expanded={isDrawerOpen}
            aria-controls="mobile-settings-drawer"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            disabled={isSourceEmpty || isTransforming}
            aria-busy={isTransforming}
            onClick={onTransform}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              isSourceEmpty || isTransforming
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                : 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer'
            }`}
          >
            {isTransforming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Transforming...</span>
              </>
            ) : (
              <span>Transform</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
