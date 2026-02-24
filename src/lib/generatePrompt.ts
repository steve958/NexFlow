import type {
  SerializedArchitecture,
  GenerationOptions,
  FrameworkOption,
} from '@/types/generation';

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert software architect and senior developer. Given a structured architecture diagram, you generate production-ready project scaffolding.

## Output Format
You MUST respond with a single JSON code block containing an array of file objects. Each file object has exactly three fields:
- "path": relative file path from project root (e.g. "src/services/userService.ts")
- "content": the complete file content as a string
- "language": the programming language / file type (e.g. "typescript", "yaml", "dockerfile", "json", "markdown")

Example response format:
\`\`\`json
[
  {
    "path": "src/index.ts",
    "content": "import express from 'express';\\nconst app = express();\\n...",
    "language": "typescript"
  }
]
\`\`\`

## Rules
1. Generate real, runnable code — NOT pseudocode or placeholders.
2. Include proper imports, error handling, and environment variable references.
3. Each file should be self-contained enough to compile or run.
4. Use modern best practices for the chosen framework.
5. Include TypeScript types / interfaces where applicable.
6. Reference environment variables via process.env (or framework equivalent) — never hardcode secrets.
7. Add brief inline comments explaining non-obvious design decisions.
8. For database schemas, generate both the schema definition and a migration if applicable.
9. For Docker files, use multi-stage builds where appropriate.
10. For CI/CD, generate GitHub Actions workflows by default.

## Architecture Component Mapping
When you encounter these component types in the architecture, generate the corresponding infrastructure:

- Microservice → Service entry point, routes, controllers, health check endpoint
- Database → Schema definitions, ORM models, migration files, connection config
- Message broker / queue → Producer and consumer modules, topic/queue definitions
- Cache layer → Cache client wrapper with TTL configuration, cache middleware
- API gateway / proxy → Route definitions, middleware chain, rate limiting config
- Authentication service → Auth middleware, JWT/session handling, guards
- Web application / Mobile app → Typed API client with endpoints matching the backend
- Container / Docker → Dockerfile, docker-compose service entry
- Monitoring / observability → Health check endpoints, logging middleware, metrics setup
- Scheduled job / cron → Cron job definitions with scheduling config
- Secrets / vault → .env.example with placeholder values, config loader
- CI/CD pipeline → GitHub Actions workflow with build, test, deploy stages
- Load balancer → Nginx or HAProxy config
- File / object storage → Storage client wrapper, upload/download utilities
- Event streaming → Event producer/consumer, schema definitions

## Connection Protocol Mapping
Use edge protocols to determine communication patterns:
- HTTP/REST → HTTP client/server with typed request/response
- gRPC → .proto file definitions + generated stubs
- WebSocket → WS connection handling with event types
- Database query → Repository pattern with typed queries
- Pub/Sub → Publish/subscribe handlers with message schemas
- Event → Event-driven handlers with event type definitions
- GraphQL → Schema definitions + resolvers
- AMQP / MQTT → Broker client with connection and channel setup

Do NOT include any text outside the JSON code block. Your entire response must be the JSON code block and nothing else.`;

// ─── Framework-specific hints ────────────────────────────────────────────────

const FRAMEWORK_HINTS: Record<FrameworkOption, string> = {
  'typescript-express':
    'Use Express.js with TypeScript. Use express.Router for modular routes. Use cors, helmet, and express-json middleware. Export types from a shared types/ directory.',
  'typescript-nestjs':
    'Use NestJS with TypeScript. Use modules, controllers, services, and DTOs. Use class-validator for validation. Use dependency injection throughout.',
  'python-fastapi':
    'Use FastAPI with Python 3.11+. Use Pydantic models for request/response validation. Use async/await. Use dependency injection via Depends().',
  'go-gin':
    'Use Gin framework with Go. Use struct tags for JSON binding. Use middleware for auth/logging. Organize into handlers/, models/, and services/ packages.',
  'java-spring':
    'Use Spring Boot with Java 17+. Use @RestController, @Service, @Repository annotations. Use Spring Data JPA for database access. Use records for DTOs.',
};

// ─── User prompt builder ─────────────────────────────────────────────────────

export function buildUserPrompt(
  architecture: SerializedArchitecture,
  options: GenerationOptions,
): string {
  const parts: string[] = [];

  // 1. Architecture context
  parts.push('## Architecture Diagram\n');
  parts.push('```json');
  parts.push(JSON.stringify(architecture, null, 2));
  parts.push('```\n');

  // 2. Framework
  parts.push(`## Selected Framework: ${options.framework}`);
  parts.push(FRAMEWORK_HINTS[options.framework]);
  parts.push('');

  // 3. ORM
  if (options.orm !== 'none') {
    parts.push(`## Database ORM: ${options.orm}`);
    parts.push(
      `Use ${options.orm} for all database models, schemas, and migrations.`,
    );
    parts.push('');
  }

  // 4. Infrastructure
  if (options.infrastructure.length > 0) {
    parts.push(
      `## Infrastructure: ${options.infrastructure.join(', ')}`,
    );
    parts.push(
      'Generate infrastructure-as-code files for the selected tools.',
    );
    parts.push('');
  }

  // 5. Includes
  if (options.includes.length > 0) {
    parts.push(`## Include the following:\n${options.includes.map((i) => `- ${i}`).join('\n')}`);
    parts.push('');
  }

  // 6. Additional user instructions
  if (options.additionalInstructions.trim()) {
    parts.push(`## Additional Instructions\n${options.additionalInstructions.trim()}`);
    parts.push('');
  }

  // 7. Final directive
  parts.push(
    'Generate the complete project scaffolding as a JSON array of file objects. Make sure every file is production-quality and follows the framework conventions.',
  );

  return parts.join('\n');
}

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}
