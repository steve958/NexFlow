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
- **Canvas-based Diagramming**: Custom HTML5 Canvas implementation with advanced features
- **Real-time Collaboration**: Live cursor tracking and presence indicators via Firebase Realtime Database
- **State Management**: Local React state with history management for undo/redo
- **Animation System**: GSAP-powered packet animations along connection paths

### Key Components
- `src/app/page.tsx`: Landing page with demo scene link
- `src/app/app/[scene]/page.tsx`: Dynamic scene editor with authentication gate
- `src/components/`:
  - `ModernDiagramCanvas.tsx`: Main canvas-based diagram editor (2300+ lines)
  - `AuthGate.tsx`: Firebase Google authentication wrapper with SSR safety
  - `ClientOnly.tsx`: Client-side rendering wrapper component
  - Animation components: `AnimationPanel.tsx`, `EdgeAnimationPanel.tsx`, `SimpleAnimationPanel.tsx`
- `src/hooks/`: Animation management hooks (`useAnimationManager.ts`, `useEdgeAnimations.ts`, etc.)
- `src/lib/`:
  - `firestoreClient.ts`: Firebase configuration and client setup
  - `animationTypes.ts`: TypeScript interfaces for animation system

### Canvas Architecture
The main diagram editor (`ModernDiagramCanvas.tsx`) is a sophisticated canvas-based implementation featuring:
- **Custom Node System**: 14 predefined node templates (service, database, cloud, API, etc.)
- **Advanced Edge Rendering**: Bezier curves with customizable styling and animations
- **Packet Animation System**: Configurable animated particles flowing along edges
- **Viewport Management**: Zoom, pan, and grid snapping with minimap
- **Interaction Handling**: Drag-and-drop, multi-select, connection creation
- **Export Capabilities**: PNG, SVG, and JSON export functionality
- **History System**: Undo/redo with 50-state limit

### Animation System
- **GSAP Integration**: Professional-grade animations via GSAP library
- **Packet Animations**: Customizable shapes, colors, trails, and timing
- **Path Following**: Bezier curve interpolation for smooth motion
- **Animation Manager**: Centralized control with pause/resume/stop functionality

### Technology Stack
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Database**: Firebase (Firestore + Realtime Database)
- **Authentication**: Firebase Auth with Google provider
- **Canvas Rendering**: HTML5 Canvas with custom drawing functions
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

### Development Patterns
- **Client-Side Rendering**: Heavy use of `"use client"` directives and `ClientOnly` wrapper
- **State Management**: Local React state with useCallback optimization for performance
- **Event Handling**: Comprehensive mouse/keyboard interactions with proper cleanup
- **Type Safety**: Strong TypeScript interfaces for nodes, edges, animations, and viewport state

## Keyboard Shortcuts & Interactions

### Keyboard Shortcuts
- **Ctrl/Cmd + Z**: Undo (50-state history limit)
- **Ctrl/Cmd + Y / Ctrl/Cmd + Shift + Z**: Redo
- **Ctrl/Cmd + S**: Export as JSON
- **Ctrl/Cmd + D**: Duplicate selected nodes
- **Ctrl/Cmd + 0**: Reset zoom and pan to default
- **Delete/Backspace**: Delete selected nodes or edges
- **Ctrl/Cmd + Click**: Multi-select nodes

### Canvas
- **Drag templates from sidebar**: Create new nodes
- **Click connection handles**: Start/complete edge connections (blue circles on node sides)
- **Middle mouse + drag**: Pan canvas
- **Mouse wheel**: Zoom in/out
- **Drag nodes**: Move with grid snapping (20px grid)
- **Click edge midpoint**: Select edge for editing
- **Right-click node handles**: Connection creation workflow

## Development Workflows

### Node Types
1. Update `NODE_TEMPLATES` array in `ModernDiagramCanvas.tsx:83-180`
2. Add icon drawing logic in `drawNode` function around line 894-1011
3. Update TypeScript `Node['type']` union type at line 12
4. Test drag-and-drop creation and property editing

### Animation System
1. Modify animation interfaces in `src/lib/animationTypes.ts`
2. Update `useAnimationManager.ts` for new animation behaviors
3. Add UI controls in animation panel components
4. Test GSAP timeline integration and cleanup

### Performance Tips
1. Canvas rendering occurs at 60fps via `requestAnimationFrame`
2. History system limited to 50 states to prevent memory issues
3. Packet animations auto-cleanup when reaching edge endpoints
4. Grid rendering optimized with viewport culling

## Troubleshooting

### Canvas Issues
- **Elements not appearing**: Check `isVisible` property on nodes/edges
- **Animation performance**: Reduce packet frequency or disable trails
- **Viewport transforms**: Ensure coordinate transformation in animation manager
- **Memory leaks**: Verify GSAP timeline cleanup in `stopAnimation`

### Firebase Integration
- **Authentication errors**: Verify all 5 required `NEXT_PUBLIC_FB_*` environment variables
- **SSR hydration**: Use `ClientOnly` wrapper for Firebase-dependent components
- **Real-time features**: Ensure Realtime Database URL is configured (separate from Firestore)

### Dev Environment
- **Build errors**: Use `npm run dev` with Turbopack for faster builds
- **TypeScript issues**: Path alias `@/*` maps to `src/*` - verify import paths
- **Hot reload**: Canvas state may not persist between hot reloads

## Performance

### Canvas
- **Rendering**: Custom canvas drawing optimized for 60fps
- **Memory Management**: 50-state undo/redo history limit
- **Animation Cleanup**: GSAP timelines automatically disposed
- **Grid Snapping**: 20px grid reduces coordinate calculations

### State
- **Local State**: No external state management library - uses React state
- **History Debouncing**: 300ms debounce on history saves
- **Event Handlers**: useCallback optimization throughout
- **Viewport Transforms**: Cached coordinate transformations

### Animations
- **Packet Limits**: No hard limit - monitor performance with many active animations
- **Trail Effects**: CPU-intensive - use sparingly
- **GSAP Integration**: Professional animation library for smooth performance
- **Frame Counting**: Internal frame counter for animation timing

## Testing & Debug

### Testing
- **Current State**: No Jest/Vitest test setup
- **Manual Testing**: Use demo scene at `/app/demo`
- **Browser DevTools**: Console logging in animation manager for debugging
- **Firebase Testing**: Use Firebase console for auth/database inspection

### Debug
- **Animation Debug**: Console logging in `useAnimationManager.ts`
- **Canvas Bounds**: Check container dimensions and element positioning
- **State Inspection**: React DevTools for component state
- **Performance**: Browser Performance tab for canvas rendering analysis