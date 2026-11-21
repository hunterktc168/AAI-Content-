'use client';

import { useEffect, useState } from 'react';
import { Cpu, Loader2, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import type { ThemeConfig } from '@/lib/theme';
import type { PresetId } from '@/lib/types';

interface TransformProgressHUDProps {
  presetId: PresetId;
  theme: ThemeConfig;
}

const PIPELINE_STAGES = [
  { label: 'Tokenizing & Parsing Source Prose', icon: Cpu },
  { label: 'Calibrating Style & Audience Matrix', icon: Wand2 },
  { label: 'Auditing Strict Factual Invariants', icon: ShieldCheck },
  { label: 'Assembling Revision Changelog', icon: Sparkles },
];

export default function TransformProgressHUD({
  presetId,
  theme,
}: TransformProgressHUDProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const diff = (now - startTime) / 1000;
      setElapsed(Math.round(diff * 10) / 10);

      const nextStage = Math.min(
        PIPELINE_STAGES.length - 1,
        Math.floor(diff / 2.2)
      );
      setStageIndex(nextStage);
    }, 100);

    return () => window.clearInterval(interval);
  }, []);

  const activeStage = PIPELINE_STAGES[stageIndex];
  const StageIcon = activeStage.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex-1 flex flex-col justify-center items-center text-center p-8 rounded-xl border ${
        theme.tray
      } ${theme.border}`}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Pulsing Central Icon Ring */}
        <div className="relative flex items-center justify-center">
          <div
            className={`relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${theme.accentBadge}`}
          >
            <StageIcon className="h-8 w-8 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        {/* Stopwatch & Current Stage */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-2">
            <Loader2
              className={`h-4 w-4 animate-spin ${theme.accentFg}`}
              aria-hidden="true"
            />
            <span
              className={`font-mono tabular-nums text-sm font-bold ${theme.accentFg}`}
            >
              {elapsed.toFixed(1)}s elapsed
            </span>
          </div>

          <h3 className={`text-base font-bold ${theme.ink}`}>
            {activeStage.label}
          </h3>
          <p className={`text-xs ${theme.inkSubtle}`}>
            Transforming prose via{' '}
            <span className={`font-semibold ${theme.accentFg}`}>{presetId}</span>{' '}
            preset while maintaining strict factual fidelity.
          </p>
        </div>

        {/* Pipeline Stepper Indicators */}
        <div className="w-full flex items-center justify-between gap-2 pt-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isDone = idx < stageIndex;
            const isCurrent = idx === stageIndex;
            return (
              <div
                key={stage.label}
                className="flex-1 flex flex-col gap-1.5 items-center"
              >
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    isDone
                      ? theme.progressBarFill
                      : isCurrent
                      ? `${theme.progressBarFill} animate-pulse`
                      : theme.progressBarTrack
                  }`}
                />
                <span
                  className={`text-[10px] hidden sm:inline-block font-mono ${
                    isCurrent
                      ? `${theme.accentFg} font-bold`
                      : isDone
                      ? theme.inkMuted
                      : theme.inkSubtle
                  }`}
                >
                  Step {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
