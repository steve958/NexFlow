# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project type: Next.js (App Router) + TypeScript + Tailwind CSS + Firebase (Auth, Firestore, Realtime Database)

Commands

- Dev server (from repo root or workspace root if scripts live there):
  ```bash path=null start=null
  # Preferred (package scripts)
  npm run dev
  # or
  yarn dev
  # or
  pnpm dev
  # or
  bun dev
  ```
  ```bash path=null start=null
  # Fallback (direct Next.js CLIs)
  npx next dev
  ```
- Build and run production:
  ```bash path=null start=null
  npm run build && npm start
  ```
  ```bash path=null start=null
  # Fallback
  npx next build && npx next start -p 3000
  ```
- Lint:
  ```bash path=null start=null
  npm run lint
  ```
  ```bash path=null start=null
  # Fallback
  npx next lint
  ```
- Tests: No test setup was found in this repo (no config or scripts detected).

Environment and setup

- Required environment variables (client-safe NEXT_PUBLIC_*), used by src/lib/firestoreClient.ts:
  - NEXT_PUBLIC_FB_API_KEY
  - NEXT_PUBLIC_FB_AUTH_DOMAIN
  - NEXT_PUBLIC_FB_PROJECT_ID
  - NEXT_PUBLIC_FB_APP_ID
  - NEXT_PUBLIC_FB_DATABASE_URL
- Create a .env.local file in the project root (not committed) and define the above. Example (values redacted):
  ```bash path=null start=null
  NEXT_PUBLIC_FB_API_KEY=...
  NEXT_PUBLIC_FB_AUTH_DOMAIN=...
  NEXT_PUBLIC_FB_PROJECT_ID=...
  NEXT_PUBLIC_FB_APP_ID=...
  NEXT_PUBLIC_FB_DATABASE_URL=...
  ```
- Path alias: imports use "@/" (e.g., "@/components/...") which implies a tsconfig/jsconfig path mapping to the repo’s src directory.
- Styling: Tailwind CSS is used via src/app/globals.css; ensure Tailwind/PostCSS config exists at the workspace root if not present here.

High-level architecture

- App framework: Next.js App Router under src/app
  - src/app/layout.tsx sets up the ThemeProvider and Vercel Analytics.
  - src/app/page.tsx renders the dashboard (projects, profile, activity) behind AuthGate.
  - src/app/app/[scene]/page.tsx loads the canvas view for a project id ("scene").
- UI and theming
  - Global theme via components/ThemeProvider (HTML data-theme toggling) and a canvas-specific theme via components/CanvasThemeProvider.
  - Tailwind-driven styling with CSS variables defined in src/app/globals.css.
- Core canvas editor
  - components/ModernDiagramCanvas.tsx implements an interactive diagram editor on HTML Canvas.
    - Defines node/edge/group models, selection, history (undo/redo), and flow/animation configs.
    - Integrates export utilities and video recording panel.
- Export and media
  - src/lib/exportUtils.ts provides high-quality PNG/SVG/PDF exports and JPG conversion; PDF uses jsPDF at runtime.
  - components/VideoExportPanel.tsx + hooks/useVideoRecorder.ts wrap MediaRecorder to record the live canvas; recording writes to a Blob and offers download.
- Templates and layout
  - src/lib/templateStorage.ts provides built-in architecture templates (in-memory definitions) used by components/TemplateBrowser.tsx.
  - src/lib/autoLayout.ts applies preset layouts to nodes/edges for quick arrangement.
- Data and auth (Firebase)
  - src/lib/firestoreClient.ts initializes Firebase client-side only and exposes helpers for Auth, Firestore, and Realtime Database.
  - src/lib/projectStorage.ts CRUDs projects in Firestore; shows a demo project when unauthenticated; supports real-time subscriptions (onSnapshot).
  - src/lib/userStorage.ts manages user profiles/stats/preferences in Firestore.
  - src/lib/activityStorage.ts logs and retrieves user activities.
- Presence and collaboration
  - src/hooks/usePresence.ts and useCursorBroadcast.ts implement lightweight presence and cursor broadcasting via Firebase Realtime Database under presence/{sceneId}/{uid} with server-side timestamps and onDisconnect cleanup.
  - src/app/app/[scene]/presence-client.tsx renders PresenceBadge and CursorOverlay over the editor.

Routing and user flow

- "/": AuthGate-protected dashboard with projects (via projectStorage), profile editing (userStorage), and activity feed (activityStorage).
- "/app/[scene]": Canvas editor for a given project id. "demo" id loads a local demo project.

Other notes for agents

- .claude/settings.local.json whitelists typical Next.js commands (next dev/build, npm run dev/build/lint). If scripts aren’t found in this folder, run the direct Next.js CLIs from the repo root.
- If imports like "@/..." fail, ensure the workspace tsconfig/jsconfig defines the "@" alias to the src directory.
