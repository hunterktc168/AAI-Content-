'use client';

import { useMemo, useState } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import type { ChangeItem, TransformResponse } from '@/lib/types';
import { THEMES, type ThemeConfig } from '@/lib/theme';

interface DiffViewerProps {
  source: string;
  result: TransformResponse;
  theme?: ThemeConfig;
}

type DiffTuple = [number, string];

interface PositionedDiff {
  op: number;
  text: string;
  sourceStart: number;
  targetStart: number;
}

function buildPositionedDiffs(diffs: DiffTuple[]): PositionedDiff[] {
  const result: PositionedDiff[] = [];
  let sourceCursor = 0;
  let targetCursor = 0;
  for (const [op, text] of diffs) {
    result.push({
      op,
      text,
      sourceStart: sourceCursor,
      targetStart: targetCursor,
    });
    if (op === 0 || op === -1) {
      sourceCursor += text.length;
    }
    if (op === 0 || op === 1) {
      targetCursor += text.length;
    }
  }
  return result;
}

interface SubstringMatch {
  stream: 'source' | 'target';
  start: number;
  end: number;
  kind: 'exact' | 'nearest';
}

function computeWordDiff(source: string, target: string): DiffTuple[] {
  const dmp = new DiffMatchPatch();

  const sourceTokens = source.match(/(\s+|\S+)/g) ?? [];
  const targetTokens = target.match(/(\s+|\S+)/g) ?? [];

  const tokenToChar = new Map<string, string>();
  let nextCode = 0x0100;

  const encodeTokens = (tokens: string[]): string | null => {
    let encoded = '';
    for (const token of tokens) {
      let ch = tokenToChar.get(token);
      if (ch === undefined) {
        if (nextCode === 0xd800) {
          nextCode = 0xe000;
        }
        if (nextCode > 0xffff) {
          return null;
        }
        ch = String.fromCharCode(nextCode);
        nextCode += 1;
        tokenToChar.set(token, ch);
      }
      encoded += ch;
    }
    return encoded;
  };

  const chars1 = encodeTokens(sourceTokens);
  const chars2 = encodeTokens(targetTokens);

  if (chars1 === null || chars2 === null) {
    const fallback = dmp.diff_main(source, target);
    dmp.diff_cleanupSemantic(fallback);
    return fallback;
  }

  const charToTokenMap = new Map<string, string>();
  for (const [token, ch] of tokenToChar.entries()) {
    charToTokenMap.set(ch, token);
  }

  const rawDiffs = dmp.diff_main(chars1, chars2, false);
  dmp.diff_cleanupSemantic(rawDiffs);

  return rawDiffs.map(([op, encodedSegment]) => {
    let restored = '';
    for (let i = 0; i < encodedSegment.length; i += 1) {
      const ch = encodedSegment[i];
      restored += charToTokenMap.get(ch) ?? ch;
    }
    return [op, restored];
  });
}

