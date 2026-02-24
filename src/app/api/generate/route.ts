import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCode } from '@/lib/aiProvider';
import { getSystemPrompt, buildUserPrompt } from '@/lib/generatePrompt';
import type { GenerationResponse, GenerationError } from '@/types/generation';

// ─── Request validation ──────────────────────────────────────────────────────

const generationRequestSchema = z.object({
  architecture: z.object({
    services: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        description: z.string(),
        group: z.string().optional(),
      }),
    ),
    connections: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        protocol: z.string(),
        description: z.string(),
        bidirectional: z.boolean(),
      }),
    ),
    groups: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        memberIds: z.array(z.string()),
      }),
    ),
  }),
  options: z.object({
    framework: z.enum([
      'typescript-express',
      'typescript-nestjs',
      'python-fastapi',
      'go-gin',
      'java-spring',
    ]),
    infrastructure: z.array(
      z.enum(['docker-compose', 'kubernetes', 'terraform', 'pulumi', 'aws-cdk']),
    ),
    orm: z.enum(['prisma', 'typeorm', 'drizzle', 'sqlalchemy', 'gorm', 'none']),
    includes: z.array(
      z.enum(['api-stubs', 'db-schemas', 'dockerfiles', 'cicd', 'readme', 'env-example']),
    ),
    additionalInstructions: z.string().max(2000).default(''),
  }),
  aiConfig: z.object({
    provider: z.enum(['anthropic', 'openai']),
    apiKey: z.string().min(1, 'API key is required'),
    model: z.string().min(1),
  }),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function errorResponse(
  code: GenerationError['code'],
  message: string,
  status: number,
): NextResponse<GenerationError> {
  return NextResponse.json({ error: message, code }, { status });
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Parse and validate request body
  let body: z.infer<typeof generationRequestSchema>;
  try {
    const raw = await request.json();
    body = generationRequestSchema.parse(raw);
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : 'Invalid request body';
    return errorResponse('VALIDATION_ERROR', message, 400);
  }

  // 2. Build prompts and call AI with the user's own API key
  try {
    const systemPrompt = getSystemPrompt();
    const userPrompt = buildUserPrompt(body.architecture, body.options);
    const files = await generateCode({
      systemPrompt,
      userPrompt,
      provider: body.aiConfig.provider,
      apiKey: body.aiConfig.apiKey,
      model: body.aiConfig.model,
    });

    const response: GenerationResponse = { files };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Code generation failed';
    console.error('[generate] AI error:', message);
    return errorResponse('AI_ERROR', message, 502);
  }
}
