import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  AUDIENCES,
  DEPTHS,
  MAX_INPUT_CHARS,
  PRESET_IDS,
  TONES,
} from '@/lib/constants';
import {
  PRESET_SYSTEM_PROMPTS,
  PRESET_TEMPERATURES,
} from '@/lib/presets.system';
import type {
  Audience,
  ChangeItem,
  Depth,
  PresetId,
  Tone,
  TransformError,
  TransformResponse,
} from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DEPTH_DIRECTIVES: Record<Depth, string> = {
  quick: 'Target ≤40% of source length. Bullet-friendly. No elaboration.',
  standard: 'Target 80–120% of source length. Preserve prose flow.',
  deep: 'Target 130–160% of source length. You may add connective explanation, but introduce no new facts, dates, names, or statistics.',
};

const transformResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['transformedText', 'changeLog'],
  properties: {
    transformedText: { type: 'string' },
    changeLog: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'excerpt', 'rationale'],
        properties: {
          type: { type: 'string', enum: ['add', 'remove', 'rewrite'] },
          excerpt: { type: 'string' },
          rationale: { type: 'string' },
        },
      },
    },
  },
} as const;

function errorResponse(
  code: TransformError['code'],
  error: string,
  status: number
) {
  return NextResponse.json<TransformError>(
    { ok: false, code, error },
    { status }
  );
}

function isValidChangeItem(item: unknown): item is ChangeItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    (candidate.type === 'add' ||
      candidate.type === 'remove' ||
      candidate.type === 'rewrite') &&
    typeof candidate.excerpt === 'string' &&
    typeof candidate.rationale === 'string'
  );
}

function mapUpstreamErrorReason(err: unknown): string {
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;
    const status = typeof record.status === 'number' ? record.status : undefined;
    if (status === 429) {
      return 'Transformation quota or rate limit exceeded. Please try again shortly.';
    }
    if (status === 401 || status === 403) {
      return 'Transformation service authorization failed.';
    }
    if (status === 404) {
      return 'Configured transformation model is unavailable.';
    }
    if (status === 400) {
      return 'Transformation request was rejected by the upstream model.';
    }
  }
  return 'Upstream transformation service failed. Please try again.';
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return errorResponse('unknown', 'GEMINI_API_KEY not configured', 500);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return errorResponse('validation', 'Request body must be valid JSON.', 400);
  }

  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return errorResponse('validation', 'Request body must be a JSON object.', 400);
  }

  const body = rawBody as Record<string, unknown>;

  if (typeof body.sourceText !== 'string' || body.sourceText.trim().length === 0) {
    return errorResponse(
      'validation',
      'Field "sourceText" must be a non-empty string.',
      400
    );
  }

  if (body.sourceText.length > MAX_INPUT_CHARS) {
    return errorResponse(
      'too_large',
      `Field "sourceText" exceeds the ${MAX_INPUT_CHARS.toLocaleString()} character limit.`,
      413
    );
  }

  if (
    typeof body.presetId !== 'string' ||
    !(PRESET_IDS as readonly string[]).includes(body.presetId)
  ) {
    return errorResponse('validation', 'Invalid field "presetId".', 400);
  }

  if (
    typeof body.tone !== 'string' ||
    !(TONES as readonly string[]).includes(body.tone)
  ) {
    return errorResponse('validation', 'Invalid field "tone".', 400);
  }

  if (
    typeof body.audience !== 'string' ||
    !(AUDIENCES as readonly string[]).includes(body.audience)
  ) {
    return errorResponse('validation', 'Invalid field "audience".', 400);
  }

  if (
    typeof body.depth !== 'string' ||
    !(DEPTHS as readonly string[]).includes(body.depth)
  ) {
    return errorResponse('validation', 'Invalid field "depth".', 400);
  }

  const sourceText = body.sourceText;
  const presetId = body.presetId as PresetId;
  const tone = body.tone as Tone;
  const audience = body.audience as Audience;
  const depth = body.depth as Depth;

  const sanitizedSourceText = sourceText.replace(
    /<\/?source_text>/gi,
    (match) =>
      match.startsWith('</') ? '&lt;/source_text&gt;' : '&lt;source_text&gt;'
  );

  const userMessage = [
    DEPTH_DIRECTIVES[depth],
    'Depth never overrides the factual fidelity clause.',
    `Target tone: ${tone}. Target audience: ${audience}.`,
    '<source_text>',
    sanitizedSourceText,
    '</source_text>',
  ].join('\n');

  let rawModelText = '';
  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const result = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: userMessage,
      config: {
        systemInstruction: PRESET_SYSTEM_PROMPTS[presetId],
        responseMimeType: 'application/json',
        responseSchema: transformResponseSchema,
        temperature: PRESET_TEMPERATURES[presetId],
      },
    });

    rawModelText = result.text?.trim() ?? '';
  } catch (err) {
    return errorResponse('upstream', mapUpstreamErrorReason(err), 422);
  }

  if (!rawModelText) {
    return errorResponse(
      'upstream',
      'Model returned an empty response.',
      502
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawModelText);
  } catch {
    return errorResponse(
      'upstream',
      'Model output could not be parsed as valid JSON.',
      502
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return errorResponse(
      'upstream',
      'Model output did not match the expected JSON object.',
      502
    );
  }

  const payload = parsed as Record<string, unknown>;
  if (
    typeof payload.transformedText !== 'string' ||
    payload.transformedText.trim().length === 0 ||
    !Array.isArray(payload.changeLog) ||
    !payload.changeLog.every(isValidChangeItem)
  ) {
    return errorResponse(
      'upstream',
      'Model output did not match the expected transformation schema.',
      502
    );
  }

  return NextResponse.json<TransformResponse>({
    ok: true,
    transformedText: payload.transformedText,
    changeLog: payload.changeLog,
  });
}