function findBestMatchInText(
  haystack: string,
  excerpt: string
): { start: number; end: number; kind: 'exact' | 'nearest' } | null {
  const needle = excerpt.trim();
  if (!needle || !haystack.trim()) return null;

  // 1. Exact match
  const exactIdx = haystack.indexOf(needle);
  if (exactIdx !== -1) {
    return { start: exactIdx, end: exactIdx + needle.length, kind: 'exact' };
  }

  // 2. Case-insensitive match
  const lowerHaystack = haystack.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const ciIdx = lowerHaystack.indexOf(lowerNeedle);
  if (ciIdx !== -1) {
    return { start: ciIdx, end: ciIdx + needle.length, kind: 'nearest' };
  }

  // 3. Bitap fuzzy match via diff-match-patch
  const dmp = new DiffMatchPatch();
  dmp.Match_Threshold = 0.45;
  dmp.Match_Distance = Math.max(1000, haystack.length * 4);
  const probes =
    lowerNeedle.length > 32
      ? [
          { text: lowerNeedle.slice(0, 32), offset: 0 },
          {
            text: lowerNeedle.slice(Math.max(0, lowerNeedle.length - 32)),
            offset: Math.max(0, lowerNeedle.length - 32),
          },
        ]
      : [{ text: lowerNeedle, offset: 0 }];

  const searchCenter = Math.floor(haystack.length / 2);
  for (const probe of probes) {
    const fuzzyIdx = dmp.match_main(lowerHaystack, probe.text, searchCenter);
    if (fuzzyIdx !== -1) {
      const approxStart = Math.max(0, fuzzyIdx - probe.offset);
      const rawEnd = Math.min(haystack.length, approxStart + needle.length);
      const tail = haystack.slice(rawEnd);
      const nextBoundary = tail.search(/[\s.,;:!?]/);
      const alignedEnd =
        nextBoundary === -1 ? rawEnd : Math.min(haystack.length, rawEnd + nextBoundary);
      return {
        start: approxStart,
        end: Math.max(approxStart + 1, alignedEnd),
        kind: 'nearest',
      };
    }
  }

  // 4. Word-overlap sliding window fallback
  const wordSplitRegex = /[\s.,;:!?'"()[\]{}<>«»“”‘’—–/\\|]+/;
  const needleWords = lowerNeedle
    .split(wordSplitRegex)
    .filter((w) => w.length >= 3);
  if (needleWords.length === 0) return null;

  const needleSet = new Set(needleWords);
  const wordMatches = Array.from(
    haystack.matchAll(/[^\s.,;:!?'"()[\]{}<>«»“”‘’—–/\\|]+/g)
  );
  if (wordMatches.length === 0) return null;

  const windowSize = Math.min(wordMatches.length, Math.max(needleWords.length, 3));
  let bestScore = 0;
  let bestRange: { start: number; end: number } | null = null;

  for (let i = 0; i <= wordMatches.length - windowSize; i += 1) {
    let hits = 0;
    const seen = new Set<string>();
    for (let j = i; j < i + windowSize; j += 1) {
      const token = wordMatches[j][0].toLowerCase();
      if (needleSet.has(token) && !seen.has(token)) {
        seen.add(token);
        hits += 1;
      }
    }
    const score = hits / needleSet.size;
    if (score > bestScore) {
      bestScore = score;
      const start = wordMatches[i].index ?? 0;
      const lastMatch = wordMatches[i + windowSize - 1];
      const end = (lastMatch.index ?? 0) + lastMatch[0].length;
      bestRange = { start, end };
    }
  }

  if (bestRange && bestScore >= 0.35) {
    return { ...bestRange, kind: 'nearest' };
  }

  return null;
}

function resolveExcerptMatch(
  item: ChangeItem,
  source: string,
  target: string
): SubstringMatch | null {
  const preferredOrder: Array<'source' | 'target'> =
    item.type === 'add' ? ['target', 'source'] : ['source', 'target'];

  for (const stream of preferredOrder) {
    const haystack = stream === 'source' ? source : target;
    const match = findBestMatchInText(haystack, item.excerpt);
    if (match) {
      return { stream, ...match };
    }
  }
  return null;
}

function renderSegmentWithHighlight(
  text: string,
  streamOffset: number,
  highlightRange: { start: number; end: number } | null,
  baseClassName: string,
  keyPrefix: string,
  isDark: boolean
) {
  if (!highlightRange) {
    return (
      <span key={keyPrefix} className={baseClassName || undefined}>
        {text}
      </span>
    );
  }

  const segStart = streamOffset;
  const segEnd = streamOffset + text.length;
  const overlapStart = Math.max(segStart, highlightRange.start);
  const overlapEnd = Math.min(segEnd, highlightRange.end);

  if (overlapStart >= overlapEnd) {
    return (
      <span key={keyPrefix} className={baseClassName || undefined}>
        {text}
      </span>
    );
  }

  const localStart = overlapStart - segStart;
  const localEnd = overlapEnd - segStart;
  const before = text.slice(0, localStart);
  const matched = text.slice(localStart, localEnd);
  const after = text.slice(localEnd);

  const markClass = isDark
    ? 'bg-amber-400/30 text-amber-200 ring-1 ring-amber-400/80 rounded-xs px-0.5'
    : 'bg-amber-200 text-amber-950 ring-1 ring-amber-500/80 rounded-xs px-0.5';

  return (
    <span key={keyPrefix} className={baseClassName || undefined}>
      {before}
      <mark className={markClass}>
        {matched}
      </mark>
      {after}
    </span>
  );
}

const CHANGE_BADGE_STYLES: Record<
  ChangeItem['type'],
  { label: string; darkClass: string; lightClass: string }
> = {
  add: {
    label: 'Added',
    darkClass: 'text-emerald-400',
    lightClass: 'text-emerald-700',
  },
  remove: {
    label: 'Removed',
    darkClass: 'text-rose-400',
    lightClass: 'text-rose-700',
  },
  rewrite: {
    label: 'Rewritten',
    darkClass: 'text-cyan-400',
    lightClass: 'text-[#0D5C63]',
  },
};

export default function DiffViewer({ source, result, theme }: DiffViewerProps) {
  const activeTheme = theme ?? THEMES.obsidian;
  const { transformedText, changeLog } = result;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const diffs = useMemo(
    () => computeWordDiff(source, transformedText),
    [source, transformedText]
  );

  const stats = useMemo(() => {
    let additions = 0;
    let removals = 0;
    for (const [op, text] of diffs) {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      if (op === 1) additions += words;
      if (op === -1) removals += words;
    }
    return { additions, removals };
  }, [diffs]);

  const positionedDiffs = useMemo(() => buildPositionedDiffs(diffs), [diffs]);

  const resolvedMatches = useMemo(
    () => changeLog.map((item) => resolveExcerptMatch(item, source, transformedText)),
    [changeLog, source, transformedText]
  );

  const activeMatch =
    selectedIndex !== null ? resolvedMatches[selectedIndex] ?? null : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Diff summary legend */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-xs ${activeTheme.border} ${activeTheme.inkMuted}`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-xs ${
                activeTheme.isDark
                  ? 'bg-emerald-500/30 border border-emerald-500'
                  : 'bg-emerald-200 border border-emerald-600'
              }`}
              aria-hidden="true"
            />
            <span className={activeTheme.ink}>Additions</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-xs ${
                activeTheme.isDark
                  ? 'bg-rose-500/30 border border-rose-500'
                  : 'bg-rose-200 border border-rose-600'
              }`}
              aria-hidden="true"
            />
            <span className={activeTheme.ink}>Removals</span>
          </span>
          {activeMatch ? (
            <span
              className={`inline-flex items-center gap-1.5 ${
                activeTheme.isDark ? 'text-amber-300' : 'text-amber-800'
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-xs bg-amber-400 border border-amber-600"
                aria-hidden="true"
              />
              <span className="font-medium">
                {activeMatch.kind === 'exact'
                  ? 'Exact excerpt match'
                  : 'Nearest substring match'}
              </span>
            </span>
          ) : null}
        </div>
        <div className="font-mono tabular-nums flex items-center gap-3">
          <span
            className={
              activeTheme.isDark ? 'text-emerald-400' : 'text-emerald-700 font-semibold'
            }
          >
            +{stats.additions} words
          </span>
          <span aria-hidden="true" className={activeTheme.inkSubtle}>
            ·
          </span>
          <span
            className={
              activeTheme.isDark ? 'text-rose-400' : 'text-rose-700 font-semibold'
            }
          >
            -{stats.removals} words
          </span>
        </div>
      </div>

      {/* Split view: Inline word diff + ChangeLog rationale entries */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-5 items-start">
        <div
          className={`rounded-xl border p-4 text-[15px] leading-[1.7] whitespace-pre-wrap break-words ${activeTheme.border} ${activeTheme.tray} ${activeTheme.ink}`}
        >
          {positionedDiffs.map(({ op, text, sourceStart, targetStart }, index) => {
            let highlightRange: { start: number; end: number } | null = null;
            let offsetForSegment = 0;

            if (op === 0) {
              if (activeMatch?.stream === 'source') {
                offsetForSegment = sourceStart;
                highlightRange = activeMatch;
              } else if (activeMatch?.stream === 'target') {
                offsetForSegment = targetStart;
                highlightRange = activeMatch;
              }
              return renderSegmentWithHighlight(
                text,
                offsetForSegment,
                highlightRange,
                '',
                `eq-${index}`,
                activeTheme.isDark
              );
            }

            if (op === 1) {
              if (activeMatch?.stream === 'target') {
                offsetForSegment = targetStart;
                highlightRange = activeMatch;
              }
              const addClass = activeTheme.isDark
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xs px-0.5'
                : 'bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xs px-0.5';

              return renderSegmentWithHighlight(
                text,
                offsetForSegment,
                highlightRange,
                addClass,
                `add-${index}`,
                activeTheme.isDark
              );
            }

            if (activeMatch?.stream === 'source') {
              offsetForSegment = sourceStart;
              highlightRange = activeMatch;
            }
            const delClass = activeTheme.isDark
              ? 'bg-rose-500/20 text-rose-300 line-through decoration-rose-500/70 border border-rose-500/30 rounded-xs px-0.5'
              : 'bg-rose-100 text-rose-900 line-through decoration-rose-500/70 border border-rose-300 rounded-xs px-0.5';

            return renderSegmentWithHighlight(
              text,
              offsetForSegment,
              highlightRange,
              delClass,
              `del-${index}`,
              activeTheme.isDark
            );
          })}
        </div>

        <aside aria-label="Change rationale log" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-xs font-semibold ${activeTheme.ink}`}>
              Editorial Change Log ({changeLog.length})
            </h3>
            {selectedIndex !== null ? (
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className={`text-xs font-medium cursor-pointer hover:underline underline-offset-4 ${
                  activeTheme.isDark ? 'text-cyan-400' : 'text-[#0D5C63]'
                }`}
              >
                Clear highlight
              </button>
            ) : null}
          </div>

          {changeLog.length === 0 ? (
            <p
              className={`rounded-xl border p-3.5 text-sm ${activeTheme.border} ${activeTheme.panel} ${activeTheme.inkMuted}`}
            >
              No structural rationale entries were returned for this revision.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {changeLog.map((item, idx) => {
                const badge =
                  CHANGE_BADGE_STYLES[item.type] ?? CHANGE_BADGE_STYLES.rewrite;
                const match = resolvedMatches[idx];
                const isSelected = selectedIndex === idx;
                const badgeColor = activeTheme.isDark
                  ? badge.darkClass
                  : badge.lightClass;

                return (
                  <li key={idx}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelectedIndex((prev) => (prev === idx ? null : idx))
                      }
                      className={`w-full text-left rounded-xl border p-3.5 flex flex-col gap-1.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                        activeTheme.accentRing
                      } ${
                        isSelected
                          ? `${activeTheme.border} ${
                              activeTheme.isDark
                                ? 'bg-cyan-500/10 ring-1 ring-cyan-500/50'
                                : 'bg-[#EAF3F4] ring-1 ring-[#0D5C63]'
                            }`
                          : `${activeTheme.border} ${activeTheme.panel} hover:border-slate-500/40`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className={`font-semibold ${badgeColor}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[11px] ${activeTheme.inkSubtle}`}>
                          {match
                            ? match.kind === 'exact'
                              ? 'Click to highlight'
                              : 'Nearest match'
                            : 'Summary hint'}
                        </span>
                      </div>
                      <p className={`text-sm leading-snug ${activeTheme.ink}`}>
                        {item.rationale}
                      </p>
                      {item.excerpt?.trim() ? (
                        <p
                          className={`text-xs italic line-clamp-2 border-t pt-2 mt-0.5 ${activeTheme.border} ${activeTheme.inkSubtle}`}
                        >
                          &ldquo;{item.excerpt.trim()}&rdquo;
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
