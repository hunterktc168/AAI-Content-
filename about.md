# Verbatim — Universal Content Transformation Engine

## Project Overview

**Verbatim** is a full-stack content transformation workbench built to restructure, condense, expand, and re-tone prose across stylistic registers, target audiences, and output lengths—without sacrificing factual accuracy.

At its core, Verbatim enforces a **strict factual fidelity invariant**: every transformation restructures syntax, cadence, and presentation while preserving every stated fact, date, entity, and statistic from the source material (`FACTUAL_FIDELITY_CLAUSE`). Rather than acting as an open-ended text generator that invents details, Verbatim behaves as a precision editorial instrument with transparent, sentence-level rationale tracking.

---

## Tech Stack

### Core Framework & Language
- **Next.js 15 (`^15.4.9`)**: App Router architecture (`app/`) with server-side API Route Handlers (`runtime = 'nodejs'`) and React Server/Client Component boundaries.
- **React 19 (`^19.2.1`) & TypeScript (`5.9.3`)**: Strict static typing across shared schemas, request/response contracts, and component props.

### AI & Inference Layer
- **`@google/genai` (`^3.3.0`)**: Server-side Gemini API integration (`gemini-4-hydrogen`) configured with:
  - `ThinkingLevel.MEDIUM` for balanced editorial reasoning and low-latency synthesis.
  - Structured JSON output (`responseMimeType: 'application/json'` + strict `responseSchema` validation) guaranteeing deterministic `{ transformedText, changeLog }` payloads.
  - Prompt-injection hardening (`<source_text>` XML boundary sanitization) and strict separation of server-only system prompts (`lib/presets.system.ts`) from client metadata (`lib/presets.meta.ts`).

### UI, Styling & Motion
- **Tailwind CSS v4 (`4.1.11`)**: Utility-first styling via `@tailwindcss/postcss` and `@custom-variant dark` multi-theme support.
- **Motion (`motion ^12.23.24`)**: Hardware-accelerated transitions for custom popover dropdowns, view switches, loading telemetry, and toast notifications.
- **Lucide React (`^0.553.0`)**: Consistent iconography across preset medallions, controls, and toolbar actions.

### Document Processing, Diffing & Export
- **`mammoth` (`^1.13.0`)**: Client-side `.docx` ingestion and raw text extraction alongside `.txt` and `.md` drag-and-drop support (up to 5 MB files / 40,000 characters).
- **`diff-match-patch` (`^1.0.5`)**: Token-level semantic word diffing paired with Bitap fuzzy matching and word-overlap fallback for mapping `changeLog` excerpts to source/target spans.
- **`docx` (`^9.15.4`) & `file-saver` (`^2.0.5`)**: Client-side generation and download of formatted `.docx` Word documents, alongside native `.md` Markdown export and clipboard copy.
- **Web Speech API (`window.speechSynthesis`)**: Browser-native text-to-speech playback (`TTSPlayer`) with variable playback speeds (`1x`, `1.25x`, `1.5x`).

---

## Architecture & Module Map

```text
app/
├── api/transform/route.ts   # Server-only Gemini synthesis endpoint, validation & schema enforcement
├── globals.css              # Tailwind v4 + custom dark variant configuration
├── layout.tsx               # Root document shell, metadata, and theme baseline
└── page.tsx                 # Workbench state orchestrator, abort-safe fetch, shortcuts & themes
components/
├── AnalyticsHUD.tsx         # Real-time Flesch readability, grade level, cadence & word delta metrics
├── ControlPanel.tsx         # Desktop control rail + mobile focus-trapped settings drawer
├── CustomDropdown.tsx       # Accessible animated popover selects with keyboard navigation
├── DiffViewer.tsx           # Semantic word diff + clickable editorial change log
├── IngestionPane.tsx        # Source editor, drag-and-drop parser, quick presets & formatting utils
├── OutputPane.tsx           # Reading / Split / Diff view switcher, skeletons, TTS & exports
├── SplitSyncView.tsx        # Synchronized paragraph-by-paragraph source/output comparison
├── ToastBanner.tsx          # Auto-dismissing success & upstream error notifications
├── TransformProgressHUD.tsx # Multi-stage pipeline progress & live elapsed stopwatch
└── TTSPlayer.tsx            # Native Web Speech audio narrator with equalizer indicator
lib/
├── analytics.ts             # Flesch Reading Ease, Flesch-Kincaid Grade Level & reading-time math
├── constants.ts             # Shared limits, fidelity clause, preset/tone/audience/depth enums
├── presets.meta.ts          # Client-safe preset labels, taglines, icons, and styling metadata
├── presets.system.ts        # Server-only system instructions and temperature tuning
├── theme.ts                 # Multi-theme token definitions (Obsidian Studio, Monograph Paper, Cyber Matrix)
└── types.ts                 # Shared TypeScript contracts (TransformRequest, TransformResult, ChangeItem)
```

