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

  const maxCount = Math.max(
    sourceParagraphs.length,
    transformedParagraphs.length
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b ${theme.border} ${theme.inkMuted}`}
      >
        <span className={`font-semibold ${theme.accentFg}`}>
          Synchronized Split View ({maxCount} structural{' '}
          {maxCount === 1 ? 'section' : 'sections'})
        </span>
        <span className={`text-[11px] ${theme.inkSubtle}`}>
          Hover or select any paragraph to inspect matched alignment
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Column */}
        <div className="flex flex-col gap-3">
          <div
            className={`flex items-center justify-between text-xs font-semibold px-2 ${theme.inkMuted}`}
          >
            <span>Original Source</span>
            <span className={`font-mono text-[11px] ${theme.inkSubtle}`}>
              {sourceParagraphs.length}{' '}
              {sourceParagraphs.length === 1 ? 'paragraph' : 'paragraphs'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {sourceParagraphs.map((para, idx) => {
              const isLinked = activeParagraph === idx;
              return (
                <button
                  key={`src-${idx}`}
                  type="button"
                  aria-pressed={isLinked}
                  onClick={() => setActiveParagraph(isLinked ? null : idx)}
                  onMouseEnter={() => setActiveParagraph(idx)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                    theme.accentRing
                  } ${
                    isLinked
                      ? theme.linkedCard
                      : `${theme.tray} ${theme.border} ${theme.borderHover}`
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b text-[11px] font-mono ${theme.border} ${theme.inkMuted}`}
                  >
                    <span className={`font-bold ${theme.accentFg}`}>
                      § {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span>
                      {para.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${theme.ink}`}
                  >
                    {para}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transformed Column */}
        <div className="flex flex-col gap-3">
          <div
            className={`flex items-center justify-between text-xs font-semibold px-2 ${theme.inkMuted}`}
          >
            <span>Transformed Output</span>
            <span className={`font-mono text-[11px] ${theme.inkSubtle}`}>
              {transformedParagraphs.length}{' '}
              {transformedParagraphs.length === 1 ? 'paragraph' : 'paragraphs'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {transformedParagraphs.map((para, idx) => {
              const isLinked = activeParagraph === idx;
              return (
                <button
                  key={`tx-${idx}`}
                  type="button"
                  aria-pressed={isLinked}
                  onClick={() => setActiveParagraph(isLinked ? null : idx)}
                  onMouseEnter={() => setActiveParagraph(idx)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                    theme.accentRing
                  } ${
                    isLinked
                      ? theme.linkedCard
                      : `${theme.tray} ${theme.border} ${theme.borderHover}`
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b text-[11px] font-mono ${theme.border} ${theme.inkMuted}`}
                  >
                    <span className={`font-bold ${theme.accentFg}`}>
                      § {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span>
                      {para.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${theme.ink}`}
                  >
                    {para}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
