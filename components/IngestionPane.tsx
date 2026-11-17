'use client';

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Eraser,
  FileText,
  HardDrive,
  Sparkles,
  Upload,
  Wand2,
  WrapText,
  X,
} from 'lucide-react';
import { MAX_INPUT_CHARS } from '@/lib/constants';
import type { ThemeConfig } from '@/lib/theme';
import type { PresetId } from '@/lib/types';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.docx'] as const;

export interface IngestionPaneProps {
  sourceText: string;
  onSourceTextChange: (value: string) => void;
  onSelectQuickPreset?: (presetId: PresetId) => void;
  activePresetId?: PresetId;
  theme: ThemeConfig;
}

export default function IngestionPane({
  sourceText,
  onSourceTextChange,
  onSelectQuickPreset,
  activePresetId,
  theme,
}: IngestionPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [truncationNotice, setTruncationNotice] = useState<string | null>(null);

  const charCount = sourceText.length;
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).filter(Boolean).length : 0;
  const isNearLimit = charCount >= MAX_INPUT_CHARS * 0.8 && charCount < MAX_INPUT_CHARS;
  const isAtLimit = charCount >= MAX_INPUT_CHARS;

  const processFile = async (file: File) => {
    if (isParsingFile) return;
    setFileError(null);
    setTruncationNotice(null);

    const lowerName = file.name.toLowerCase();
    const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((ext) =>
      lowerName.endsWith(ext)
    );

    if (!hasAcceptedExtension) {
      setFileError(
        `Unsupported file format "${file.name}". Please upload a .txt, .md, or .docx document.`
      );
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setFileError(
        `File "${file.name}" is ${sizeMb} MB, which exceeds the 5 MB upload limit.`
      );
      return;
    }

    setIsParsingFile(true);
    try {
      let extracted = '';

      if (lowerName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const mammothMod = await import('mammoth');
        const extractRawText =
          mammothMod.extractRawText ?? mammothMod.default?.extractRawText;
        const result = await extractRawText({ arrayBuffer });
        extracted = result.value ?? '';
      } else {
        extracted = await file.text();
      }

      const normalized = extracted.replace(/\r\n/g, '\n');

      if (!normalized.trim()) {
        setFileError(
          `No readable text could be found inside "${file.name}".`
        );
        return;
      }

      if (normalized.length > MAX_INPUT_CHARS) {
        onSourceTextChange(normalized.slice(0, MAX_INPUT_CHARS));
        setTruncationNotice(
          `Loaded the first ${MAX_INPUT_CHARS.toLocaleString()} characters from "${file.name}".`
        );
      } else {
        onSourceTextChange(normalized);
      }

      setUploadedFileName(file.name);
    } catch {
      setFileError(
        `Failed to extract text from "${file.name}". Please verify the file is valid and unencrypted.`
      );
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleClearSource = () => {
    onSourceTextChange('');
    setUploadedFileName(null);
    setFileError(null);
    setTruncationNotice(null);
  };

  // Text format utilities
  const handleCleanWhitespace = () => {
    if (!sourceText.trim()) return;
    const cleaned = sourceText
      .split('\n')
      .map((line) => line.trim().replace(/[ \t]+/g, ' '))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    onSourceTextChange(cleaned);
  };

  const handleNormalizeParagraphs = () => {
    if (!sourceText.trim()) return;
    // Replace single line breaks inside paragraphs with space, keeping double linebreaks
    const paragraphs = sourceText.split(/\n\s*\n/);
    const normalized = paragraphs
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n');
    onSourceTextChange(normalized);
  };

  return (
    <section
      aria-label="Source document ingestion"
      className={`min-w-0 flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden ${
        theme.panel
      } ${theme.border}`}
    >
      {/* Pane Header */}
      <div
        className={`flex items-center justify-between gap-4 border-b px-5 py-3.5 ${
          theme.panelHeader
        } ${theme.border}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <h2 className={`text-sm font-bold tracking-tight ${theme.ink}`}>
            Source Ingestion
          </h2>

          {uploadedFileName ? (
            <span className={`inline-flex items-center gap-1.5 text-xs truncate ${theme.inkMuted}`}>
              <span aria-hidden="true">·</span>
              <span className="truncate text-cyan-400 font-medium">
                {uploadedFileName}
              </span>
            </span>
          ) : null}
        </div>

        {/* Toolbar & Clear Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`font-mono tabular-nums text-xs ${theme.inkSubtle} hidden sm:inline`}>
            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
          </span>

          {charCount > 0 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCleanWhitespace}
                title="Remove duplicate spaces and clean empty lines"
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                  theme.tray
                } ${theme.borderHover} ${theme.inkMuted} hover:text-white cursor-pointer`}
              >
                <Eraser className="h-3 w-3" />
                <span className="hidden md:inline">Trim</span>
              </button>
              <button
                type="button"
                onClick={handleNormalizeParagraphs}
                title="Unwrap broken single linebreaks into clean paragraphs"
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                  theme.tray
                } ${theme.borderHover} ${theme.inkMuted} hover:text-white cursor-pointer`}
              >
                <WrapText className="h-3 w-3" />
                <span className="hidden md:inline">Unwrap</span>
              </button>
              <button
                type="button"
                onClick={handleClearSource}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors text-rose-400 hover:bg-rose-500/10 cursor-pointer`}
              >
                <X className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Preset Strip (1-click Instant Preset Switching) */}
      {onSelectQuickPreset ? (
        <div
          className={`flex items-center gap-1.5 px-4 py-2 border-b overflow-x-auto scrollbar-none text-xs ${
            theme.tray
          } ${theme.border}`}
        >
          <span className={`text-[10px] font-mono uppercase tracking-wider ${theme.inkSubtle} shrink-0 mr-1`}>
            Quick:
          </span>
          <button
            type="button"
            onClick={() => onSelectQuickPreset('executive')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activePresetId === 'executive'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                : `${theme.inkMuted} hover:text-white hover:bg-white/5`
            }`}
          >
            <span>💼 Executive Memo</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectQuickPreset('clarity')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activePresetId === 'clarity'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-xs'
                : `${theme.inkMuted} hover:text-white hover:bg-white/5`
            }`}
          >
            <span>💎 Crystal Clarity</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectQuickPreset('phd_authority')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activePresetId === 'phd_authority'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-xs'
                : `${theme.inkMuted} hover:text-white hover:bg-white/5`
            }`}
          >
            <span>🎓 Academic Peer-Review</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectQuickPreset('gonzo')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activePresetId === 'gonzo'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs'
                : `${theme.inkMuted} hover:text-white hover:bg-white/5`
            }`}
          >
            <span>🔥 Kinetic Gonzo</span>
          </button>
        </div>
      ) : null}

      {/* Textarea Workspace */}
      <div className="relative flex-1 flex flex-col">
        <label htmlFor="source-text-input" className="sr-only">
          Source text to transform
        </label>
        <textarea
          id="source-text-input"
          value={sourceText}
          onChange={(e) => {
            setFileError(null);
            if (!e.target.value) {
              setUploadedFileName(null);
            }
            if (e.target.value.length < MAX_INPUT_CHARS) {
              setTruncationNotice(null);
            }
            onSourceTextChange(e.target.value);
          }}
          maxLength={MAX_INPUT_CHARS}
          placeholder="Paste or write your source manuscript here, or drop a .txt, .md, or .docx file below to begin transformation..."
          className={`w-full flex-1 min-h-[340px] lg:min-h-[440px] resize-none bg-transparent px-5 py-4 text-[15px] leading-[1.7] focus:outline-none placeholder:text-zinc-600 ${
            theme.ink
          }`}
        />
      </div>

      {/* Inline Validation / Extraction Alerts */}
      {fileError ? (
        <div
          role="alert"
          className="mx-5 mb-3 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
          <span>{fileError}</span>
        </div>
      ) : null}

      {truncationNotice ? (
        <div
          role="status"
          className="mx-5 mb-3 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
          <span>{truncationNotice}</span>
        </div>
      ) : null}

      {/* Integrated Ingestion Dock & Document Dropzone */}
      <div
        className={`border-t px-5 py-3.5 flex flex-col gap-3 ${
          theme.tray
        } ${theme.border}`}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isParsingFile) fileInputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isParsingFile) fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-disabled={isParsingFile}
          aria-busy={isParsingFile}
          aria-label="Upload a .txt, .md, or .docx file up to 5 MB"
          className={`flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 text-left transition-all duration-150 ${
            isParsingFile
              ? 'border-white/10 bg-white/5 cursor-wait opacity-75'
              : isDragging
              ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,210,255,0.2)] cursor-pointer'
              : 'border-white/15 bg-black/20 hover:border-cyan-400/50 hover:bg-black/30 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Upload className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold truncate ${theme.ink}`}>
                {isParsingFile
                  ? 'Extracting document text...'
                  : 'Drop document or click to browse'}
              </p>
              <p className={`text-[11px] ${theme.inkSubtle}`}>
                Supports .txt, .md, .docx · Maximum 5 MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.docx"
            onChange={handleFileChange}
            className="sr-only"
            tabIndex={-1}
          />
        </div>

        {/* Footer Meta: Disabled Google Drive + Character Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-500 cursor-not-allowed whitespace-nowrap shrink-0"
          >
            <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Google Drive</span>
          </button>

          <div
            className={`font-mono tabular-nums flex items-center gap-2 text-xs ${
              isAtLimit
                ? 'text-rose-400 font-bold'
                : isNearLimit
                ? 'text-amber-400 font-medium'
                : theme.inkSubtle
            }`}
          >
            {isNearLimit || isAtLimit ? (
              <span className="inline-flex items-center gap-1 font-sans">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isAtLimit ? 'Limit reached' : '80%+ limit'}</span>
                <span aria-hidden="true">·</span>
              </span>
            ) : null}
            <span>
              {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} chars
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
