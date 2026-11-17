'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Moon, RotateCcw, Terminal } from 'lucide-react';
import { DEFAULT_SELECTIONS } from '@/lib/constants';
import { THEMES, type ThemeConfig, type ThemeMode } from '@/lib/theme';
import type {
  Audience,
  Depth,
  PresetId,
  Tone,
  TransformResult,
} from '@/lib/types';
import {
  DesktopControlPanel,
  MobileControlBar,
} from '@/components/ControlPanel';
import IngestionPane from '@/components/IngestionPane';
import OutputPane from '@/components/OutputPane';
import AnalyticsHUD from '@/components/AnalyticsHUD';
import ToastBanner, {
  type ToastData,
  type ToastVariant,
} from '@/components/ToastBanner';

const SAMPLE_TEXT = `Quarterly Operations Review — Q3 Summary

During the third quarter, the regional logistics network processed 142,800 shipments across 14 distribution hubs, up 11.4% compared to the same period last year. Average transit time decreased from 3.4 days to 2.9 days after automated route batching was deployed at the Chicago and Dallas facilities on August 12.

However, cold-chain compliance incidents rose slightly from 0.4% to 0.7% in September due to two refrigeration sensor calibration failures in transit corridors serving Phoenix. Maintenance teams replaced the affected telemetry units on September 19, and no further temperature excursions were recorded through the end of the quarter.`;

