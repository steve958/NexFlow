"use client";
import { useState } from 'react';
import { AnimationConfig, AnimationObject, AnimationPath } from '@/lib/animationTypes';

interface AnimationPanelProps {
  onStartAnimation: (config: AnimationConfig) => void;
  onStopAllAnimations: () => void;
  activeAnimations: Array<{ id: string; config: AnimationConfig; currentRepeat: number }>;
}

export default function AnimationPanel({ onStartAnimation, onStopAllAnimations, activeAnimations }: AnimationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<AnimationConfig>>({
    duration: 2,
    ease: 'power2.inOut',
    delay: 0,
    repeat: 1,
    yoyo: false,
    object: {
      id: '',
      type: 'packet',
      size: 16,
      color: '#ef4444',
      shape: 'circle',
      opacity: 1,
      trail: false
    },
    path: {
      id: '',
      points: [
        { x: 60, y: 120 },
        { x: 360, y: 120 }
      ],
      type: 'linear'
    }
  });

  const updateObject = (updates: Partial<AnimationObject>) => {
    setConfig(prev => ({
      ...prev,
      object: { ...prev.object!, ...updates }
    }));
  };

  const updatePath = (updates: Partial<AnimationPath>) => {
    setConfig(prev => ({
      ...prev,
      path: { ...prev.path!, ...updates }
    }));
  };

  const addPathPoint = () => {
    const lastPoint = config.path!.points[config.path!.points.length - 1];
    updatePath({
      points: [...config.path!.points, { x: lastPoint.x + 100, y: lastPoint.y }]
    });
  };

  const updatePathPoint = (index: number, updates: { x?: number; y?: number }) => {
    const newPoints = [...config.path!.points];
    newPoints[index] = { ...newPoints[index], ...updates };
    updatePath({ points: newPoints });
  };

  const removePathPoint = (index: number) => {
    if (config.path!.points.length > 2) {
      const newPoints = config.path!.points.filter((_, i) => i !== index);
      updatePath({ points: newPoints });
    }
  };

  const startAnimation = () => {
    const animationConfig: AnimationConfig = {
      id: `anim-${Date.now()}`,
      object: {
        id: `obj-${Date.now()}`,
        ...config.object!
      },
      path: {
        id: `path-${Date.now()}`,
        ...config.path!
      },
      duration: config.duration || 2,
      ease: config.ease || 'power2.inOut',
      delay: config.delay || 0,
      repeat: config.repeat === 'infinite' ? 'infinite' : (config.repeat || 1),
      yoyo: config.yoyo || false
    };

    console.log('AnimationPanel: Starting animation with config:', animationConfig);
    onStartAnimation(animationConfig);
  };

  const startTestAnimation = () => {
    // Create a simple test animation that should be visible
    const testConfig: AnimationConfig = {
      id: `test-${Date.now()}`,
      object: {
        id: `test-obj-${Date.now()}`,
        type: 'packet',
        size: 20,
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        trail: false
      },
      path: {
        id: `test-path-${Date.now()}`,
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 }
        ],
        type: 'linear'
      },
      duration: 3,
      ease: 'linear',
      delay: 0,
      repeat: 'infinite',
      yoyo: true
    };

    console.log('AnimationPanel: Starting TEST animation:', testConfig);
    onStartAnimation(testConfig);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 rounded-xl border bg-white/90 px-4 py-2 shadow-lg hover:bg-white"
      >
        🎬 Animations ({activeAnimations.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 rounded-xl border bg-white shadow-lg p-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Animation Controls</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      {/* Object Configuration */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Animation Object</h4>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-600">Type</label>
            <select
              value={config.object?.type}
              onChange={(e) => updateObject({ type: e.target.value as AnimationObject['type'] })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="packet">Packet</option>
              <option value="pulse">Pulse</option>
              <option value="glow">Glow</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Shape</label>
            <select
              value={config.object?.shape}
              onChange={(e) => updateObject({ shape: e.target.value as AnimationObject['shape'] })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="diamond">Diamond</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-600">Size</label>
            <input
              type="range"
              min="4"
              max="20"
              value={config.object?.size}
              onChange={(e) => updateObject({ size: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{config.object?.size}px</span>
          </div>

          <div>
            <label className="text-xs text-gray-600">Color</label>
            <input
              type="color"
              value={config.object?.color}
              onChange={(e) => updateObject({ color: e.target.value })}
              className="w-full h-8 border rounded"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={config.object?.trail}
              onChange={(e) => updateObject({ trail: e.target.checked })}
              className="mr-1"
            />
            Trail Effect
          </label>
        </div>
      </div>

      {/* Path Configuration */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Animation Path</h4>

        <div className="mb-2">
          <label className="text-xs text-gray-600">Path Type</label>
          <select
            value={config.path?.type}
            onChange={(e) => updatePath({ type: e.target.value as AnimationPath['type'] })}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="linear">Linear</option>
            <option value="curved">Curved</option>
            <option value="bezier">Bezier</option>
          </select>
        </div>

        <div className="space-y-2">
          {config.path?.points.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs w-8">P{index + 1}:</span>
              <input
                type="number"
                placeholder="X"
                value={point.x}
                onChange={(e) => updatePathPoint(index, { x: Number(e.target.value) })}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="number"
                placeholder="Y"
                value={point.y}
                onChange={(e) => updatePathPoint(index, { y: Number(e.target.value) })}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              {config.path!.points.length > 2 && (
                <button
                  onClick={() => removePathPoint(index)}
                  className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addPathPoint}
            className="w-full px-2 py-1 border border-dashed rounded text-sm text-gray-600 hover:bg-gray-50"
          >
            + Add Point
          </button>
        </div>
      </div>

      {/* Animation Configuration */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Animation Settings</h4>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-600">Duration (s)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={config.duration}
              onChange={(e) => setConfig(prev => ({ ...prev, duration: Number(e.target.value) }))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Delay (s)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={config.delay}
              onChange={(e) => setConfig(prev => ({ ...prev, delay: Number(e.target.value) }))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="text-xs text-gray-600">Ease</label>
          <select
            value={config.ease}
            onChange={(e) => setConfig(prev => ({ ...prev, ease: e.target.value }))}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="power2.inOut">Power 2 In Out</option>
            <option value="power2.in">Power 2 In</option>
            <option value="power2.out">Power 2 Out</option>
            <option value="bounce.out">Bounce Out</option>
            <option value="elastic.out">Elastic Out</option>
            <option value="linear">Linear</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-600">Repeat</label>
            <select
              value={config.repeat === 'infinite' ? 'infinite' : config.repeat}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                repeat: e.target.value === 'infinite' ? 'infinite' : Number(e.target.value)
              }))}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value={1}>Once</option>
              <option value={2}>2 times</option>
              <option value={3}>3 times</option>
              <option value={5}>5 times</option>
              <option value="infinite">Infinite</option>
            </select>
          </div>

          <div className="flex items-center justify-center">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={config.yoyo}
                onChange={(e) => setConfig(prev => ({ ...prev, yoyo: e.target.checked }))}
                className="mr-1"
              />
              Yoyo
            </label>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={startAnimation}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600"
        >
          Start Animation
        </button>
        <button
          onClick={onStopAllAnimations}
          className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          disabled={activeAnimations.length === 0}
        >
          Stop All
        </button>
      </div>

      {/* Test Button */}
      <button
        onClick={startTestAnimation}
        className="w-full bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 mb-2"
      >
        🔴 Test Animation (Simple Red Circle)
      </button>

      {/* Active Animations */}
      {activeAnimations.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Active Animations ({activeAnimations.length})</h4>
          <div className="space-y-1">
            {activeAnimations.map((anim) => (
              <div key={anim.id} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                <span>{anim.config.object.type} - {anim.config.repeat === 'infinite' ? '∞' : anim.currentRepeat}/{anim.config.repeat}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}