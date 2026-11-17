'use client';

import { useMemo, useState } from 'react';
import type { ThemeConfig } from '@/lib/theme';

interface SplitSyncViewProps {
  sourceText: string;
  transformedText: string;
  theme: ThemeConfig;
}

export default function SplitSyncView({
  sourceText,
  transformedText,
  theme,
}: SplitSyncViewProps) {
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);

  const sourceParagraphs = useMemo(
    () => sourceText.split(/\n\s*\n/).filter((p) => p.trim().length > 0),
    [sourceText]
  );

  const transformedParagraphs = useMemo(
    () => transformedText.split(/\n\s*\n/).filter((p) => p.trim().length > 0),
    [transformedText]
  );

  const maxCount = Math.max(sourceParagraphs.length, transformedParagraphs.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-white/10">
        <span className="font-semibold text-cyan-400">
          Synchronized Split View ({maxCount} structural sections)
        </span>
        <span className="text-[11px] text-zinc-500">
          Hover or click any paragraph to inspect matched alignment
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold px-2 text-zinc-400">
            <span>Original Source</span>
            <span className="font-mono text-[11px] text-zinc-500">
              {sourceParagraphs.length} paragraphs
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {sourceParagraphs.map((para, idx) => {
              const isLinked = activeParagraph === idx;
              return (
                <div
                  key={`src-${idx}`}
                  onClick={() => setActiveParagraph(isLinked ? null : idx)}
                  onMouseEnter={() => setActiveParagraph(idx)}
                  className={`rounded-xl border p-3.5 transition-all duration-150 cursor-pointer ${
                    isLinked
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,210,255,0.15)] ring-1 ring-cyan-400'
                      : `${theme.tray} ${theme.border} hover:border-white/20`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/5 text-[11px] font-mono text-zinc-400">
                    <span className="font-bold text-cyan-400">
                      § {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span>
                      {para.trim().split(/\s+/).length} words
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${theme.ink}`}>
                    {para}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transformed Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold px-2 text-zinc-400">
            <span>Transformed Output</span>
            <span className="font-mono text-[11px] text-zinc-500">
              {transformedParagraphs.length} paragraphs
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {transformedParagraphs.map((para, idx) => {
              const isLinked = activeParagraph === idx;
              return (
                <div
                  key={`tx-${idx}`}
                  onClick={() => setActiveParagraph(isLinked ? null : idx)}
                  onMouseEnter={() => setActiveParagraph(idx)}
                  className={`rounded-xl border p-3.5 transition-all duration-150 cursor-pointer ${
                    isLinked
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,210,255,0.15)] ring-1 ring-cyan-400'
                      : `${theme.tray} ${theme.border} hover:border-white/20`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/5 text-[11px] font-mono text-zinc-400">
                    <span className="font-bold text-cyan-400">
                      § {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span>
                      {para.trim().split(/\s+/).length} words
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${theme.ink}`}>
                    {para}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
