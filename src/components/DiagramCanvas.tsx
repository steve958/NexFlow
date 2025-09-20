"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: 'service' | 'database' | 'queue' | 'gateway';
}

interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
}

interface Packet {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  color: string;
  size: number;
  edgeId: string;
}

const DiagramCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'svc', x: 100, y: 150, width: 140, height: 60, label: 'Service', type: 'service' },
    { id: 'db', x: 400, y: 150, width: 140, height: 60, label: 'Database', type: 'database' },
    { id: 'api', x: 100, y: 300, width: 140, height: 60, label: 'API Gateway', type: 'gateway' },
    { id: 'queue', x: 400, y: 300, width: 140, height: 60, label: 'Message Queue', type: 'queue' }
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1', sourceId: 'svc', targetId: 'db', label: 'writes' },
    { id: 'e2', sourceId: 'api', targetId: 'svc', label: 'requests' },
    { id: 'e3', sourceId: 'svc', targetId: 'queue', label: 'events' }
  ]);

  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [animationConfig, setAnimationConfig] = useState({
    speed: 0.02, // progress per frame
    frequency: 60, // frames between packets
    size: 8,
    color: '#3b82f6'
  });

  const animationFrameRef = useRef<number>();
  const frameCountRef = useRef(0);

  // Get node by ID
  const getNode = (id: string) => nodes.find(n => n.id === id);

  // Get edge connection points
  const getConnectionPoints = (edge: Edge) => {
    const source = getNode(edge.sourceId);
    const target = getNode(edge.targetId);
    if (!source || !target) return null;

    return {
      startX: source.x + source.width,
      startY: source.y + source.height / 2,
      endX: target.x,
      endY: target.y + target.height / 2
    };
  };

  // Draw a node
  const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
    const colors = {
      service: '#3b82f6',
      database: '#10b981',
      queue: '#f59e0b',
      gateway: '#8b5cf6'
    };

    // Node background
    ctx.fillStyle = colors[node.type];
    ctx.fillRect(node.x, node.y, node.width, node.height);

    // Node border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(node.x, node.y, node.width, node.height);

    // Node label
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2 + 5);

    // Node type
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#e5e7eb';
    ctx.fillText(node.type.toUpperCase(), node.x + node.width / 2, node.y + 15);
  };

  // Draw a curved edge
  const drawEdge = (ctx: CanvasRenderingContext2D, edge: Edge, isSelected = false) => {
    const points = getConnectionPoints(edge);
    if (!points) return;

    const { startX, startY, endX, endY } = points;

    // Control points for bezier curve
    const controlOffset = Math.min(Math.abs(endX - startX) * 0.3, 100);
    const cp1X = startX + controlOffset;
    const cp1Y = startY;
    const cp2X = endX - controlOffset;
    const cp2Y = endY;

    // Draw curved line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
    ctx.strokeStyle = isSelected ? '#ef4444' : '#6b7280';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Draw arrow
    const angle = Math.atan2(endY - cp2Y, endX - cp2X);
    const arrowLength = 10;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();

    // Edge label
    const midX = (startX + cp1X + cp2X + endX) / 4;
    const midY = (startY + cp1Y + cp2Y + endY) / 4;
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(edge.label, midX, midY - 8);
  };

  // Draw a packet
  const drawPacket = (ctx: CanvasRenderingContext2D, packet: Packet) => {
    ctx.beginPath();
    ctx.arc(packet.x, packet.y, packet.size, 0, 2 * Math.PI);
    ctx.fillStyle = packet.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Calculate packet position along bezier curve
  const getPacketPosition = (edge: Edge, progress: number) => {
    const points = getConnectionPoints(edge);
    if (!points) return null;

    const { startX, startY, endX, endY } = points;
    const controlOffset = Math.min(Math.abs(endX - startX) * 0.3, 100);
    const cp1X = startX + controlOffset;
    const cp1Y = startY;
    const cp2X = endX - controlOffset;
    const cp2Y = endY;

    // Bezier curve calculation
    const t = progress;
    const x = Math.pow(1 - t, 3) * startX +
              3 * Math.pow(1 - t, 2) * t * cp1X +
              3 * (1 - t) * Math.pow(t, 2) * cp2X +
              Math.pow(t, 3) * endX;

    const y = Math.pow(1 - t, 3) * startY +
              3 * Math.pow(1 - t, 2) * t * cp1Y +
              3 * (1 - t) * Math.pow(t, 2) * cp2Y +
              Math.pow(t, 3) * endY;

    return { x, y };
  };

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      drawEdge(ctx, edge, edge.id === selectedEdge);
    });

    // Draw nodes
    nodes.forEach(node => {
      drawNode(ctx, node);
    });

    // Draw packets
    packets.forEach(packet => {
      drawPacket(ctx, packet);
    });
  }, [nodes, edges, packets, selectedEdge]);

  // Animation loop
  const animate = useCallback(() => {
    frameCountRef.current++;

    // Update packets
    setPackets(prev => {
      const updated = prev.map(packet => {
        const edge = edges.find(e => e.id === packet.edgeId);
        if (!edge) return packet;

        const newProgress = packet.progress + animationConfig.speed;

        if (newProgress >= 1) {
          // Packet reached destination, remove it
          return null;
        }

        const position = getPacketPosition(edge, newProgress);
        if (!position) return packet;

        return {
          ...packet,
          x: position.x,
          y: position.y,
          progress: newProgress
        };
      }).filter(Boolean) as Packet[];

      // Add new packets based on frequency
      if (selectedEdge && frameCountRef.current % animationConfig.frequency === 0) {
        const edge = edges.find(e => e.id === selectedEdge);
        if (edge) {
          const position = getPacketPosition(edge, 0);
          if (position) {
            updated.push({
              id: `packet-${Date.now()}-${Math.random()}`,
              x: position.x,
              y: position.y,
              targetX: 0,
              targetY: 0,
              progress: 0,
              color: animationConfig.color,
              size: animationConfig.size,
              edgeId: selectedEdge
            });
          }
        }
      }

      return updated;
    });

    render();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [render, selectedEdge, edges, animationConfig]);

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Handle canvas clicks
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on an edge (simplified hit detection)
    for (const edge of edges) {
      const points = getConnectionPoints(edge);
      if (!points) continue;

      const { startX, startY, endX, endY } = points;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      // Simple distance check to edge midpoint
      const distance = Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2));
      if (distance < 30) {
        setSelectedEdge(edge.id === selectedEdge ? null : edge.id);
        return;
      }
    }

    setSelectedEdge(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Canvas */}
      <div className="flex-1 p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-300 bg-white rounded-lg shadow-lg cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Animation Controls</h3>

          {selectedEdge ? (
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Speed</label>
                <input
                  type="range"
                  min="0.005"
                  max="0.05"
                  step="0.005"
                  value={animationConfig.speed}
                  onChange={(e) => setAnimationConfig(prev => ({ ...prev, speed: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{animationConfig.speed.toFixed(3)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="10"
                  value={animationConfig.frequency}
                  onChange={(e) => setAnimationConfig(prev => ({ ...prev, frequency: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{animationConfig.frequency} frames</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={animationConfig.size}
                  onChange={(e) => setAnimationConfig(prev => ({ ...prev, size: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{animationConfig.size}px</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={animationConfig.color}
                  onChange={(e) => setAnimationConfig(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-8 border rounded"
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Click on an edge to start animating packets</p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setPackets([])}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Packets
            </button>
            <div className="text-sm text-gray-600 flex items-center">
              Active packets: {packets.length} | Selected edge: {selectedEdge || 'none'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramCanvas;