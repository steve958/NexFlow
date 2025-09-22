"use client";

import { useState } from 'react';
import { Layers, Eye, EyeOff, Edit, Trash2, Plus, Package, FolderOpen } from 'lucide-react';

interface NodeGroup {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  backgroundColor: string;
  nodeIds: string[];
  isCollapsed: boolean;
  isVisible: boolean;
  padding: number;
}

interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: string;
}

interface NodeGroupManagerProps {
  groups: NodeGroup[];
  nodes: Node[];
  selectedNodes: Set<string>;
  onCreateGroup: (nodeIds: string[], groupName: string, style: GroupStyle) => void;
  onUpdateGroup: (groupId: string, updates: Partial<NodeGroup>) => void;
  onDeleteGroup: (groupId: string) => void;
  onToggleGroupVisibility: (groupId: string) => void;
  onToggleGroupCollapse: (groupId: string) => void;
}

interface GroupStyle {
  color: string;
  borderColor: string;
  backgroundColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
}

const GROUP_STYLES: Record<string, GroupStyle> = {
  default: {
    color: '#e5e7eb',
    borderColor: '#9ca3af',
    backgroundColor: 'rgba(243, 244, 246, 0.3)',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  service: {
    color: '#dbeafe',
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  database: {
    color: '#dcfce7',
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  security: {
    color: '#fee2e2',
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  cloud: {
    color: '#f0f9ff',
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderStyle: 'dotted',
    borderWidth: 3,
  },
  network: {
    color: '#f3e8ff',
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderStyle: 'solid',
    borderWidth: 2,
  },
};

export function NodeGroupManager({
  groups,
  nodes,
  selectedNodes,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onToggleGroupVisibility,
  onToggleGroupCollapse,
}: NodeGroupManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('default');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  const handleCreateGroup = () => {
    if (selectedNodes.size < 2) return;

    if (groupName.trim()) {
      onCreateGroup(
        Array.from(selectedNodes),
        groupName.trim(),
        GROUP_STYLES[selectedStyle]
      );
      setGroupName('');
      setShowCreateForm(false);
      setSelectedStyle('default');
    }
  };

  const handleGroupNameEdit = (groupId: string, newName: string) => {
    onUpdateGroup(groupId, { label: newName });
    setEditingGroup(null);
  };

  const getGroupedNodeCount = (group: NodeGroup) => {
    return group.nodeIds.filter(nodeId =>
      nodes.some(node => node.id === nodeId)
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Create Group Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Create Group
            </h3>
          </div>
          {selectedNodes.size >= 2 && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Group ({selectedNodes.size})
            </button>
          )}
        </div>

        {selectedNodes.size < 2 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select 2 or more nodes to create a group
          </p>
        ) : showCreateForm ? (
          <div className="space-y-3">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGroup();
                if (e.key === 'Escape') setShowCreateForm(false);
              }}
              autoFocus
            />

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(GROUP_STYLES).map(([styleKey, style]) => (
                <button
                  key={styleKey}
                  onClick={() => setSelectedStyle(styleKey)}
                  className={`p-2 text-xs rounded border-2 transition-all ${
                    selectedStyle === styleKey
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: selectedStyle === styleKey ? '#3b82f6' : style.borderColor,
                    backgroundColor: selectedStyle === styleKey ? style.backgroundColor : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 border rounded-sm"
                      style={{
                        borderColor: style.borderColor,
                        backgroundColor: style.backgroundColor,
                        borderStyle: style.borderStyle,
                        borderWidth: '1px',
                      }}
                    />
                    <span className="capitalize">{styleKey}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Group
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {selectedNodes.size} nodes selected - click Group button to create
          </p>
        )}
      </div>

      {/* Existing Groups */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Groups ({groups.length})
            </h3>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
            No groups created yet
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 border rounded-sm flex-shrink-0"
                      style={{
                        borderColor: group.borderColor,
                        backgroundColor: group.backgroundColor,
                        borderWidth: '1px',
                      }}
                    />

                    {editingGroup === group.id ? (
                      <input
                        type="text"
                        defaultValue={group.label}
                        onBlur={(e) => handleGroupNameEdit(group.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleGroupNameEdit(group.id, e.currentTarget.value);
                          }
                          if (e.key === 'Escape') setEditingGroup(null);
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {group.label}
                          </span>
                          {group.isCollapsed && (
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                              collapsed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getGroupedNodeCount(group)} nodes
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleGroupVisibility(group.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title={group.isVisible ? "Hide group" : "Show group"}
                    >
                      {group.isVisible ? (
                        <Eye className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={() => onToggleGroupCollapse(group.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title={group.isCollapsed ? "Expand group" : "Collapse group"}
                    >
                      <Layers className={`w-3 h-3 ${group.isCollapsed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </button>

                    <button
                      onClick={() => setEditingGroup(group.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Edit group name"
                    >
                      <Edit className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>

                    <button
                      onClick={() => onDeleteGroup(group.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete group"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}