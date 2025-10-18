# NexFlow User Guide

A practical guide to creating, collaborating on, and exporting diagrams in NexFlow.

---

## Table of Contents
- Overview
- Access & Sign‑in
- Projects & Templates
- Editor Basics
- Working with Nodes
- Connecting Nodes (Edges)
- Animations on Edges
- Groups & Organization
- Auto‑Layout
- Export, Import, and Sharing
- Keyboard Shortcuts
- Troubleshooting
- FAQ
- Browser Support

---

## Overview
NexFlow is a collaborative diagram editor for system architecture, cloud infrastructure, network topology, and data flow diagrams. It supports real‑time presence, an extensive library of node templates, edge styling, animations, auto‑layout, grouping, and multiple export formats.

Key capabilities:
- Real‑time presence (see collaborators and their cursors)
- 30+ node templates (services, databases, queues, security, cloud, etc.)
- Edge customization (style, labels, curvature, arrows)
- Packet animations along edges (play/pause, per‑edge control)
- Auto‑layout (horizontal, vertical, radial, force‑directed)
- PNG, JPG, SVG, JSON, and video exports; JSON import

---

## Access & Sign‑in
1) Open the application in your browser.
2) Click “Sign in with Google”.
3) Approve the request and you’ll be redirected to your dashboard.

Notes:
- An authenticated account is required to save projects and collaborate.
- If your organization manages access, ensure you’re using an approved Google account.

---

## Projects & Templates
### Your Dashboard
- Create a project: Click “New Project”, name it, and open it in the editor.
- Manage projects: Open, duplicate, or delete existing projects.

### Template Library
- Browse templates by category (Microservices, Cloud, Data & Analytics, etc.).
- Click a template → “Use This Template” to create a new project from it.

---

## Editor Basics
The editor opens at route `/app/[scene]` for the selected project.

Layout highlights:
- Top Toolbar: Project title, Save, Undo/Redo, Zoom, View toggles, Export, Settings, Presence.
- Left Sidebar: Node templates (drag onto the canvas).
- Right Sidebar: Properties panel for selected node/edge (styling and behavior).
- Canvas: Infinite canvas with pan/zoom, selection, and real‑time cursors.
- Bottom Toolbar: Zoom level, counts, and status indicators.

Navigation:
- Pan: Middle mouse + drag, or hold Space + drag.
- Zoom: Mouse wheel (Ctrl + wheel for finer control), toolbar buttons, or Ctrl/Cmd + 0 to reset.

Saving:
- Saves happen automatically (debounced) for authenticated users.
- You can save/export JSON any time via Ctrl/Cmd + S or the Export menu.

---

## Working with Nodes
Create nodes:
- Drag a template from the left sidebar onto the canvas.

Select & edit:
- Click a node to select it; use the right sidebar to edit:
  - Label and description
  - Colors (fill, border, text)
  - Shape (rectangle, rounded, circle, diamond)
  - Font size, border width, shadow
  - Visibility and delete

Multi‑select:
- Ctrl/Cmd + Click to add/remove from selection.
- Drag a selection box over multiple nodes (if enabled in your version).

Duplicate/delete:
- Duplicate: Ctrl/Cmd + D
- Delete: Delete/Backspace

Tips:
- Use consistent colors for related components.
- Keep labels concise and descriptive.

---

## Connecting Nodes (Edges)
Create an edge:
1) Click a connection handle (blue circle) on the source node.
2) Click a handle on the target node.

Customize edges (right sidebar):
- Label
- Color and width
- Style: solid, dashed, dotted
- Curvature and arrow size
- Direction: unidirectional or bidirectional
- Bounce animation toggle
- Visibility and delete

---

## Animations on Edges
Enable animations to visualize packet flows.

Set up:
1) Select an edge.
2) In the Animation panel, toggle “Enable Animation”.
3) Adjust:
   - Speed (how fast packets move)
   - Frequency (packets per second)
   - Size (2–20px)
   - Color
   - Shape (circle, square, diamond, triangle)
   - Trail effect

Controls:
- Global Play/Pause in the top toolbar.
- Per‑edge toggles in the properties panel.

