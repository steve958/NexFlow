# AI Code Generation

Generate production-ready project scaffolding directly from your architecture diagrams using AI.

## Quick Start

1. Design your architecture diagram on the canvas
2. Click the **⚡ Generate** button in the toolbar
3. Enter your AI API key (first time only — it's saved for next time)
4. Choose your framework, ORM, and infrastructure options
5. Click **Generate Code**
6. Browse the generated files, copy individual files, or **Download ZIP**

---

## Setting Up Your AI Provider

NexFlow uses **your own** AI API key — we never store it on our servers. The key is saved in your browser's local storage so you only need to enter it once.

### Anthropic (Claude) — Recommended

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account and add billing
3. Navigate to **API Keys** and create a new key
4. Copy the key (starts with `sk-ant-...`)
5. Paste it into the **API Key** field in the Generate Code panel

Default model: `claude-sonnet-4-20250514`

### OpenAI (GPT)

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Create an account and add billing
3. Navigate to **API Keys** and create a new key
4. Copy the key (starts with `sk-...`)
5. In the Generate Code panel, switch the **Provider** dropdown to **OpenAI (GPT)**
6. Paste your key

Default model: `gpt-4o`

### Changing the Model

The **Model** field auto-fills with the recommended model for your chosen provider. You can override it with any model your API key has access to, for example:

- Anthropic: `claude-sonnet-4-20250514`, `claude-3-5-haiku-20241022`
- OpenAI: `gpt-4o`, `gpt-4o-mini`

---

## Generation Options

### Framework

Choose the language and framework for the generated backend code:

| Option | What you get |
|---|---|
| TypeScript + Express | Express.js with TypeScript, modular routes, cors/helmet middleware |
| TypeScript + NestJS | NestJS modules, controllers, services, DTOs, dependency injection |
| Python + FastAPI | FastAPI with Pydantic models, async/await, Depends() |
| Go + Gin | Gin handlers, struct tags, middleware, organized packages |
| Java + Spring Boot | Spring Boot with @RestController, @Service, Spring Data JPA |

### Database ORM

If your diagram contains database nodes, select an ORM to generate schemas and migrations:

- **Prisma** — TypeScript (default when database nodes are present)
- **TypeORM** — TypeScript
- **Drizzle** — TypeScript
- **SQLAlchemy** — Python
- **GORM** — Go
- **None** — Skip ORM generation

### Infrastructure

Select one or more infrastructure-as-code tools:

- **Docker Compose** — auto-selected when container nodes are present
- **Kubernetes** — K8s manifests (Deployments, Services, ConfigMaps)
- **Terraform** — HCL resource definitions
- **Pulumi** — Infrastructure as code in your chosen language
- **AWS CDK** — AWS Cloud Development Kit constructs

### Include

Toggle which file types to generate:

- **API Stubs** — Route handlers and controllers (on by default)
- **DB Schemas & Migrations** — Database models and migration files
- **Dockerfiles** — Multi-stage Docker builds
- **CI/CD Pipeline** — GitHub Actions workflows
- **README** — Project documentation (on by default)
- **.env.example** — Environment variable template (on by default)

### Additional Instructions

Free-text field for extra context. Examples:

- "Use PostgreSQL for all databases"
- "Deploy to AWS ECS with Fargate"
- "Add JWT authentication with refresh tokens"
- "Use Redis for session storage"
- "Include Swagger/OpenAPI documentation"

---

## How It Works

1. **Serialization** — Your diagram is converted into a clean semantic JSON representation. All visual properties (positions, colors, shapes) are stripped. Only the meaningful parts remain: node types, labels, descriptions, connections, protocols, and group memberships.

2. **Prompt Construction** — The semantic JSON is combined with your selected options into a structured prompt. Each of the 35+ node types (service, database, queue, cache, gateway, auth, etc.) maps to specific infrastructure patterns. Edge labels (HTTP, gRPC, WebSocket, queries, publishes) determine communication patterns.

3. **AI Generation** — The prompt is sent to your chosen AI provider through our server (to avoid browser CORS issues). The AI returns a structured list of files.

4. **Validation** — The response is validated to ensure every file has a path, content, and language identifier. If parsing fails, the system retries once automatically.

5. **Preview & Download** — Files are displayed in a navigable tree with a code viewer. You can copy individual files or download everything as a ZIP.

---

## Tips for Best Results

- **Label your nodes descriptively** — "User Service" is better than "Service 1"
- **Add descriptions to nodes** — Click a node and fill in the description field to give the AI more context
- **Label your edges** — Connection labels like "HTTP", "gRPC", "queries", "publishes" help the AI generate the right communication patterns
- **Use groups** — Group related nodes (e.g., "Backend Services", "Data Layer") to help the AI understand logical boundaries
- **Keep diagrams under 50 nodes** — For larger diagrams, consider generating code per-group
- **Use additional instructions** — Be specific about database choices, deployment targets, and authentication approaches

---

## Code Preview Panel

After generation completes, you'll see a full-screen preview:

- **Left sidebar** — Collapsible file tree (folders first, then files, alphabetically)
- **Right pane** — Code viewer for the selected file
- **Copy** — Copy the current file's content to clipboard
- **Download ZIP** — Download all generated files as a single ZIP archive
- **Regenerate** — Go back to the options panel to adjust settings and regenerate

---

## FAQ

**Where is my API key stored?**
In your browser's `localStorage` only. It is never saved to any database or server. If you clear your browser data, you'll need to re-enter it.

**Does NexFlow see my API key?**
The key passes through our server only to proxy the request to the AI provider (required to avoid browser CORS restrictions). It is not logged or stored.

**How much does generation cost?**
Typically $0.03–0.10 per generation depending on diagram complexity and the model you choose. This is billed directly by your AI provider.

**Can I use a different AI model?**
Yes — type any model identifier into the Model field that your API key has access to.

**What if generation fails?**
Check that your API key is valid and has billing enabled. The error message from the AI provider will be shown in the panel. You can also try a different model or simplify your diagram.

**Is there a limit on how many times I can generate?**
No limit from NexFlow. Your AI provider may have their own rate limits based on your plan.