---

## Intended Capabilities of the Finished Application

The completed **Verbatim** application is designed to serve as an end-to-end editorial and communications workstation capable of:

1. **Multi-Axis Prose Transformation**
   - **Presets**: *Crystal Clarity* (precision & structure), *Academic Rigor* (scholarly register), *Vivid Narrative* (kinetic pacing), and *Executive Brief* (high-signal decision synthesis).
   - **Tone Calibration**: *Neutral*, *Warm*, *Authoritative*, or *Playful*.
   - **Audience Targeting**: *General Audience*, *Executive Leadership*, *Technical Specialist*, or *Student / Learner*.
   - **Depth & Compression Control**: *Quick* ($\le 40\%$ length, bullet-friendly), *Standard* ($80\text{--}120\%$ prose flow), or *Deep* ($130\text{--}160\%$ connective explanation without fabricating facts).
   - **Future Extensibility**: Prepared architecture for user-defined *Custom Writing Style* profiles.

2. **Frictionless Document Ingestion & Normalization**
   - Direct text entry, one-click sample loading, and quick-preset shortcuts that align preset, tone, audience, and depth simultaneously.
   - Drag-and-drop file ingestion for `.txt`, `.md`, and `.docx` files with size validation and clean truncation warnings at the 40,000-character ceiling.
   - Instant text hygiene tools (*Trim whitespace*, *Unwrap hard line breaks*, *Clear*).

3. **Transparent Verification & Editorial Accountability**
   - **Reading Mode**: Distraction-free, typographically balanced prose view (`68ch` measure) with `aria-live="polite"` announcements.
   - **Synchronized Split View**: Side-by-side paragraph alignment (`§ 01`, `§ 02`, ...) allowing users to hover or click a paragraph to inspect its exact counterpart.
   - **Semantic Diff & Change Log**: Word-level additions/removals paired with an interactive editorial rationale list (`add`, `remove`, `rewrite`) that highlights the corresponding exact or fuzzy-matched excerpt in context.

4. **Real-Time Prose & Readability Telemetry**
   - Instant client-side computation of word/character/sentence counts, reading time, average words per sentence, Flesch Reading Ease (`0–100`), Flesch-Kincaid Grade Level, and before-vs-after word compression deltas against the selected depth target.

5. **Multi-Sensory Review & Production Export**
   - Built-in audio proofreading via native Text-to-Speech (`1x`, `1.25x`, `1.5x`).
   - One-click clipboard copy, Markdown (`.md`) download, and formatted Microsoft Word (`.docx`) export containing both the transformed text and structured revision metadata.

6. **Resilient, Accessible, Multi-Theme Ergonomics**
   - Three full-spectrum visual themes (*Obsidian Studio*, *Monograph Paper*, *Cyber Matrix*) synchronized with dark/light contrast tokens.
   - Abort-safe overlapping requests, granular error routing (inline banners for validation/payload limits vs. non-blocking error toasts for upstream failures), global `⌘/Ctrl + Enter` shortcut execution, and responsive mobile support with a focus-trapped settings drawer.
