"use client";

import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "General",
    shortcuts: [
      { keys: ["?", "F1"], description: "Show keyboard shortcuts" },
      { keys: ["Escape"], description: "Close dialogs or deselect" },
      { keys: ["Ctrl", "S"], description: "Save diagram" },
      { keys: ["Ctrl", "O"], description: "Open diagram" },
      { keys: ["Ctrl", "N"], description: "New diagram" },
    ]
  },
  {
    title: "Edit & History",
    shortcuts: [
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Y"], description: "Redo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo (alternative)" },
      { keys: ["Ctrl", "D"], description: "Duplicate selection" },
      { keys: ["Ctrl", "A"], description: "Select all nodes" },
      { keys: ["Delete", "Backspace"], description: "Delete selection" },
    ]
  },
  {
    title: "Canvas & View",
    shortcuts: [
      { keys: ["Ctrl", "0"], description: "Reset zoom and pan" },
      { keys: ["Ctrl", "+"], description: "Zoom in" },
      { keys: ["Ctrl", "-"], description: "Zoom out" },
      { keys: ["Space", "Drag"], description: "Pan canvas" },
      { keys: ["Middle Click", "Drag"], description: "Pan canvas" },
      { keys: ["Mouse Wheel"], description: "Zoom in/out" },
    ]
  },
  {
    title: "Selection & Multi-select",
    shortcuts: [
      { keys: ["Click"], description: "Select node or edge" },
      { keys: ["Ctrl", "Click"], description: "Multi-select nodes" },
      { keys: ["Drag"], description: "Move selected nodes" },
      { keys: ["Shift", "Drag"], description: "Box select multiple nodes" },
      { keys: ["Ctrl", "G"], description: "Group selected nodes" },
    ]
  },
  {
    title: "Node Operations",
    shortcuts: [
      { keys: ["Double Click"], description: "Edit node label" },
      { keys: ["Enter"], description: "Confirm label edit" },
      { keys: ["Tab"], description: "Cycle through node templates" },
      { keys: ["Drag from Sidebar"], description: "Create new node" },
    ]
  },
  {
    title: "Connections",
    shortcuts: [
      { keys: ["Click Handle"], description: "Start connection" },
      { keys: ["Click Target Handle"], description: "Complete connection" },
      { keys: ["Right Click Handle"], description: "Connection options" },
      { keys: ["Click Edge"], description: "Select edge" },
    ]
  },
  {
    title: "Animations",
    shortcuts: [
      { keys: ["Ctrl", "P"], description: "Play/pause animations" },
      { keys: ["Ctrl", "R"], description: "Restart animations" },
      { keys: ["Ctrl", "Shift", "P"], description: "Stop all animations" },
    ]
  },
  {
    title: "Export & Share",
    shortcuts: [
      { keys: ["Ctrl", "E"], description: "Export as PNG" },
      { keys: ["Ctrl", "Shift", "E"], description: "Export as SVG" },
      { keys: ["Ctrl", "J"], description: "Export as JSON" },
      { keys: ["Ctrl", "Shift", "S"], description: "Share diagram" },
    ]
  }
];

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  if (!isOpen) return null;

  const renderKey = (key: string) => (
    <kbd
      key={key}
      className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm min-w-[24px] text-center"
    >
      {key}
    </kbd>
  );

  const renderShortcut = (keys: string[]) => (
    <div className="flex items-center gap-1 font-mono text-sm">
      {keys.map((key, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <span className="text-gray-400 text-xs">+</span>}
          {renderKey(key)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  {group.title}
                </h3>
                <div className="space-y-3">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {shortcut.description}
                      </span>
                      {renderShortcut(shortcut.keys)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Tips */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 Pro Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Hold <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Shift</kbd> while dragging to maintain aspect ratio</li>
              <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Alt</kbd> + drag to duplicate nodes while moving</li>
              <li>• Right-click on empty canvas for context menu</li>
              <li>• Double-click empty canvas to create a node at that position</li>
              <li>• Use the minimap for quick navigation in large diagrams</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}