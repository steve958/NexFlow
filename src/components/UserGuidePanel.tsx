"use client";

import { X, BookOpen } from "lucide-react";
import React from "react";

interface UserGuidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    <div className="text-sm leading-6 text-gray-700 dark:text-gray-300 space-y-2">
      {children}
    </div>
  </section>
);

export function UserGuidePanel({ isOpen, onClose }: UserGuidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[calc(100dvh-64px)] overflow-hidden rounded-2xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">NexFlow User Guide</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">Create, collaborate, and export professional diagrams</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6">
          <Section title="Overview">
            <p>NexFlow is a collaborative diagram editor for system architecture, cloud infrastructure, network topology, and data flow diagrams. Drag templates, connect nodes, style edges, animate flows, auto‑layout your graph, and export to multiple formats.</p>
          </Section>

          <Section title="Access & Sign‑in">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click “Sign in with Google”.</li>
              <li>After sign‑in you’ll land on your dashboard.</li>
              <li>Authentication is required to save and collaborate.</li>
            </ol>
          </Section>

          <Section title="Projects & Templates">
            <ul className="list-disc pl-5 space-y-1">
              <li>New Project: Create and open in the editor.</li>
              <li>Manage: Open, duplicate, delete from dashboard.</li>
              <li>Templates: Browse by category and “Use” one to start fast.</li>
            </ul>
          </Section>

          <Section title="Editor Basics">
            <ul className="list-disc pl-5 space-y-1">
              <li>Top toolbar: Save, Undo/Redo, Zoom, Export, Settings, Presence.</li>
              <li>Left sidebar: Node templates—drag onto canvas.</li>
              <li>Right sidebar: Properties for node/edge.</li>
              <li>Pan: Middle‑drag or Space+Drag. Zoom: Mouse wheel (Ctrl+wheel for fine).</li>
              <li>Save: Auto‑save (when signed‑in) and Ctrl/Cmd+S.</li>
            </ul>
          </Section>

          <Section title="Working with Nodes">
            <ul className="list-disc pl-5 space-y-1">
              <li>Create: Drag a template onto the canvas.</li>
              <li>Edit: Select a node → adjust label, colors, shape, font, etc.</li>
              <li>Multi‑select: Ctrl/Cmd+Click; Duplicate: Ctrl/Cmd+D; Delete: Del/Backspace.</li>
            </ul>
          </Section>

          <Section title="Connections (Edges)">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click a blue handle on the source node.</li>
              <li>Click a handle on the target node to connect.</li>
              <li>Customize label, color, style, curvature, arrows, and bounce.</li>
            </ol>
          </Section>

          <Section title="Animations">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Select an edge → enable in Animation panel.</li>
              <li>Adjust speed, frequency, size, color, shape, and trail.</li>
              <li>Use global Play/Pause or per‑edge toggles.</li>
            </ol>
            <p className="text-xs text-gray-600 dark:text-gray-400">Tip: 1–3 packets/sec keeps flows readable. Trail is CPU‑heavier.</p>
          </Section>

          <Section title="Groups & Organization">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Select 2+ nodes → Create Group (or Ctrl/Cmd+G).</li>
              <li>Drag nodes in/out; collapse/expand; edit group name/color.</li>
              <li>Deleting a group keeps member nodes.</li>
            </ol>
          </Section>

          <Section title="Auto‑Layout">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Settings → Auto Layout.</li>
              <li>Choose: Horizontal, Vertical, Radial, or Force‑directed.</li>
              <li>Apply and tweak nodes as needed; undo with Ctrl/Cmd+Z.</li>
            </ol>
          </Section>


          <Section title="Export, Import, Sharing">
            <ul className="list-disc pl-5 space-y-1">
              <li>Export: PNG/JPG/SVG/JSON/Video (Export menu → configure → download).</li>
              <li>Import: Import JSON via button or drag a JSON file onto the canvas.</li>
              <li>Share: Send project URL; collaborators must be authenticated.</li>
            </ul>
          </Section>

          <Section title="Keyboard Shortcuts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium">Global</p>
                <p>Ctrl/Cmd+Z/Y/Shift+Z, Ctrl/Cmd+S, Ctrl/Cmd+D, Ctrl/Cmd+0, Del</p>
              </div>
              <div>
                <p className="font-medium">Navigation</p>
                <p>Space+Drag, Middle‑Drag, Mouse Wheel (Ctrl+wheel)</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Press ? or F1 for the full shortcuts panel.</p>
          </Section>

          <Section title="Troubleshooting">
            <ul className="list-disc pl-5 space-y-1">
              <li>Canvas: Check sign‑in, refresh, verify configuration when self‑hosted.</li>
              <li>Animations: Start global Play and enable per‑edge animation.</li>
              <li>Saving: Ensure you’re signed in and connected.</li>
              <li>Presence: Collaborators must be signed in on the same project.</li>
            </ul>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Need more? Press ? to open Keyboard Shortcuts.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}