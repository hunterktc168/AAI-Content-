'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
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
import type { ToastVariant } from './ToastBanner';
import DiffViewer from './DiffViewer';

interface OutputPaneProps {
  comparedSourceText: string;
  transformResult: TransformResult | null;
  resultKey: number;
  isTransforming: boolean;
  presetId: PresetId;
  tone: Tone;
  audience: Audience;
  depth: Depth;
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

function OutputSkeleton() {
  return (
    <div
      role="status"
      aria-label="Transforming content"
      className="flex-1 flex flex-col justify-between gap-6 py-1"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <div className="h-4 w-11/12 rounded bg-zinc-200/80 animate-pulse" />
          <div className="h-4 w-full rounded bg-zinc-200/80 animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-zinc-200/80 animate-pulse" />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="h-4 w-full rounded bg-zinc-200/80 animate-pulse" />
          <div className="h-4 w-10/12 rounded bg-zinc-200/80 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-zinc-200/80 animate-pulse" />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="h-4 w-9/12 rounded bg-zinc-200/80 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-zinc-200/80 animate-pulse" />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-3 flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-zinc-200/70 animate-pulse" />
        <div className="h-3 w-28 rounded bg-zinc-200/70 animate-pulse" />
      </div>
      <span className="sr-only">Transforming source text...</span>
    </div>
  );
}

export default function OutputPane({
  comparedSourceText,
  transformResult,
  resultKey,
  isTransforming,
  presetId,
  tone,
  audience,
  depth,
  onNotify,
}: OutputPaneProps) {
  const [isCompareMode, setIsCompareMode] = useState(false);
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
      ? transformResult.transformedText.trim().split(/\s+/).length
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
    URL.revokeObjectURL(url);
    onNotify('success', 'Downloaded Markdown (.md) file.');
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
      className="min-w-0 flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden"
    >
      {/* Pane Header & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-200 px-5 py-3.5 bg-zinc-50/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 whitespace-nowrap">
            Output Workspace
          </h2>
          <span className="hidden xl:inline-flex items-center gap-1.5 text-xs text-zinc-500 truncate">
            <span aria-hidden="true">·</span>
            <PresetIcon
              className="h-3.5 w-3.5 shrink-0 text-zinc-500"
              aria-hidden="true"
            />
            <span className="truncate">
              {activePreset.label} · {CAPITALIZE(tone)} · {CAPITALIZE(audience)} ·{' '}
              {CAPITALIZE(depth)}
            </span>
          </span>
        </div>

        <div
          role="toolbar"
          aria-label="Export and comparison actions"
          className="flex flex-wrap items-center gap-1.5 shrink-0"
        >
          <button
            type="button"
            disabled={!hasSuccess}
            aria-label="Copy transformed text"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              !hasSuccess
                ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span>Copied</span>
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
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              !hasSuccess
                ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer'
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
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              !hasSuccess || isExportingDocx
                ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer'
            }`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isExportingDocx ? 'Exporting...' : '.docx'}</span>
          </button>

          <button
            type="button"
            disabled={!hasSuccess}
            aria-pressed={isCompareMode}
            onClick={() => setIsCompareMode((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              !hasSuccess
                ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : isCompareMode
                ? 'border-blue-700 bg-blue-700 text-white cursor-pointer'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer'
            }`}
          >
            <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Reading / Skeleton / Diff / Empty / Inline Error Viewport */}
      <div className="flex-1 flex flex-col px-5 py-5 min-h-[420px] lg:min-h-[520px]">
        <AnimatePresence mode="wait">
          {isTransforming ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex-1 flex flex-col"
            >
              <OutputSkeleton />
            </motion.div>
          ) : isInlineError ? (
            <motion.div
              key="inline-error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-sm text-rose-900"
            >
              <AlertCircle
                className="h-4 w-4 shrink-0 text-rose-600 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {transformResult.code === 'too_large'
                    ? 'Input size limit exceeded'
                    : 'Validation error'}
                </p>
                <p className="text-rose-800">{transformResult.error}</p>
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
              <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
                Your transformed text will appear here.
              </p>
            </motion.div>
          ) : isCompareMode ? (
            <motion.div
              key="compare"
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
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Persistent aria-live="polite" region wrapping only the transformed text so initial empty render never fires and completion updates always announce */}
        <div
          className={
            hasSuccess && !isCompareMode
              ? 'flex-1 flex flex-col justify-between gap-6'
              : 'sr-only'
          }
        >
          <div aria-live="polite" aria-atomic="false">
            {hasSuccess && !isCompareMode ? (
              <motion.article
                key={resultKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="max-w-prose text-[15px] leading-relaxed text-zinc-800 whitespace-pre-wrap break-words"
              >
                {transformResult.transformedText}
              </motion.article>
            ) : null}
          </div>

          {hasSuccess && !isCompareMode ? (
            <div className="font-mono tabular-nums border-t border-zinc-100 pt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>
                {outputWordCount.toLocaleString()}{' '}
                {outputWordCount === 1 ? 'word' : 'words'}
              </span>
              <span>
                {transformResult.changeLog.length}{' '}
                {transformResult.changeLog.length === 1
                  ? 'logged revision'
                  : 'logged revisions'}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