Best practices:
- 1–3 packets/sec is usually clear without clutter.
- Trail effect is more CPU‑intensive; use sparingly.

---

## Groups & Organization
Create a group:
1) Select multiple nodes (Ctrl/Cmd + Click).
2) Use “Create Group” (toolbar or context menu, depending on version).
3) Name and color the group.

Manage groups:
- Drag nodes in/out of the group boundary.
- Collapse/expand to hide/show member nodes.
- Edit name/color in the properties panel.
- Deleting a group does not delete member nodes.

Use groups to:
- Separate layers (presentation, business, data).
- Partition services by domain or environment (dev/stage/prod).

---

## Auto‑Layout
Automatically arrange nodes with ELK.js algorithms.

Apply:
1) Open Settings → Auto Layout.
2) Choose a layout:
   - Horizontal (left→right)
   - Vertical (top→bottom)
   - Radial
   - Force‑directed
3) Adjust spacing as needed and apply.

Notes:
- Auto‑layout is non‑destructive; adjust nodes afterward.
- Undo with Ctrl/Cmd + Z.

---


## Export, Import, and Sharing
Export formats:
- PNG/JPG: Raster images (configure background, grid, scale).
- SVG: Vector format for infinite scaling and editing.
- JSON: Complete diagram data (nodes, edges, groups, animations).
- Video (WebM/MP4 where supported): Record animated diagrams.

Export steps:
1) Click Export in the toolbar.
2) Choose format and options.
3) Download the file.

Import JSON:
1) Click Import (or drag a JSON file onto the canvas).
2) Choose to merge or replace.

Share projects:
- Share the project URL with collaborators.
- Authentication is required to view/edit.
- Use “Duplicate Project” to make a personal copy.

---

## Keyboard Shortcuts
Global:
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
- Ctrl/Cmd + S: Save / Export JSON
- Ctrl/Cmd + D: Duplicate
- Ctrl/Cmd + 0: Reset zoom/pan
- Delete/Backspace: Delete selection
- Ctrl/Cmd + Click: Multi‑select

Canvas navigation:
- Middle mouse + drag: Pan
- Space + drag: Pan
- Mouse wheel (Ctrl + wheel): Zoom

Planned (may vary in your version):
- Ctrl/Cmd + A: Select all
- Esc: Deselect all
- Ctrl/Cmd + C / V / X: Copy/Paste/Cut
- Ctrl/Cmd + G / Shift + G: Group/Ungroup
- Arrow Keys (±Shift): Nudge

---

## Troubleshooting
Canvas not loading:
- Ensure you’re signed in and have network connectivity.
- If self‑hosted: verify environment configuration and Firebase setup.
- Refresh the page and check the browser console for errors.

Animations not playing:
- Click global Play in the toolbar.
- Ensure the selected edge has animation enabled.
- Heavy pages or slow devices may pause animations.

Saving issues:
- Confirm you are authenticated (demo mode does not persist).
- Check your connection and try again.
- If self‑hosted and using Firestore, verify project permissions.

Presence/cursors missing:
- Ensure collaborators are authenticated and on the same project.
- If self‑hosted, verify Realtime Database configuration.
- Refresh to re‑establish connection.

---

## FAQ
Q: Do I need an account?
A: Yes, a Google account is required for saving and collaboration.

Q: Can I export to PDF?
A: Export to SVG or PNG/JPG and convert to PDF using your preferred tool.

Q: How do I share a read‑only link?
A: Public view‑only links are planned; currently, collaborators must be authenticated and will have edit access.

Q: Can I version my diagrams?
A: Versioning is planned. For now, use JSON export for manual snapshots.

Q: Is there an offline mode?
A: Not yet. Offline editing with sync is on the roadmap.

---

## Browser Support
- Chrome/Edge, Firefox, Safari, Opera: Supported
- Internet Explorer: Not supported

Performance guidelines:
- For best results, keep diagrams under ~100 nodes and ~200 edges.
- Limit active animated edges (<20) during editing/presentations.
- Collapse groups to simplify large diagrams.
