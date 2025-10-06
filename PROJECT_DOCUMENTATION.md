# NexFlow - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Target Audience](#target-audience)
3. [Core Features](#core-features)
4. [Technical Architecture](#technical-architecture)
5. [User Interface & Components](#user-interface--components)
6. [Functionality Guide](#functionality-guide)
7. [Data Management](#data-management)
8. [Collaboration Features](#collaboration-features)
9. [Export & Import Capabilities](#export--import-capabilities)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Development & Deployment](#development--deployment)

---

## Project Overview

**NexFlow** is a modern, collaborative diagram editor designed for creating and visualizing system architecture diagrams. Built with cutting-edge web technologies (Next.js 15, React 19, Firebase), NexFlow provides a powerful yet intuitive canvas-based interface for designing complex system architectures, network topologies, cloud infrastructures, and more.

### Key Highlights
- **Real-time Collaboration**: Live cursor tracking and presence indicators
- **Professional Diagramming**: 32+ pre-built node templates for various system components
- **Animation System**: GSAP-powered packet animations along connection paths
- **Cloud-Based**: Firebase authentication and storage for seamless cross-device access
- **Export Options**: PNG, SVG, JSON, and video export capabilities
- **Template Library**: Pre-built architecture templates to jumpstart projects
- **Theme Support**: Dark/light mode with customizable canvas themes

---

## Target Audience

### Primary Users

#### 1. **Software Architects & Engineers**
- Designing microservices architectures
- Planning cloud infrastructure deployments
- Documenting system integrations
- Creating API flow diagrams

#### 2. **DevOps & Infrastructure Teams**
- Visualizing CI/CD pipelines
- Mapping network topologies
- Planning container orchestration
- Designing deployment strategies

#### 3. **Technical Product Managers**
- Communicating technical concepts to stakeholders
- Planning product architecture roadmaps
- Creating technical documentation
- Presenting system overviews

#### 4. **Students & Educators**
- Learning system design concepts
- Teaching distributed systems
- Creating educational diagrams
- Academic project documentation

#### 5. **IT Consultants & Solution Architects**
- Client proposal presentations
- Solution design documentation
- Technical feasibility assessments
- Infrastructure planning

### Use Cases
- System architecture documentation
- Cloud infrastructure planning
- Microservices design
- Network topology mapping
- Data flow visualization
- Security architecture design
- Mobile backend planning
- CI/CD pipeline design
- API integration mapping
- Container orchestration planning

---

## Core Features

### 1. **Canvas-Based Diagram Editor**
- **HTML5 Canvas Rendering**: High-performance 60fps rendering
- **Infinite Canvas**: Pan and zoom with smooth viewport controls
- **Grid Snapping**: 20px grid for precise element alignment
- **Multi-Selection**: Select and manipulate multiple nodes simultaneously
- **Drag & Drop**: Intuitive node creation from sidebar templates
- **Minimap**: Bird's-eye view of entire diagram for navigation

### 2. **Node System (32+ Templates)**

#### Service & Infrastructure Nodes
- **Service**: Generic application services
- **Server**: Physical/virtual servers
- **Database**: Data storage systems
- **Queue**: Message queuing systems
- **Gateway**: API gateways and proxies

#### Cloud & Platform Nodes
- **Cloud**: Cloud platforms and services
- **Compute**: Compute instances and VMs
- **Storage**: Cloud storage services
- **Network**: Networking components
- **Container**: Docker/Kubernetes containers

#### Application Layer Nodes
- **Frontend**: Web applications and UIs
- **Mobile**: Mobile applications
- **API**: REST/GraphQL APIs
- **Endpoint**: Service endpoints
- **Router**: Application routing

#### Specialized Nodes
- **Security**: Authentication/authorization systems
- **Auth**: Identity management
- **Secrets**: Secret management systems
- **Cache**: Caching layers (Redis, Memcached)
- **Search**: Search engines (Elasticsearch)
- **Analytics**: Analytics platforms
- **Monitor**: Monitoring & observability
- **Email**: Email services
- **Chat**: Messaging systems
- **Notification**: Push notification services
- **Streaming**: Real-time streaming services
- **Timer**: Scheduled jobs and cron
- **Scheduler**: Task scheduling systems
- **Workflow**: Workflow engines
- **CI/CD**: Continuous integration/deployment
- **Docs**: Documentation systems
- **Config**: Configuration management
- **Code**: Source code repositories
- **Users**: User management systems

### 3. **Connection & Edge System**
- **Bezier Curves**: Smooth, customizable connection paths
- **Multiple Handles**: Top, bottom, left, right connection points
- **Bidirectional Arrows**: Two-way data flow indicators
- **Bounce Animation**: Packet bounce effect on edges
- **Edge Styling**: Solid, dashed, or dotted lines
- **Edge Labels**: Descriptive text on connections
- **Curvature Control**: Adjustable curve intensity
- **Arrow Size Control**: Customizable arrow head size

### 4. **Animation System**

#### Packet Animations
- **Shape Options**: Circle, square, diamond, triangle
- **Color Customization**: Any hex color
- **Size Control**: Adjustable packet size (2-20px)
- **Speed Control**: Variable animation speed (0.1-5x)
- **Frequency Control**: Packets per second (0.1-10)
- **Trail Effect**: Optional motion trail behind packets
- **Directional Flow**: Forward or reverse direction
- **GSAP Integration**: Professional-grade animation library

#### Animation Controls
- **Play/Pause**: Global animation control
- **Per-Edge Control**: Individual edge animation settings
- **Auto-Cleanup**: Memory management for completed animations
- **Performance Optimized**: Efficient rendering with requestAnimationFrame

### 5. **Node Grouping & Containers**
- **Create Groups**: Organize related nodes into logical containers
- **Collapsible Groups**: Expand/collapse to manage complexity
- **Visual Hierarchy**: Color-coded group boundaries
- **Group Membership**: Drag nodes in/out of groups
- **Nested Support**: Groups within groups (planned)

### 6. **Auto-Layout Engine**
- **ELK.js Integration**: Professional graph layout algorithms
- **Layout Presets**:
  - Horizontal flow (left-to-right)
  - Vertical flow (top-to-bottom)
  - Radial layout
  - Force-directed layout
- **Spacing Control**: Adjustable node spacing
- **Automatic Routing**: Smart edge path calculation

### 7. **History Management**
- **Undo/Redo**: 50-state history buffer
- **Keyboard Shortcuts**: Ctrl/Cmd+Z (undo), Ctrl/Cmd+Y (redo)
- **State Preservation**: Nodes, edges, groups, viewport, animations
- **Debouncing**: 300ms debounce to prevent excessive history saves

---

## Technical Architecture

### Technology Stack

#### Frontend Framework
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Strict type safety (ES2022 target)
- **Tailwind CSS v4**: Utility-first styling with custom design tokens

#### State Management
- **React State**: Local component state with hooks
- **useCallback/useMemo**: Performance optimization
- **useRef**: DOM references and mutable values
- **Custom Hooks**: Reusable state logic

#### Backend & Database
- **Firebase Authentication**: Google OAuth integration
- **Firestore**: Document database for project storage
- **Realtime Database**: Live presence and cursor tracking
- **Cloud Storage**: File uploads and media (future)

#### Animation & Graphics
- **HTML5 Canvas**: Direct pixel manipulation for performance
- **GSAP (GreenSock)**: Professional animation library
- **Framer Motion**: UI component animations
- **Custom Rendering**: 60fps canvas drawing loop

#### Developer Tools
- **ESLint**: Code quality and consistency
- **Turbopack**: Ultra-fast bundler (Next.js 15)
- **Git**: Version control
- **npm**: Package management

### Project Structure

```
nexflow/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Landing page & dashboard
│   │   ├── app/[scene]/         # Dynamic scene editor routes
│   │   │   └── page.tsx         # Canvas editor page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── ModernDiagramCanvas.tsx       # Main canvas editor (5450+ lines)
│   │   ├── AuthGate.tsx                  # Firebase auth wrapper
│   │   ├── ClientOnly.tsx                # SSR safety wrapper
│   │   ├── ThemeProvider.tsx             # Theme context
│   │   ├── ThemeToggle.tsx               # Theme switcher
│   │   ├── CanvasThemeProvider.tsx       # Canvas-specific themes
│   │   ├── CanvasThemeToggle.tsx         # Canvas theme switcher
│   │   ├── KeyboardShortcutsPanel.tsx    # Help modal
│   │   ├── NodeGroupManager.tsx          # Group management
│   │   ├── CustomNodeBuilder.tsx         # Custom node creator
│   │   ├── SimpleAnimationPanel.tsx      # Animation controls
│   │   ├── CursorOverlay.tsx             # Collaborative cursors
│   │   ├── PresenceBadge.tsx             # User presence indicator
│   │   ├── TemplateBrowser.tsx           # Template library modal
│   │   ├── ConfirmationModal.tsx         # Confirmation dialogs
│   │   ├── UnsavedChangesModal.tsx       # Unsaved changes warning
│   │   └── VideoExportPanel.tsx          # Video export UI
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAnimationManager.ts        # GSAP animation control
│   │   ├── useEdgeAnimations.ts          # Edge-specific animations
│   │   ├── useSimpleAnimations.ts        # Basic animations
│   │   ├── usePresence.ts                # User presence tracking
│   │   ├── useCursorBroadcast.ts         # Cursor position sharing
│   │   └── useCanvasTheme.ts             # Canvas theme hook
│   │
│   └── lib/                     # Utilities & libraries
│       ├── firestoreClient.ts            # Firebase config & client
│       ├── animationTypes.ts             # Animation TypeScript types
│       ├── autoLayout.ts                 # ELK.js layout engine
│       ├── exportUtils.ts                # Export utilities (PNG/SVG/JSON)
│       ├── userStorage.ts                # User profile management
│       ├── projectStorage.ts             # Project CRUD operations
│       └── templateStorage.ts            # Template management
│
├── public/                      # Static assets
├── .env.local                   # Environment variables (not in git)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

### Key Configuration Files

#### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_FB_API_KEY=your_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
NEXT_PUBLIC_FB_APP_ID=your_app_id
NEXT_PUBLIC_FB_DATABASE_URL=your_database_url
```

#### TypeScript Path Aliases
- `@/*` → `src/*`

### Architecture Patterns

#### Client-Side Rendering
- Heavy use of `"use client"` directive (23 files)
- SSR-safe with `ClientOnly` wrapper component
- Firebase components wrapped to prevent hydration mismatches

#### Performance Optimization
- `useCallback` for event handlers to prevent re-renders
- `useMemo` for expensive computations
- `useRef` for DOM elements and mutable values
- Canvas rendering optimized for 60fps
- Viewport culling for off-screen elements
- 50-state history limit to prevent memory issues

#### Event Handling
- Comprehensive mouse/keyboard interactions
- Proper cleanup in useEffect returns
- Animation disposal on unmount
- Firebase onDisconnect handlers

---

## User Interface & Components

### Landing Page (`/`)

#### Header Section
- **Logo**: NexFlow branding with gradient effect
- **Navigation**: Projects, Templates, Profile tabs
- **User Menu**: Profile picture, settings, sign out
- **Theme Toggle**: Global dark/light mode switch
- **Authentication**: Google sign-in button for guests

#### Dashboard Tab
- **Project Grid**: Visual cards for all user projects
- **Project Actions**:
  - Open project in editor
  - Duplicate project
  - Delete project (with confirmation)
  - View project metadata
- **Create New**: Quick project creation with auto-generated ID
- **Demo Scene**: Link to demo without login
- **Empty State**: Helpful message when no projects exist
- **Loading States**: Skeleton loaders for better UX

#### Templates Tab
- **Template Library**: Browse pre-built architecture templates
- **Categories**:
  - Microservices
  - Cloud Architecture
  - Data & Analytics
  - Mobile Backend
  - Network Topology
  - Security Architecture
- **Template Preview**: Visual representation with stats
- **Search & Filter**: Find templates by name or category
- **Use Template**: One-click project creation from template
- **Responsive Grid**: 1-3 columns based on screen size

#### Profile Tab
- **User Information**:
  - Profile picture (Google avatar)
  - Display name (editable)
  - Email address (read-only)
- **Account Statistics**:
  - Total projects
  - Total nodes created
  - Total connections
  - Member since date
- **Preferences**:
  - Theme toggle (dark/light)
- **Responsive Design**: Mobile-friendly layout

### Canvas Editor (`/app/[scene]`)

#### Top Toolbar
- **Project Name**: Editable project title
- **Save Button**: Manual save with visual feedback
- **Undo/Redo**: History navigation buttons
- **Zoom Controls**: Zoom in, zoom out, reset (Ctrl+0)
- **View Options**:
  - Toggle grid visibility
  - Toggle minimap
  - Toggle animations
- **Export Menu**:
  - Export as PNG
  - Export as JPG
  - Export as SVG
  - Export as JSON
  - Export as Video
- **Settings Menu**:
  - Auto-layout options
  - Canvas theme
  - Keyboard shortcuts
  - Profile settings
- **User Presence**: Active users with colored cursors

#### Left Sidebar (Node Templates)
- **Collapsible Panels**:
  - Service & Infrastructure (7 templates)
  - Cloud & Platform (5 templates)
  - Application Layer (6 templates)
  - Specialized Services (14 templates)
- **Drag & Drop**: Drag templates onto canvas
- **Visual Icons**: Lucide React icons for each type
- **Color-Coded**: Category-based color schemes
- **Search**: Filter templates by name (future)
- **Collapse/Expand**: Toggle sidebar visibility

#### Right Sidebar (Properties Panel)
- **Node Properties** (when node selected):
  - Label text
  - Description
  - Color picker
  - Border color
  - Text color
  - Shape selector (rectangle, rounded, circle, diamond)
  - Font size slider
  - Border width slider
  - Shadow toggle
  - Visibility toggle
  - Delete button
- **Edge Properties** (when edge selected):
  - Label text
  - Color picker
  - Line width slider
  - Line style (solid, dashed, dotted)
  - Curvature slider
  - Arrow size slider
  - Bidirectional toggle
  - Bounce animation toggle
  - Visibility toggle
  - Delete button
  - Animation configuration panel
- **Animation Panel** (for selected edge):
  - Enable/disable toggle
  - Speed slider (0.1-5x)
  - Frequency slider (0.1-10 packets/sec)
  - Size slider (2-20px)
  - Color picker
  - Shape selector
  - Trail effect toggle

#### Canvas Area
- **Infinite Canvas**: Pan with middle mouse or space+drag
- **Grid Background**: Optional 20px grid overlay
- **Node Rendering**: Custom drawn nodes with icons
- **Edge Rendering**: Bezier curves with arrows
- **Connection Handles**: Blue circles on node edges
- **Selection Indicators**: Highlight for selected elements
- **Multi-Selection**: Ctrl+Click or drag selection box
- **Context Actions**: Right-click menus (future)
- **Real-time Cursors**: See collaborators' mouse positions

#### Bottom Toolbar
- **Viewport Info**: Current zoom level and position
- **Element Count**: Nodes, edges, groups statistics
- **Unsaved Changes Indicator**: Dot when changes not saved
- **Performance Info**: FPS counter (debug mode)

#### Modals & Overlays
- **Templates Dialog**: Browse and load diagram templates
- **Keyboard Shortcuts Panel**: Comprehensive shortcut reference
- **Profile Settings**: User account management
- **Confirmation Dialogs**: Delete confirmations, unsaved changes
- **Notification Toasts**: Success/error/info messages
- **Export Options Modal**: Configure export settings
- **Video Export Panel**: Configure video recording

---

## Functionality Guide

### Getting Started

#### 1. **Account Creation**
1. Visit the NexFlow landing page
2. Click "Sign in with Google"
3. Authorize with your Google account
4. Automatically redirected to dashboard

#### 2. **Creating Your First Diagram**
1. Click "New Project" button on dashboard
2. Enter project name and description (optional)
3. Click "Create" to open in editor
4. Start adding nodes from left sidebar
5. Connect nodes by clicking connection handles
6. Customize properties in right sidebar
7. Save with Ctrl+S or Save button

#### 3. **Using Templates**
1. Navigate to "Templates" tab
2. Browse or search for template
3. Click on template to view details
4. Click "Use This Template"
5. New project created with template structure
6. Customize as needed

### Canvas Operations

#### Node Management
- **Create Node**: Drag template from sidebar onto canvas
- **Move Node**: Click and drag node to new position
- **Resize Node**: Not currently supported (fixed sizes)
- **Select Node**: Click on node
- **Multi-Select**: Ctrl+Click additional nodes or drag selection box
- **Duplicate Node**: Select node, press Ctrl+D
- **Delete Node**: Select node, press Delete or Backspace
- **Edit Properties**: Select node, modify in right sidebar

#### Edge Management
- **Create Edge**:
  1. Click connection handle on source node (blue circle)
  2. Click connection handle on target node
  3. Edge automatically created with default styling
- **Select Edge**: Click on edge line or arrow
- **Edit Properties**: Select edge, modify in right sidebar
- **Delete Edge**: Select edge, press Delete or Backspace
- **Reroute Edge**: Delete and recreate (dynamic routing planned)

#### Viewport Controls
- **Pan Canvas**:
  - Middle mouse button + drag
  - Space + left mouse drag
  - Trackpad two-finger drag
- **Zoom In/Out**:
  - Mouse wheel scroll
  - Ctrl + mouse wheel (fine control)
  - Zoom buttons in toolbar
  - Ctrl + (+/-) keys
- **Reset View**: Ctrl+0 to reset zoom and center
- **Fit to Screen**: Double-click canvas background (planned)

#### Selection & Multi-Select
- **Single Select**: Click element
- **Add to Selection**: Ctrl+Click element
- **Box Select**: Click and drag on empty canvas
- **Select All**: Ctrl+A (planned)
- **Deselect**: Click empty canvas area

### Animation Features

#### Setting Up Animations
1. Create edge between two nodes
2. Select the edge
3. Scroll to Animation section in right sidebar
4. Toggle "Enable Animation"
5. Adjust settings:
   - Speed: How fast packets move
   - Frequency: How often packets spawn
   - Size: Packet size in pixels
   - Color: Packet color
   - Shape: Visual shape of packet
   - Trail: Motion blur effect

#### Animation Controls
- **Global Play/Pause**: Button in top toolbar
- **Per-Edge Control**: Toggle in edge properties
- **Stop Animation**: Disable in edge settings
- **Reset Animation**: Stop and restart

#### Best Practices
- Use moderate frequency (1-3 packets/sec) for clarity
- Match packet color to edge color for cohesion
- Trail effect is CPU-intensive, use sparingly
- Pause animations when not presenting to save resources

### Grouping & Organization

#### Creating Groups
1. Select nodes to group (Ctrl+Click multiple nodes)
2. Click "Create Group" in toolbar (or planned context menu)
3. Set group name and color
4. Nodes visually enclosed in colored boundary

#### Managing Groups
- **Add to Group**: Drag node into group boundary
- **Remove from Group**: Drag node outside boundary
- **Collapse Group**: Click collapse icon (hides member nodes)
- **Expand Group**: Click expand icon (shows member nodes)
- **Edit Group**: Click group boundary, edit in properties panel
- **Delete Group**: Does not delete member nodes, only container

#### Use Cases
- Organize microservices by domain
- Group infrastructure by environment (dev/staging/prod)
- Separate frontend/backend components
- Create logical layers (presentation, business, data)

### Auto-Layout

#### Applying Auto-Layout
1. Create nodes and edges
2. Click "Auto Layout" in settings menu
3. Select layout algorithm:
   - **Horizontal**: Left-to-right flow (default)
   - **Vertical**: Top-to-bottom flow
   - **Radial**: Circular arrangement
   - **Force-Directed**: Physics-based spacing
4. Adjust spacing settings
5. Click "Apply Layout"
6. Nodes automatically positioned

#### When to Use
- After importing JSON with coordinate issues
- Quick prototyping without manual positioning
- Reorganizing complex diagrams
- Creating consistent spacing

#### Customization After Layout
- Auto-layout is non-destructive
- Manually adjust any node positions
- Re-run auto-layout at any time
- Undo with Ctrl+Z if needed

### Collaboration

#### Real-Time Presence
- See active users in top-right corner
- Colored presence badges show online status
- Live cursor tracking shows where others are working
- 30-second heartbeat maintains connection

#### Cursor Broadcasting
- Your cursor visible to all collaborators
- Color-coded per user
- Shows user name on hover
- Hidden when you leave page

#### Current Limitations
- No concurrent editing conflict resolution
- Last save wins (no operational transformation)
- No chat or comments (planned)
- No permissions/roles (all editors)

#### Best Practices
- Communicate via external chat while editing
- Work on different areas of diagram simultaneously
- Save frequently to avoid conflicts
- Refresh page if presence indicators seem stuck

### Export & Sharing

#### Export as PNG
1. Click Export menu → "Export as PNG"
2. Configure options:
   - Include background
   - Include grid
   - Include NexFlow watermark
   - Scale (1x - 4x for higher resolution)
3. Click "Export"
4. Image automatically downloads

#### Export as SVG
1. Click Export menu → "Export as SVG"
2. Same options as PNG
3. Vector format for infinite scaling
4. Editable in vector graphics software

#### Export as JSON
1. Click Export menu → "Export as JSON" (or Ctrl+S)
2. Downloads complete diagram data
3. Includes all nodes, edges, groups, animations
4. Can be re-imported to restore diagram

#### Export as JPG
1. Click Export menu → "Export as JPG"
2. Similar to PNG but with compression
3. Smaller file size, lossy quality
4. Best for presentations

#### Export as Video
1. Click Export menu → "Export as Video"
2. Configure recording:
   - Duration
   - Frame rate
   - Resolution
   - Include animations
3. Click "Start Recording"
4. Video downloads as WebM format
5. Convert to MP4 if needed

#### Import JSON
1. Click Import button (or drag JSON file onto canvas)
2. Select previously exported JSON file
3. Dialog asks to merge or replace
4. Diagram restored with all properties

#### Sharing Projects
- Share project URL with team members
- Requires authentication to view
- All authenticated users can edit (no roles yet)
- Use "Duplicate Project" to create personal copy

---

## Data Management

### Project Storage

#### Firestore Schema
```typescript
projects/{projectId}
  ├── id: string
  ├── name: string
  ├── description: string
  ├── userId: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  ├── tags: string[]
  ├── category: string
  └── data:
      ├── nodes: Node[]
      ├── edges: Edge[]
      ├── groups: NodeGroup[]
      ├── viewport: Viewport
      └── animationConfigs: Record<edgeId, AnimationConfig>
```

#### Data Types
```typescript
interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  description?: string;
  type: NodeType; // 32 types
  color: string;
  borderColor: string;
  textColor: string;
  shape: 'rectangle' | 'rounded' | 'circle' | 'diamond';
  fontSize: number;
  borderWidth: number;
  shadow: boolean;
  isVisible: boolean;
}

interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: 'input' | 'output' | 'top' | 'bottom';
  targetHandle: 'input' | 'output' | 'top' | 'bottom';
  label: string;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  animated: boolean;
  bidirectional: boolean;
  bounce: boolean;
  curvature: number;
  arrowSize: number;
  isVisible: boolean;
}

interface NodeGroup {
  id: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  members: string[]; // node IDs
  isCollapsed: boolean;
  isVisible: boolean;
}
```

### User Storage

#### User Profile Schema
```typescript
users/{userId}
  ├── userId: string
  ├── email: string
  ├── displayName: string
  ├── photoURL: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── settings:
      └── theme: 'light' | 'dark'
```

#### User Statistics
- Calculated on-demand from user's projects
- Total project count
- Total nodes across all projects
- Total edges across all projects
- Member since date

### Presence Data (Realtime Database)

#### Presence Schema
```typescript
presence/{sceneId}/{userId}
  ├── name: string
  ├── color: string
  ├── cursor: { x: number, y: number } | null
  ├── selection: string[] // selected node IDs
  └── ts: ServerValue.TIMESTAMP
```

#### Presence Management
- Automatic cleanup with onDisconnect()
- 30-second heartbeat interval
- Random color assignment from palette
- Cursor position throttled with requestAnimationFrame

### Auto-Save Behavior
- Triggered on every change (debounced 300ms)
- Only saves if authenticated (not demo)
- Updates `updatedAt` timestamp
- Preserves complete diagram state
- No versioning (single latest state)

### Local Storage
- Theme preference persisted
- Canvas theme preference persisted
- No offline editing support (future)

---

## Keyboard Shortcuts

### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo (50-state history) |
| `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Save project / Export as JSON |
| `Ctrl/Cmd + D` | Duplicate selected nodes |
| `Ctrl/Cmd + 0` | Reset zoom and pan to default |
| `Delete` or `Backspace` | Delete selected nodes or edges |
| `Ctrl/Cmd + Click` | Multi-select nodes |
| `?` | Show keyboard shortcuts panel (planned) |

### Canvas Navigation
| Shortcut | Action |
|----------|--------|
| `Middle Mouse + Drag` | Pan canvas |
| `Space + Left Mouse + Drag` | Pan canvas (alternative) |
| `Mouse Wheel` | Zoom in/out |
| `Ctrl + Mouse Wheel` | Fine zoom control |
| `Ctrl + +` | Zoom in (planned) |
| `Ctrl + -` | Zoom out (planned) |

### Selection
| Shortcut | Action |
|----------|--------|
| `Left Click` | Select element |
| `Ctrl/Cmd + Click` | Add to selection |
| `Click + Drag (empty area)` | Box select (planned) |
| `Ctrl/Cmd + A` | Select all (planned) |
| `Esc` | Deselect all (planned) |

### Future Shortcuts (Planned)
- `Ctrl/Cmd + C` - Copy selected elements
- `Ctrl/Cmd + V` - Paste copied elements
- `Ctrl/Cmd + X` - Cut selected elements
- `Ctrl/Cmd + G` - Group selected nodes
- `Ctrl/Cmd + Shift + G` - Ungroup selected group
- `Arrow Keys` - Nudge selected elements
- `Shift + Arrow Keys` - Nudge selected elements (large step)

---

## Development & Deployment

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd nexflow
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
Create `.env.local` file in root directory:
```env
NEXT_PUBLIC_FB_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
NEXT_PUBLIC_FB_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FB_DATABASE_URL=https://your_project.firebaseio.com
```

#### 4. Run Development Server
```bash
npm run dev
```
Application runs at `http://localhost:3000`

### Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Firebase Setup

#### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "NexFlow")
4. Enable Google Analytics (optional)
5. Click "Create Project"

#### 2. Enable Authentication
1. Navigate to Authentication → Sign-in method
2. Enable Google provider
3. Configure OAuth consent screen
4. Add authorized domains

#### 3. Create Firestore Database
1. Navigate to Firestore Database
2. Click "Create database"
3. Select location closest to users
4. Start in production mode
5. Configure security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projects owned by user
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Templates are read-only for all authenticated users
    match /templates/{templateId} {
      allow read: if request.auth != null;
    }
  }
}
```

#### 4. Create Realtime Database
1. Navigate to Realtime Database
2. Click "Create database"
3. Select location
4. Start in locked mode
5. Configure security rules:

```json
{
  "rules": {
    "presence": {
      "$sceneId": {
        "$userId": {
          ".read": true,
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```

#### 5. Get Configuration
1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Click Web app icon
4. Copy configuration values to `.env.local`

### Building for Production

#### 1. Build Application
```bash
npm run build
```

#### 2. Test Production Build Locally
```bash
npm start
```

#### 3. Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on push

#### Alternative Deployment Options
- **Netlify**: Import from Git, configure build command
- **Firebase Hosting**: `firebase deploy`
- **AWS Amplify**: Connect Git repository
- **Custom Server**: Export static site with `next export` (limited features)

### Environment-Specific Configuration

#### Development
- Hot module replacement enabled
- Turbopack for faster builds
- Source maps available
- Detailed error messages

#### Production
- Code minification
- Tree shaking for smaller bundles
- Image optimization
- Static page generation where possible

### Performance Optimization

#### Build Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Dynamic Imports**: Load heavy components on demand
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js Font optimization

#### Runtime Optimizations
- **Canvas Rendering**: 60fps with requestAnimationFrame
- **Viewport Culling**: Only render visible elements
- **Debouncing**: Prevent excessive saves and re-renders
- **Memoization**: Cache expensive computations
- **History Limit**: Max 50 states to prevent memory issues

### Monitoring & Analytics

#### Error Tracking (Recommended)
- Sentry integration for error monitoring
- Console logging in development
- Firebase Crashlytics (future)

#### Analytics (Optional)
- Google Analytics 4
- Firebase Analytics
- Vercel Analytics
- Custom event tracking

---

## Future Roadmap

### Planned Features

#### Short-term (Next 3 months)
- [ ] Comment system for collaboration
- [ ] Advanced permissions (viewer, editor, owner roles)
- [ ] Custom node creation UI improvements
- [ ] Context menus (right-click actions)
- [ ] Copy/paste functionality
- [ ] Advanced search and filtering
- [ ] Diagram versioning
- [ ] Offline mode with sync

#### Medium-term (3-6 months)
- [ ] AI-powered diagram suggestions
- [ ] Diagram templates marketplace
- [ ] Public sharing with view-only links
- [ ] Team workspaces
- [ ] Advanced export formats (PDF, Visio, PlantUML)
- [ ] Plugin system for extensions
- [ ] Mobile app (React Native)
- [ ] Diagram diffing and merging

#### Long-term (6-12 months)
- [ ] Code generation from diagrams
- [ ] Reverse engineering (code → diagram)
- [ ] Integration with development tools (GitHub, Jira, Confluence)
- [ ] Automated architecture documentation
- [ ] AI diagram review and optimization
- [ ] Collaborative presentations mode
- [ ] API for programmatic diagram creation

### Known Limitations
- No conflict resolution for concurrent edits
- Limited mobile responsiveness (in progress)
- No offline editing
- Single user ownership model
- No diagram versioning
- Limited undo history (50 states)
- No custom shape creation (uses templates)

### Contributing
- Open to community contributions
- Feature requests via GitHub Issues
- Pull requests welcome
- Follow existing code style
- Add tests for new features
- Update documentation

---

## Support & Resources

### Documentation
- This comprehensive guide
- `CLAUDE.md` - Developer guide for AI assistance
- Inline code comments
- TypeScript type definitions

### Community
- GitHub Discussions (for questions)
- GitHub Issues (for bugs and features)
- Discord server (planned)

### Contact
- GitHub: [Repository URL]
- Email: [Support email]
- Twitter: [Social media handle]

### License
- MIT License (or specify your license)
- Free for personal and commercial use
- Attribution appreciated

---

## Appendix

### Glossary

**Canvas**: The main drawing area where diagrams are created

**Node**: A visual element representing a system component (server, database, etc.)

**Edge**: A connection line between two nodes showing data flow or relationships

**Handle**: Connection point on a node (top, bottom, left, right)

**Viewport**: The visible portion of the canvas at current zoom level

**Packet**: Animated visual element that travels along edges

**Group**: A container that organizes related nodes together

**Template**: Pre-built diagram pattern for common architectures

**Presence**: Real-time indicator showing which users are currently viewing/editing

**Auto-layout**: Automatic positioning of nodes using graph algorithms

**GSAP**: GreenSock Animation Platform - professional JavaScript animation library

**Firestore**: Google's NoSQL document database

**Realtime Database**: Google's real-time synchronized database

### Troubleshooting

#### Canvas not loading
- Check Firebase configuration in `.env.local`
- Verify authentication is enabled
- Check browser console for errors
- Try clearing browser cache

#### Animations not playing
- Click play button in top toolbar
- Check if edge has animation enabled
- Verify GSAP library loaded
- Check browser performance (animations may pause on slow devices)

#### Save not working
- Verify authenticated (not using demo)
- Check network connection
- Verify Firestore permissions
- Check browser console for errors

#### Cursor not showing for collaborators
- Verify Realtime Database URL configured
- Check Realtime Database rules
- Verify both users authenticated
- Refresh page to reconnect presence

### Browser Compatibility
- **Chrome/Edge**: ✅ Fully supported
- **Firefox**: ✅ Fully supported
- **Safari**: ✅ Fully supported (iOS 14+)
- **Opera**: ✅ Fully supported
- **IE11**: ❌ Not supported

### Performance Guidelines
- Recommended: <100 nodes per diagram for smooth performance
- Recommended: <200 edges per diagram
- Limit active animations to <20 edges simultaneously
- Use collapse groups for complex diagrams
- Pause animations when not presenting

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Maintained By**: NexFlow Team

