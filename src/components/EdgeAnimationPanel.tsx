"use client";
import { useState } from 'react';
import { Edge, Node } from 'reactflow';

interface PacketConfig {
  type: 'data' | 'request' | 'response' | 'error' | 'heartbeat';
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'diamond';
  speed: number; // duration in seconds
  frequency: number; // packets per second
  bidirectional: boolean;
  trail: boolean;
  label?: string;
}

interface EdgeAnimationPanelProps {
  selectedEdge: Edge | null;
  nodes: Node[];
  onStartEdgeAnimation: (edgeId: string, config: PacketConfig) => void;
  onStopEdgeAnimation: (edgeId: string) => void;
  activeAnimations: string[];
}

const presets: Record<string, PacketConfig> = {
  'Database Query': {
    type: 'request',
    size: 8,
    color: '#3b82f6',
    shape: 'circle',
    speed: 1.5,
    frequency: 0.5,
    bidirectional: true,
    trail: false,
    label: 'SQL'
  },
  'API Call': {
    type: 'data',
    size: 6,
    color: '#10b981',
    shape: 'square',
    speed: 0.8,
    frequency: 1,
    bidirectional: true,
    trail: true,
    label: 'HTTP'
  },
  'Message Queue': {
    type: 'data',
    size: 10,
    color: '#f59e0b',
    shape: 'diamond',
    speed: 2,
    frequency: 2,
    bidirectional: false,
    trail: false,
    label: 'MSG'
  },
  'Error Flow': {
    type: 'error',
    size: 12,
    color: '#ef4444',
    shape: 'circle',
    speed: 0.5,
    frequency: 0.2,
    bidirectional: false,
    trail: true,
    label: 'ERR'
  },
  'Heartbeat': {
    type: 'heartbeat',
    size: 4,
    color: '#8b5cf6',
    shape: 'circle',
    speed: 0.3,
    frequency: 1,
    bidirectional: false,
    trail: false,
    label: '♥'
  }
};

export default function EdgeAnimationPanel({
  selectedEdge,
  nodes,
  onStartEdgeAnimation,
  onStopEdgeAnimation,
  activeAnimations
}: EdgeAnimationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PacketConfig>(presets['API Call']);

  if (!selectedEdge) {
    return (
      <div className="fixed bottom-4 right-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
        Select an edge to animate packet flow
      </div>
    );
  }

  const sourceNode = nodes.find(n => n.id === selectedEdge.source);
  const targetNode = nodes.find(n => n.id === selectedEdge.target);
  const isAnimating = activeAnimations.includes(selectedEdge.id);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-xl border shadow-lg p-4 min-w-64">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">Edge Animation</h3>
            <p className="text-xs text-gray-600">
              {sourceNode?.data.label} → {targetNode?.data.label}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Configure
          </button>
        </div>

        <div className="flex gap-2">
          {isAnimating ? (
            <button
              onClick={() => onStopEdgeAnimation(selectedEdge.id)}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
            >
              Stop Animation
            </button>
          ) : (
            <button
              onClick={() => onStartEdgeAnimation(selectedEdge.id, config)}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              Start Animation
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-3 grid grid-cols-2 gap-1">
          {Object.entries(presets).slice(0, 4).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => {
                setConfig(preset);
                onStartEdgeAnimation(selectedEdge.id, preset);
              }}
              className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl border shadow-lg p-4 w-80 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Edge Animation</h3>
          <p className="text-xs text-gray-600">
            {sourceNode?.data.label} → {targetNode?.data.label}
          </p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Quick Presets</h4>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(presets).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => setConfig(preset)}
              className={`px-3 py-2 border rounded-lg text-sm text-left hover:bg-gray-50 ${
                JSON.stringify(config) === JSON.stringify(preset) ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{name}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.color }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {preset.type} • {preset.speed}s • {preset.bidirectional ? '↔️' : '→'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Configuration */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Packet Configuration</h4>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">Type</label>
              <select
                value={config.type}
                onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as PacketConfig['type'] }))}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="data">Data</option>
                <option value="request">Request</option>
                <option value="response">Response</option>
                <option value="error">Error</option>
                <option value="heartbeat">Heartbeat</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Shape</label>
              <select
                value={config.shape}
                onChange={(e) => setConfig(prev => ({ ...prev, shape: e.target.value as PacketConfig['shape'] }))}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">Size</label>
              <input
                type="range"
                min="4"
                max="16"
                value={config.size}
                onChange={(e) => setConfig(prev => ({ ...prev, size: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{config.size}px</span>
            </div>

            <div>
              <label className="text-xs text-gray-600">Color</label>
              <input
                type="color"
                value={config.color}
                onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-8 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">Speed (seconds)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={config.speed}
                onChange={(e) => setConfig(prev => ({ ...prev, speed: Number(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Frequency (per sec)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={config.frequency}
                onChange={(e) => setConfig(prev => ({ ...prev, frequency: Number(e.target.value) }))}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={config.bidirectional}
                onChange={(e) => setConfig(prev => ({ ...prev, bidirectional: e.target.checked }))}
                className="mr-2"
              />
              Bidirectional
            </label>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={config.trail}
                onChange={(e) => setConfig(prev => ({ ...prev, trail: e.target.checked }))}
                className="mr-2"
              />
              Trail Effect
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-600">Label (optional)</label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., HTTP, SQL, MSG"
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 pt-3 border-t">
          {isAnimating ? (
            <button
              onClick={() => onStopEdgeAnimation(selectedEdge.id)}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
            >
              Stop Animation
            </button>
          ) : (
            <button
              onClick={() => onStartEdgeAnimation(selectedEdge.id, config)}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              Start Animation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}