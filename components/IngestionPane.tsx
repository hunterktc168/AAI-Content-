'use client';

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  FileText,
  HardDrive,
  Upload,
  X,
} from 'lucide-react';
import { MAX_INPUT_CHARS } from '@/lib/constants';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.docx'] as const;

interface IngestionPaneProps {
  sourceText: string;
  onSourceTextChange: (value: string) => void;
}

export default function IngestionPane({
  sourceText,
  onSourceTextChange,
}: IngestionPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [truncationNotice, setTruncationNotice] = useState<string | null>(null);

  const charCount = sourceText.length;
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
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
    // Reset input so re-selecting the same file still triggers onChange
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

  return (
    <section
      aria-label="Source document ingestion"
      className="min-w-0 flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden"
    >
      {/* Pane Header */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3.5 bg-zinc-50/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 whitespace-nowrap">
            Source Text
          </h2>
          {uploadedFileName ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 truncate">
              <span aria-hidden="true">·</span>
              <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="truncate">{uploadedFileName}</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono tabular-nums text-xs text-zinc-500 hidden sm:inline">
            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
          </span>
          {charCount > 0 ? (
            <button
              type="button"
              onClick={handleClearSource}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear</span>
            </button>
          ) : null}
        </div>
      </div>

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
          placeholder="Paste or write your source text here, or drop a .txt, .md, or .docx file below..."
          className="w-full flex-1 min-h-[340px] lg:min-h-[430px] resize-none bg-white px-5 py-4 text-[15px] leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700/20"
        />
      </div>

      {/* Inline Validation / Extraction Alerts */}
      {fileError ? (
        <div
          role="alert"
          className="mx-5 mb-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
          <span>{fileError}</span>
        </div>
      ) : null}

      {truncationNotice ? (
        <div
          role="status"
          className="mx-5 mb-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
          <span>{truncationNotice}</span>
        </div>
      ) : null}

      {/* File Dropzone & Cloud Connector Bar */}
      <div className="border-t border-zinc-200 bg-zinc-50/60 px-5 py-4 flex flex-col gap-3">
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
          className={`flex items-center justify-between gap-4 rounded-lg border border-dashed px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
            isParsingFile
              ? 'border-zinc-200 bg-zinc-50 cursor-wait opacity-75'
              : isDragging
              ? 'border-blue-600 bg-blue-50/70 cursor-pointer'
              : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600">
              <Upload className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-800 truncate">
                {isParsingFile
                  ? 'Extracting document text...'
                  : 'Drop a file here or click to browse'}
              </p>
              <p className="text-xs text-zinc-500">
                Supports .txt, .md, .docx · Max 5 MB
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
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-400 cursor-not-allowed whitespace-nowrap shrink-0"
          >
            <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Google Drive</span>
          </button>

          <div
            className={`font-mono tabular-nums flex items-center gap-2 text-xs ${
              isAtLimit
                ? 'text-rose-700 font-semibold'
                : isNearLimit
                ? 'text-amber-600 font-medium'
                : 'text-zinc-500'
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
              {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
