'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Columns2,
  Copy,
  Download,
  FileCheck2,
  FileText,
  GitCompareArrows,
  GraduationCap,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PRESETS_META } from '@/lib/presets.meta';
import type {
  Audience,
  Depth,
  PresetId,
  Tone,
  TransformResult,
} from '@/lib/types';
import type { ThemeConfig } from '@/lib/theme';
import type { ToastVariant } from './ToastBanner';
import DiffViewer from './DiffViewer';
import SplitSyncView from './SplitSyncView';
import TTSPlayer from './TTSPlayer';
import TransformProgressHUD from './TransformProgressHUD';

export type OutputViewMode = 'reading' | 'split' | 'diff';

interface OutputPaneProps {
  comparedSourceText: string;
  transformResult: TransformResult | null;
  resultKey: number;
  isTransforming: boolean;
  presetId: PresetId;
  tone: Tone;
  audience: Audience;
  depth: Depth;
  theme: ThemeConfig;
  onNotify: (variant: ToastVariant, message: string) => void;
}

const CAPITALIZE = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const PRESET_ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  GraduationCap,
  Zap,
  FileText,
};

export default function OutputPane({
  comparedSourceText,
  transformResult,
  resultKey,
  isTransforming,
  presetId,
  tone,
  audience,
  depth,
  theme,
  onNotify,
}: OutputPaneProps) {
  const [viewMode, setViewMode] = useState<OutputViewMode>('reading');
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const hasSuccess = !isTransforming && transformResult !== null && transformResult.ok;
  const isInlineError =
    !isTransforming &&
    transformResult !== null &&
    !transformResult.ok &&
    (transformResult.code === 'validation' ||
      transformResult.code === 'too_large');

  const activePreset =
    PRESETS_META.find((preset) => preset.id === presetId) ?? PRESETS_META[0];
  const PresetIcon = PRESET_ICON_MAP[activePreset.icon] ?? Sparkles;

  const outputWordCount = hasSuccess
    ? transformResult.transformedText.trim()
      ? transformResult.transformedText.trim().split(/\s+/).filter(Boolean).length
      : 0
    : 0;

  const handleCopy = async () => {
    if (!hasSuccess) return;
    try {
      await navigator.clipboard.writeText(transformResult.transformedText);
      setCopied(true);
      onNotify('success', 'Copied transformed text to clipboard.');
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = null;
      }, 1800);
    } catch {
      setCopied(false);
      onNotify('error', 'Could not access clipboard.');
    }
  };

  const handleDownloadMarkdown = () => {
    if (!hasSuccess) return;
    const blob = new Blob([transformResult.transformedText], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transformed-${presetId}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onNotify('success', 'Downloaded Markdown (.md) document.');
  };

  const handleDownloadDocx = async () => {
    if (!hasSuccess || isExportingDocx) return;
    setIsExportingDocx(true);
    try {
      const [{ Document, Packer, Paragraph, TextRun }, { saveAs }] =
        await Promise.all([import('docx'), import('file-saver')]);

      const lines = transformResult.transformedText.split(/\r?\n/);
      const paragraphs = lines.map(
        (line) =>
          new Paragraph({
            children: [new TextRun(line)],
            spacing: { after: 160 },
          })
      );

      const doc = new Document({
        sections: [
          {
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `transformed-${presetId}.docx`);
      onNotify('success', 'Downloaded Word (.docx) document.');
    } catch {
      onNotify('error', 'Failed to generate .docx export.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <section
      aria-label="Transformed output workspace"
      className={`min-w-0 flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden ${
        theme.panel
      } ${theme.border}`}
    >
      {/* Pane Header & Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${
          theme.panelHeader
        } ${theme.border}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs ${
              activePreset.themeGlow ?? theme.accentBadge
            }`}
          >
            <PresetIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </div>

          <h2 className={`text-sm font-bold tracking-tight ${theme.ink} whitespace-nowrap`}>
            Synthesized Prose
          </h2>

          <span className={`hidden xl:inline-flex items-center gap-1.5 text-xs truncate ${theme.inkMuted}`}>
            <span aria-hidden="true">·</span>
            <span className="truncate">
              {activePreset.label} · {CAPITALIZE(tone)} · {CAPITALIZE(audience)} · {CAPITALIZE(depth)}
            </span>
          </span>
        </div>

        {/* View Mode Switcher & Export Toolbar */}
        <div
          role="toolbar"
          aria-label="Export and comparison actions"
          className="flex flex-wrap items-center gap-2 shrink-0"
        >
          {/* View Mode Segmented Controls */}
          {hasSuccess ? (
            <div
              className={`flex items-center rounded-xl p-0.5 border ${
                theme.tray
              } ${theme.border}`}
            >
              <button
                type="button"
                onClick={() => setViewMode('reading')}
                aria-pressed={viewMode === 'reading'}
                title="Reading View"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'reading'
                    ? `${theme.activeSegmentBg} ${theme.activeSegmentShadow}`
                    : `${theme.inkMuted} ${theme.inkHover} ${theme.surfaceHover}`
                }`}
              >
                <BookOpen className="h-3 w-3" aria-hidden="true" />
                <span>Reading</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                aria-pressed={viewMode === 'split'}
                title="Side-by-Side Synchronized View"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? `${theme.activeSegmentBg} ${theme.activeSegmentShadow}`
                    : `${theme.inkMuted} ${theme.inkHover} ${theme.surfaceHover}`
                }`}
              >
                <Columns2 className="h-3 w-3" aria-hidden="true" />
                <span>Split</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('diff')}
                aria-pressed={viewMode === 'diff'}
                title="Diff & Revision Audit View"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'diff'
                    ? `${theme.activeSegmentBg} ${theme.activeSegmentShadow}`
                    : `${theme.inkMuted} ${theme.inkHover} ${theme.surfaceHover}`
                }`}
              >
                <GitCompareArrows className="h-3 w-3" aria-hidden="true" />
                <span>Diff ({transformResult.changeLog.length})</span>
              </button>
            </div>
          ) : null}

          {/* Text-to-Speech Audio Preview */}
          {hasSuccess ? (
            <TTSPlayer text={transformResult.transformedText} theme={theme} />
          ) : null}

          {/* Export Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!hasSuccess}
              aria-label="Copy transformed text"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                !hasSuccess
                  ? theme.disabledButton
                  : `${theme.tray} ${theme.border} ${theme.borderHover} ${theme.ink} cursor-pointer`
              }`}
            >
              {copied ? (
                <>
                  <Check
                    className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!hasSuccess}
              aria-label="Download Markdown file"
              onClick={handleDownloadMarkdown}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                !hasSuccess
                  ? theme.disabledButton
                  : `${theme.tray} ${theme.border} ${theme.borderHover} ${theme.ink} cursor-pointer`
              }`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>.md</span>
            </button>

            <button
              type="button"
              disabled={!hasSuccess || isExportingDocx}
              aria-label="Download Word document"
              onClick={handleDownloadDocx}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                !hasSuccess || isExportingDocx
                  ? theme.disabledButton
                  : `${theme.tray} ${theme.border} ${theme.borderHover} ${theme.ink} cursor-pointer`
              }`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isExportingDocx ? 'Exporting...' : '.docx'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Viewport: Reading / Split / Diff / Pipeline Progress / Empty / Error */}
      <div className="flex-1 flex flex-col px-5 py-5 min-h-[420px] lg:min-h-[530px]">
        <AnimatePresence mode="wait">
          {isTransforming ? (
            <motion.div
              key="loading-pipeline"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <TransformProgressHUD presetId={presetId} theme={theme} />
            </motion.div>
          ) : isInlineError ? (
            <motion.div
              key="inline-error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              role="alert"
              className={`rounded-2xl border p-5 flex items-start gap-3.5 text-sm ${theme.errorSurface}`}
            >
              <AlertCircle
                className="h-5 w-5 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1">
                <p className={`font-bold ${theme.errorTitle}`}>
                  {transformResult.code === 'too_large'
                    ? 'Input size limit exceeded'
                    : 'Validation error'}
                </p>
                <p>{transformResult.error}</p>
              </div>
            </motion.div>
          ) : !hasSuccess ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12"
            >
              <div className="relative mb-4 flex items-center justify-center">
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-md ${theme.accentBadge}`}
                >
                  <FileCheck2 className="h-7 w-7" aria-hidden="true" />
                </div>
              </div>
              <p className={`text-base font-bold ${theme.ink}`}>
                Universal Content Transformation Engine
              </p>
              <p className={`mt-1.5 text-xs max-w-sm leading-relaxed ${theme.inkSubtle}`}>
                Select a transformation preset, calibrate tone & audience, then trigger synthesis via{' '}
                <kbd className={`font-mono px-1.5 py-0.5 rounded ${theme.kbd}`}>
                  ⌘ / Ctrl + Enter
                </kbd>
                .
              </p>
            </motion.div>
          ) : viewMode === 'split' ? (
            <motion.div
              key="split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <SplitSyncView
                sourceText={comparedSourceText}
                transformedText={transformResult.transformedText}
                theme={theme}
              />
            </motion.div>
          ) : viewMode === 'diff' ? (
            <motion.div
              key="diff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <DiffViewer
                key={resultKey}
                result={transformResult}
                source={comparedSourceText}
                theme={theme}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Persistent aria-live="polite" region wrapping transformed text */}
        <div
          className={
            hasSuccess && viewMode === 'reading'
              ? 'flex-1 flex flex-col justify-between gap-6'
              : 'sr-only'
          }
        >
          <div aria-live="polite" aria-atomic="false">
            {hasSuccess && viewMode === 'reading' ? (
              <motion.article
                key={resultKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className={`max-w-[68ch] text-[15.5px] leading-[1.75] font-normal whitespace-pre-wrap break-words ${theme.ink}`}
              >
                {transformResult.transformedText}
              </motion.article>
            ) : null}
          </div>

          {hasSuccess && viewMode === 'reading' ? (
            <div
              className={`border-t pt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs ${
                theme.border
              } ${theme.inkMuted}`}
            >
              <div className="font-mono tabular-nums flex items-center gap-2.5">
                <span className={`font-bold ${theme.accentFg}`}>
                  {outputWordCount.toLocaleString()}{' '}
                  {outputWordCount === 1 ? 'word' : 'words'}
                </span>
                <span aria-hidden="true" className={theme.inkSubtle}>
                  ·
                </span>
                <span>
                  {transformResult.changeLog.length}{' '}
                  {transformResult.changeLog.length === 1
                    ? 'revision logged'
                    : 'revisions logged'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`inline-flex items-center gap-1 font-semibold ${theme.accentFg} hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  <span>Side-by-side view</span>
                  <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('diff')}
                  className={`inline-flex items-center gap-1 font-semibold ${theme.accentFg} hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  <span>Inspect diff log</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
