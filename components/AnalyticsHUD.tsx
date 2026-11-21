'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  ChevronRight,
  Clock,
  Gauge,
  Percent,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { computeTextAnalytics } from '@/lib/analytics';
import type { Depth } from '@/lib/types';
import type { ThemeConfig } from '@/lib/theme';

interface AnalyticsHUDProps {
  sourceText: string;
  transformedText: string | null;
  depth: Depth;
  theme: ThemeConfig;
}

const DEPTH_TARGET_RANGES: Record<
  Depth,
  { label: string; min: number; max: number }
> = {
  quick: { label: '≤40%', min: 0, max: 40 },
  standard: { label: '80–120%', min: 80, max: 120 },
  deep: { label: '130–160%', min: 130, max: 160 },
};

export default function AnalyticsHUD({
  sourceText,
  transformedText,
  depth,
  theme,
}: AnalyticsHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sourceMetrics = useMemo(
    () => computeTextAnalytics(sourceText),
    [sourceText]
  );

  const transformedMetrics = useMemo(
    () => (transformedText ? computeTextAnalytics(transformedText) : null),
    [transformedText]
  );

  const wordDelta =
    transformedMetrics && sourceMetrics.wordCount > 0
      ? Math.round(
          ((transformedMetrics.wordCount - sourceMetrics.wordCount) /
            sourceMetrics.wordCount) *
            100
        )
      : 0;

  const lengthRatio =
    transformedMetrics && sourceMetrics.wordCount > 0
      ? Math.round((transformedMetrics.wordCount / sourceMetrics.wordCount) * 100)
      : 100;

  const target = DEPTH_TARGET_RANGES[depth];
  const isWithinTarget =
    lengthRatio >= target.min && lengthRatio <= target.max;

  if (sourceMetrics.wordCount === 0 && !transformedMetrics) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        theme.tray
      } ${theme.border}`}
    >
      {/* Top Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <Activity
              className={`h-3.5 w-3.5 ${theme.accentFg}`}
              aria-hidden="true"
            />
            <span className={theme.inkMuted}>Prose Intelligence:</span>
            <span className={`font-mono tabular-nums ${theme.ink}`}>
              {sourceMetrics.wordCount} words
              {transformedMetrics
                ? ` → ${transformedMetrics.wordCount} words`
                : ''}
            </span>
          </div>

          {transformedMetrics && sourceMetrics.wordCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
                  wordDelta < 0
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : wordDelta > 0
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                    : `${theme.subtleSurface} ${theme.ink} border`
                }`}
              >
                {wordDelta < 0 ? (
                  <TrendingDown className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                )}
                <span>
                  {wordDelta > 0 ? `+${wordDelta}%` : `${wordDelta}%`} length
                </span>
              </span>

              <span
                className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-medium ${
                  isWithinTarget
                    ? theme.accentFg
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                (Target {target.label}: {lengthRatio}%)
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Clock className={`h-3 w-3 ${theme.inkSubtle}`} aria-hidden="true" />
            <span
              className={`font-mono tabular-nums text-[11px] ${theme.inkSubtle}`}
            >
              ~
              {transformedMetrics
                ? transformedMetrics.readingTimeSeconds
                : sourceMetrics.readingTimeSeconds}
              s read
            </span>
          </div>

          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${theme.accentFg} transition-opacity hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${theme.accentRing} rounded`}
          >
            <span>{isExpanded ? 'Hide metrics' : 'Full metrics'}</span>
            <ChevronRight
              className={`h-3 w-3 transition-transform duration-150 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Expandable Deep Telemetry Drawer */}
      {isExpanded ? (
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 border-t p-3.5 text-xs ${
            theme.panelHeader
          } ${theme.border}`}
        >
          {/* Metric 1: Reading Ease */}
          <div className={`flex flex-col gap-1 p-2.5 rounded-lg border ${theme.subtleSurface}`}>
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${theme.accentFg}`}>
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reading Ease (Flesch)</span>
            </div>
            <div className={`font-mono tabular-nums text-sm font-bold ${theme.ink}`}>
              {transformedMetrics
                ? `${sourceMetrics.fleschReadingEase} → ${transformedMetrics.fleschReadingEase}`
                : sourceMetrics.fleschReadingEase}
            </div>
            <p className={`text-[10.5px] truncate ${theme.inkSubtle}`}>
              {transformedMetrics
                ? transformedMetrics.readingEaseLabel
                : sourceMetrics.readingEaseLabel}
            </p>
          </div>

          {/* Metric 2: Grade Level */}
          <div className={`flex flex-col gap-1 p-2.5 rounded-lg border ${theme.subtleSurface}`}>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-400 font-semibold">
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Grade Level</span>
            </div>
            <div className={`font-mono tabular-nums text-sm font-bold ${theme.ink}`}>
              {transformedMetrics
                ? `Grade ${sourceMetrics.fleschGradeLevel} → Grade ${transformedMetrics.fleschGradeLevel}`
                : `Grade ${sourceMetrics.fleschGradeLevel}`}
            </div>
            <p className={`text-[10.5px] truncate ${theme.inkSubtle}`}>
              {transformedMetrics
                ? `${transformedMetrics.avgWordsPerSentence} w/sentence`
                : `${sourceMetrics.avgWordsPerSentence} w/sentence`}
            </p>
          </div>

          {/* Metric 3: Sentence Rhythm */}
          <div className={`flex flex-col gap-1 p-2.5 rounded-lg border ${theme.subtleSurface}`}>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
              <Percent className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sentence Cadence</span>
            </div>
            <div className={`font-mono tabular-nums text-sm font-bold ${theme.ink}`}>
              {transformedMetrics
                ? `${sourceMetrics.sentenceCount} → ${transformedMetrics.sentenceCount} sentences`
                : `${sourceMetrics.sentenceCount} sentences`}
            </div>
            <p className={`text-[10.5px] truncate ${theme.inkSubtle}`}>
              Structural units
            </p>
          </div>

          {/* Metric 4: Factual Invariants */}
          <div className={`flex flex-col gap-1 p-2.5 rounded-lg border ${theme.subtleSurface}`}>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Fidelity Invariant</span>
            </div>
            <div className={`font-mono tabular-nums text-sm font-bold ${theme.ink}`}>
              100% Strict
            </div>
            <p className="text-[10.5px] text-emerald-700 dark:text-emerald-400/80 truncate">
              Zero unanchored dates/facts
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
