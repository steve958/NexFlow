import { z } from 'zod';
import type { AIProvider, GeneratedFile } from '@/types/generation';

// ─── Response validation ─────────────────────────────────────────────────────

const generatedFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  language: z.string().min(1),
});

const generatedFilesSchema = z.array(generatedFileSchema);

// ─── Response parsing helpers ────────────────────────────────────────────────

/**
 * Extract a JSON array from the AI response text.
 *
 * Handles both:
 *  - Pure JSON responses
 *  - JSON wrapped in a markdown code block (```json ... ```)
 */
function extractJSON(text: string): string {
  // Try to find a fenced code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Otherwise assume the entire response is JSON
  const trimmed = text.trim();
  // Find the first `[` and last `]` to handle any leading/trailing prose
  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function parseAIResponse(raw: string): GeneratedFile[] {
  const jsonString = extractJSON(raw);
  const parsed = JSON.parse(jsonString);
  return generatedFilesSchema.parse(parsed);
}

// ─── Provider-specific callers ───────────────────────────────────────────────

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  // Anthropic returns content as an array of blocks
  const textBlock = data.content?.find(
    (b: { type: string }) => b.type === 'text',
  );
  if (!textBlock?.text) {
    throw new Error('No text content in Anthropic response');
  }
  return textBlock.text as string;
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 16384,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }
  return content as string;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface GenerateCodeParams {
  systemPrompt: string;
  userPrompt: string;
  provider: AIProvider;
  apiKey: string;
  model: string;
}

/**
 * Call the configured AI provider and return a validated array of generated files.
 *
 * Retries once on parse failure with an explicit format reminder appended to the prompt.
 */
export async function generateCode(
  params: GenerateCodeParams,
): Promise<GeneratedFile[]> {
  const { provider, apiKey, model } = params;

  if (!apiKey) {
    throw new Error('API key is required. Configure it in the Generate Code panel.');
  }

  const caller =
    provider === 'openai' ? callOpenAI : callAnthropic;

  // First attempt
  let rawResponse = await caller(
    params.systemPrompt,
    params.userPrompt,
    apiKey,
    model,
  );

  try {
    return parseAIResponse(rawResponse);
  } catch {
    // Retry with an explicit format reminder
    const retryPrompt = `${params.userPrompt}\n\nIMPORTANT: Your previous response could not be parsed. You MUST respond with ONLY a JSON array inside a \`\`\`json code block. No other text.`;

    rawResponse = await caller(
      params.systemPrompt,
      retryPrompt,
      apiKey,
      model,
    );

    return parseAIResponse(rawResponse);
  }
}
