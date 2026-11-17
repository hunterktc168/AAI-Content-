'use client';

import { useEffect, useState } from 'react';
import { Cpu, Loader2, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
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
      const diff = ((now - startTime) / 1000);
      setElapsed(Math.round(diff * 10) / 10);

      // Advance stage roughly every 2 seconds
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
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-lg text-cyan-400">
            <StageIcon className="h-8 w-8 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        {/* Stopwatch & Current Stage */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span className="font-mono tabular-nums text-sm font-bold text-cyan-400">
              {elapsed.toFixed(1)}s elapsed
            </span>
          </div>

          <h3 className={`text-base font-bold ${theme.ink}`}>
            {activeStage.label}
          </h3>
          <p className={`text-xs ${theme.inkSubtle}`}>
            Transforming prose via <span className="font-semibold text-cyan-400">{presetId}</span> preset while maintaining strict factual fidelity.
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
                      ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.6)]'
                      : isCurrent
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse'
                      : 'bg-white/10'
                  }`}
                />
                <span
                  className={`text-[10px] hidden sm:inline-block font-mono ${
                    isCurrent
                      ? 'text-cyan-400 font-bold'
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
