# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses --turbopack for faster builds)
- **Build**: `npm run build` (uses --turbopack for faster builds)
- **Production server**: `npm start`
- **Lint**: `npm run lint` (uses ESLint)

## Project Architecture

**NexFlow** is a collaborative diagram editor for system architecture visualization built with Next.js 15, React 19, and Firebase.

### Core Architecture
- **Next.js App Router**: Uses the new app directory structure (`src/app/`)
- **Firebase Integration**: Authentication (Google), Firestore, and Realtime Database for collaboration
- **ReactFlow**: Primary diagramming library for node-based canvas editing
- **Real-time Collaboration**: Live cursor tracking and presence indicators via Firebase Realtime Database
- **State Management**: Zustand for client-side state, Firebase for persistence

### Key Directories
- `src/app/`: Next.js app router pages
  - `page.tsx`: Landing page with demo link
  - `app/[scene]/`: Dynamic scene editor with authentication gate
- `src/components/`: Reusable React components
  - `EditorCanvas.tsx`: Main ReactFlow diagram editor
  - `AuthGate.tsx`: Firebase Google authentication wrapper
  - `PresenceClient.tsx`: Real-time collaboration features
  - `CustomNode.tsx`: Custom ReactFlow node types
- `src/hooks/`: Custom React hooks for presence and cursor broadcasting
- `src/lib/`: Firebase configuration and utilities

### Technology Stack
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Database**: Firebase (Firestore + Realtime Database)
- **Authentication**: Firebase Auth with Google provider
- **Diagramming**: ReactFlow for node-based editing
- **Animation**: GSAP for diagram animations, Framer Motion for UI
- **Forms**: React Hook Form with Zod validation
- **Layout**: ELK.js for automatic graph layout

### Firebase Environment Variables
The app requires these environment variables for Firebase:
- `NEXT_PUBLIC_FB_API_KEY`
- `NEXT_PUBLIC_FB_AUTH_DOMAIN`
- `NEXT_PUBLIC_FB_PROJECT_ID`
- `NEXT_PUBLIC_FB_APP_ID`
- `NEXT_PUBLIC_FB_DATABASE_URL`

### TypeScript Configuration
- Path aliases: `@/*` maps to `src/*`
- Strict TypeScript settings enabled
- ES2022 target with ESNext modules
- Bundler module resolution for Next.js compatibility