"use client";
import { useState } from 'react';
import { Edge, Node } from 'reactflow';

interface SimplePacketConfig {
  size: number;
  color: string;
  speed: number;
  frequency: number;
}

interface SimpleAnimationPanelProps {
  selectedEdge: Edge | null;
  nodes: Node[];
  onStartEdgeAnimation: (edgeId: string, config: SimplePacketConfig) => void;
  onStopEdgeAnimation: (edgeId: string) => void;
  activeAnimations: string[];
}

export default function SimpleAnimationPanel({
  selectedEdge,
  nodes,
  onStartEdgeAnimation,
  onStopEdgeAnimation,
  activeAnimations
}: SimpleAnimationPanelProps) {
  const [config, setConfig] = useState<SimplePacketConfig>({
    size: 12,
    color: '#3b82f6',
    speed: 200, // pixels per second
    frequency: 1 // packets per second
  });

  if (!selectedEdge) {
    return (
      <div className="fixed bottom-4 right-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
        Select an edge to animate
      </div>
    );
  }

  const sourceNode = nodes.find(n => n.id === selectedEdge.source);
  const targetNode = nodes.find(n => n.id === selectedEdge.target);
  const isAnimating = activeAnimations.includes(selectedEdge.id);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl border shadow-lg p-4 w-72">
      <div className="mb-3">
        <h3 className="font-semibold text-sm">Simple Edge Animation</h3>
        <p className="text-xs text-gray-600">
          {sourceNode?.data.label} → {targetNode?.data.label}
        </p>
      </div>

      {/* Simple Controls */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-600">Size</label>
          <input
            type="range"
            min="6"
            max="20"
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

        <div>
          <label className="text-xs text-gray-600">Speed</label>
          <input
            type="range"
            min="50"
            max="500"
            value={config.speed}
            onChange={(e) => setConfig(prev => ({ ...prev, speed: Number(e.target.value) }))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{config.speed} px/s</span>
        </div>

        <div>
          <label className="text-xs text-gray-600">Frequency</label>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={config.frequency}
            onChange={(e) => setConfig(prev => ({ ...prev, frequency: Number(e.target.value) }))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{config.frequency}/s</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="my-3 grid grid-cols-3 gap-1">
        <button
          onClick={() => setConfig({ size: 8, color: '#ef4444', speed: 300, frequency: 2 })}
          className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
        >
          Fast
        </button>
        <button
          onClick={() => setConfig({ size: 12, color: '#3b82f6', speed: 150, frequency: 1 })}
          className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
        >
          Normal
        </button>
        <button
          onClick={() => setConfig({ size: 16, color: '#10b981', speed: 100, frequency: 0.5 })}
          className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
        >
          Slow
        </button>
      </div>

      {/* Start/Stop */}
      <div className="flex gap-2">
        {isAnimating ? (
          <button
            onClick={() => onStopEdgeAnimation(selectedEdge.id)}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={() => onStartEdgeAnimation(selectedEdge.id, config)}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            Start
          </button>
        )}
      </div>

      {/* Debug Test */}
      <button
        onClick={() => {
          console.log('🧪 Testing packet creation');
          onStartEdgeAnimation(selectedEdge.id, {
            size: 20,
            color: '#ff0000',
            speed: 100,
            frequency: 0.5
          });
        }}
        className="w-full mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
      >
        🧪 Debug Test (Big Red Slow)
      </button>
    </div>
  );
}