"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { X, Download, Copy, Check, FolderOpen, FileText, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { zipSync, strToU8 } from 'fflate';
import type { GeneratedFile } from '@/types/generation';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CodePreviewPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  files: GeneratedFile[];
  isDark: boolean;
}

// ─── File tree helpers ───────────────────────────────────────────────────────

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  file?: GeneratedFile;
}

function buildFileTree(files: GeneratedFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const existingIdx = current.findIndex((n) => n.name === name);

      if (existingIdx !== -1) {
        if (!isFile) {
          current = current[existingIdx].children;
        }
      } else {
        const node: TreeNode = {
          name,
          path: parts.slice(0, i + 1).join('/'),
          isFolder: !isFile,
          children: [],
          ...(isFile ? { file } : {}),
        };
        current.push(node);
        if (!isFile) {
          current = node.children;
        }
      }
    }
  }

  // Sort: folders first, then files, both alphabetically
  function sortTree(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({ ...n, children: sortTree(n.children) }));
  }

  return sortTree(root);
}

// ─── Tree node component ─────────────────────────────────────────────────────

function TreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
  expandedFolders,
  toggleFolder,
  isDark,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (file: GeneratedFile) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
  isDark: boolean;
}) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = node.path === selectedPath;
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  if (node.isFolder) {
    return (
      <>
        <button
          onClick={() => toggleFolder(node.path)}
          className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded transition-colors ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{node.name}</span>
        </button>
        {isExpanded &&
          node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              isDark={isDark}
            />
          ))}
      </>
    );
  }

  return (
    <button
      onClick={() => node.file && onSelect(node.file)}
      className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded transition-colors ${
        isSelected
          ? isDark
            ? 'bg-teal-500/20 text-teal-300'
            : 'bg-teal-50 text-teal-700'
          : isDark
          ? 'hover:bg-white/5 text-gray-300'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileText className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CodePreviewPanel({
  isVisible,
  onClose,
  onRegenerate,
  files,
  isDark,
}: CodePreviewPanelProps) {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(
    files[0] ?? null,
  );
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => {
      // Expand all folders by default
      const folders = new Set<string>();
      for (const file of files) {
        const parts = file.path.split('/');
        for (let i = 1; i < parts.length; i++) {
          folders.add(parts.slice(0, i).join('/'));
        }
      }
      return folders;
    },
  );

  const tree = useMemo(() => buildFileTree(files), [files]);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedFile]);

  const handleDownloadZip = useCallback(() => {
    const entries: Record<string, Uint8Array> = {};
    for (const file of files) {
      entries[file.path] = strToU8(file.content);
    }
    const zipped = zipSync(entries);
    const blob = new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-project.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

  if (!isVisible || files.length === 0) return null;

  const bg = isDark ? 'bg-gray-950' : 'bg-white';
  const border = isDark ? 'border-white/10' : 'border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const sidebarBg = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const codeBg = isDark ? 'bg-gray-900/50' : 'bg-gray-50';

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className={`relative flex-1 flex flex-col m-4 rounded-xl ${bg} border ${border} shadow-2xl overflow-hidden`}>
        {/* Top bar */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <h2 className={`text-lg font-bold ${text}`}>Generated Code</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-700'}`}>
              {files.length} files
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Download ZIP
            </button>
            <button
              onClick={onRegenerate}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar — file tree */}
          <div className={`w-64 flex-shrink-0 ${sidebarBg} border-r ${border} overflow-y-auto py-2`}>
            {tree.map((node) => (
              <TreeItem
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedFile?.path ?? ''}
                onSelect={setSelectedFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Code viewer */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedFile ? (
              <>
                {/* File header */}
                <div className={`flex items-center justify-between px-4 py-2 border-b ${border}`}>
                  <span className={`text-sm font-mono ${textMuted}`}>{selectedFile.path}</span>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      copied
                        ? 'bg-green-500/20 text-green-400'
                        : isDark
                        ? 'hover:bg-white/10 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Code */}
                <div className={`flex-1 overflow-auto p-4 ${codeBg}`}>
                  <pre className={`text-sm font-mono whitespace-pre-wrap break-words leading-relaxed ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {selectedFile.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className={`text-sm ${textMuted}`}>Select a file to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