export default function HomePage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('obsidian');
  const themeConfig: ThemeConfig = THEMES[currentTheme];

  const [sourceText, setSourceText] = useState<string>('');
  const [comparedSourceText, setComparedSourceText] = useState<string>('');
  const [presetId, setPresetId] = useState<PresetId>(DEFAULT_SELECTIONS.presetId);
  const [tone, setTone] = useState<Tone>(DEFAULT_SELECTIONS.tone);
  const [audience, setAudience] = useState<Audience>(DEFAULT_SELECTIONS.audience);
  const [depth, setDepth] = useState<Depth>(DEFAULT_SELECTIONS.depth);
  const [transformResult, setTransformResult] = useState<TransformResult | null>(
    null
  );
  const [isTransforming, setIsTransforming] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const [workspaceSessionKey, setWorkspaceSessionKey] = useState(0);
  const [resultKey, setResultKey] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const toastIdRef = useRef(0);

  // Sync document .dark class with active theme
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (themeConfig.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeConfig.isDark]);

  const showToast = useCallback(
    (variant: ToastVariant, message: string, duration?: number) => {
      toastIdRef.current += 1;
      setToast({ id: toastIdRef.current, variant, message, duration });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setIsTransforming(false);
    };
  }, []);

  const handleLoadSample = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTransforming(false);
    setSourceText(SAMPLE_TEXT);
    setComparedSourceText('');
    setTransformResult(null);
    setWorkspaceSessionKey((prev) => prev + 1);
  };

  const handleResetWorkspace = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTransforming(false);
    setSourceText('');
    setComparedSourceText('');
    setPresetId(DEFAULT_SELECTIONS.presetId);
    setTone(DEFAULT_SELECTIONS.tone);
    setAudience(DEFAULT_SELECTIONS.audience);
    setDepth(DEFAULT_SELECTIONS.depth);
    setTransformResult(null);
    setWorkspaceSessionKey((prev) => prev + 1);
    dismissToast();
  };

  const handleQuickPreset = useCallback((targetPreset: PresetId) => {
    setPresetId(targetPreset);
    if (targetPreset === 'executive') {
      setTone('authoritative');
      setAudience('executive');
      setDepth('quick');
    } else if (targetPreset === 'phd_authority') {
      setTone('authoritative');
      setAudience('specialist');
      setDepth('deep');
    } else if (targetPreset === 'gonzo') {
      setTone('playful');
      setAudience('general');
      setDepth('standard');
    } else if (targetPreset === 'clarity') {
      setTone('neutral');
      setAudience('general');
      setDepth('standard');
    }
  }, []);

  const handleTransform = useCallback(async () => {
    if (!sourceText.trim()) return;

    // Abort any prior in-flight transformation request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestSource = sourceText;
    setIsTransforming(true);

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: requestSource,
          presetId,
          tone,
          audience,
          depth,
        }),
        signal: controller.signal,
      });

      let payload: TransformResult;
      try {
        payload = (await response.json()) as TransformResult;
      } catch {
        payload = { ok: false, code: 'unknown', error: 'Network error' };
      }

      if (controller.signal.aborted) return;

      if (payload.ok) {
        setComparedSourceText(requestSource);
        setResultKey((prev) => prev + 1);
      }
      setTransformResult(payload);

      if (!payload.ok) {
        if (payload.code === 'upstream') {
          showToast('error', payload.error);
        } else if (payload.code === 'unknown') {
          console.error('Transform request returned unknown error code.');
        }
      }
    } catch (err) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && err.name === 'AbortError')
      ) {
        return;
      }
      const networkError: TransformResult = {
        ok: false,
        code: 'unknown',
        error: 'Network error',
      };
      setTransformResult(networkError);
      console.error('Transform request failed due to a network error.');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsTransforming(false);
    }
  }, [sourceText, presetId, tone, audience, depth, showToast]);

  // Global keyboard shortcut: Cmd/Ctrl + Enter triggers Transform outside dialogs/selects/inputs
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') {
        return;
      }

      const activeEl = document.activeElement;
      if (activeEl) {
        if (activeEl.closest('[role="dialog"]')) return;
        const tag = activeEl.tagName.toLowerCase();
        if (tag === 'select' || tag === 'input') return;
      }

      if (isTransforming || !sourceText.trim()) return;

      event.preventDefault();
      void handleTransform();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTransforming, sourceText, handleTransform]);

  const isSourceEmpty = sourceText.trim().length === 0;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${themeConfig.shell}`}
    >
      {/* Top Navigation Bar: Clean 3-zone contract */}
      <header
        className={`border-b sticky top-0 z-30 backdrop-blur-md transition-colors duration-200 ${themeConfig.header}`}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Wordmark */}
          <Link
            href="/"
            className={`flex items-center gap-2.5 text-base font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 ${themeConfig.accentRing} rounded`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg font-black text-xs shadow-xs ${themeConfig.accentBadge}`}
            >
              V
            </span>
            <span className={themeConfig.ink}>Verbatim</span>
            <span
              className={`hidden sm:inline-block text-[11px] font-normal px-2 py-0.5 rounded-full border ${themeConfig.border} ${themeConfig.tray} ${themeConfig.inkMuted}`}
            >
              Content Engine
            </span>
          </Link>

          {/* Zone 2: Theme Selector */}
          <div
            role="radiogroup"
            aria-label="Design Theme"
            className={`flex items-center gap-1 p-1 rounded-xl border ${themeConfig.border} ${themeConfig.tray}`}
          >
            {(Object.keys(THEMES) as ThemeMode[]).map((mode) => {
              const t = THEMES[mode];
              const isSelected = currentTheme === mode;
              const Icon =
                mode === 'obsidian'
                  ? Moon
                  : mode === 'editorial'
                  ? BookOpen
                  : Terminal;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setCurrentTheme(mode)}
                  title={`${t.name} — ${t.tagline}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? `${t.activeSegmentBg} ${t.activeSegmentShadow}`
                      : `${themeConfig.inkMuted} hover:${themeConfig.ink} hover:bg-white/5`
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden md:inline font-medium">
                    {t.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Zone 3: Quiet Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${themeConfig.border} ${themeConfig.tray} ${themeConfig.inkMuted} hover:${themeConfig.ink} hover:border-slate-500/50`}
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={handleResetWorkspace}
              title="Reset workspace"
              aria-label="Reset workspace"
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${themeConfig.border} ${themeConfig.tray} ${themeConfig.inkMuted} hover:${themeConfig.ink}`}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workbench Viewport */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        {/* Real-time Analytics & Transformation Delta HUD */}
        <div className="mb-4">
          <AnalyticsHUD
            sourceText={sourceText}
            transformedText={
              transformResult?.ok ? transformResult.transformedText : null
            }
            depth={depth}
            theme={themeConfig}
          />
        </div>

        {/* Three-Column Workbench Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-5 items-stretch">
          <IngestionPane
            key={`ingestion-${workspaceSessionKey}`}
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
            onSelectQuickPreset={handleQuickPreset}
            activePresetId={presetId}
            theme={themeConfig}
          />

          <div
            id="control-rail"
            className="hidden md:flex md:w-[300px] flex-col gap-3"
          >
            <DesktopControlPanel
              presetId={presetId}
              onPresetChange={setPresetId}
              tone={tone}
              onToneChange={setTone}
              audience={audience}
              onAudienceChange={setAudience}
              depth={depth}
              onDepthChange={setDepth}
              onTransform={handleTransform}
              isTransforming={isTransforming}
              isSourceEmpty={isSourceEmpty}
              theme={themeConfig}
            />
          </div>

          <OutputPane
            key={`output-${workspaceSessionKey}`}
            comparedSourceText={comparedSourceText}
            transformResult={transformResult}
            resultKey={resultKey}
            isTransforming={isTransforming}
            presetId={presetId}
            tone={tone}
            audience={audience}
            depth={depth}
            theme={themeConfig}
            onNotify={showToast}
          />
        </div>
      </main>

      {/* Mobile Sticky Bottom Control Bar & Focus-Trapped Settings Drawer */}
      <MobileControlBar
        presetId={presetId}
        onPresetChange={setPresetId}
        tone={tone}
        onToneChange={setTone}
        audience={audience}
        onAudienceChange={setAudience}
        depth={depth}
        onDepthChange={setDepth}
        onTransform={handleTransform}
        isTransforming={isTransforming}
        isSourceEmpty={isSourceEmpty}
        theme={themeConfig}
      />

      {/* Toast Notifications */}
      <ToastBanner toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
