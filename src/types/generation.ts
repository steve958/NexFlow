// ─── Code Generation Types ───────────────────────────────────────────────────

export type AIProvider = 'anthropic' | 'openai';

export type FrameworkOption =
  | 'typescript-express'
  | 'typescript-nestjs'
  | 'python-fastapi'
  | 'go-gin'
  | 'java-spring';

export type InfrastructureOption =
  | 'docker-compose'
  | 'kubernetes'
  | 'terraform'
  | 'pulumi'
  | 'aws-cdk';

export type ORMOption =
  | 'prisma'
  | 'typeorm'
  | 'drizzle'
  | 'sqlalchemy'
  | 'gorm'
  | 'none';

export type IncludeOption =
  | 'api-stubs'
  | 'db-schemas'
  | 'dockerfiles'
  | 'cicd'
  | 'readme'
  | 'env-example';

// ─── Serialized Architecture (AI-friendly, no visual props) ──────────────────

export interface SerializedService {
  id: string;
  name: string;
  type: string;
  description: string;
  group?: string;
}

export interface SerializedConnection {
  from: string;
  to: string;
  protocol: string;
  description: string;
  bidirectional: boolean;
}

export interface SerializedGroup {
  name: string;
  description: string;
  memberIds: string[];
}

export interface SerializedArchitecture {
  services: SerializedService[];
  connections: SerializedConnection[];
  groups: SerializedGroup[];
}

// ─── Generation Options (user-selected in the UI panel) ──────────────────────

export interface GenerationOptions {
  framework: FrameworkOption;
  infrastructure: InfrastructureOption[];
  orm: ORMOption;
  includes: IncludeOption[];
  additionalInstructions: string;
}

// ─── AI Configuration (per-user, stored in localStorage) ─────────────────────

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
};

export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI (GPT)',
};

// ─── API Request / Response ──────────────────────────────────────────────────

export interface GenerationRequest {
  architecture: SerializedArchitecture;
  options: GenerationOptions;
  aiConfig: AIConfig;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface GenerationResponse {
  files: GeneratedFile[];
}

export interface GenerationError {
  error: string;
  code: 'VALIDATION_ERROR' | 'AI_ERROR' | 'INTERNAL_ERROR';
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  files: GeneratedFile[];
  error: string | null;
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const FRAMEWORK_LABELS: Record<FrameworkOption, string> = {
  'typescript-express': 'TypeScript + Express',
  'typescript-nestjs': 'TypeScript + NestJS',
  'python-fastapi': 'Python + FastAPI',
  'go-gin': 'Go + Gin',
  'java-spring': 'Java + Spring Boot',
};

export const INFRASTRUCTURE_LABELS: Record<InfrastructureOption, string> = {
  'docker-compose': 'Docker Compose',
  'kubernetes': 'Kubernetes',
  'terraform': 'Terraform',
  'pulumi': 'Pulumi',
  'aws-cdk': 'AWS CDK',
};

export const ORM_LABELS: Record<ORMOption, string> = {
  prisma: 'Prisma',
  typeorm: 'TypeORM',
  drizzle: 'Drizzle',
  sqlalchemy: 'SQLAlchemy',
  gorm: 'GORM',
  none: 'None',
};

export const INCLUDE_LABELS: Record<IncludeOption, string> = {
  'api-stubs': 'API Stubs',
  'db-schemas': 'DB Schemas & Migrations',
  'dockerfiles': 'Dockerfiles',
  'cicd': 'CI/CD Pipeline',
  'readme': 'README',
  'env-example': '.env.example',
};
