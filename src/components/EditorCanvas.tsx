"use client";
import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, Connection, Node, Edge,
  applyNodeChanges, applyEdgeChanges, ReactFlowProvider, useReactFlow,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "@/components/CustomNode";
import SimpleAnimationPanel from "@/components/SimpleAnimationPanel";
import ClientOnly from "@/components/ClientOnly";
import { useOverlayAnimations } from "@/hooks/useOverlayAnimations";

const nodeTypes = { custom: CustomNode };

// Use stable IDs for SSR compatibility
const newId = (() => {
  let counter = 0;
  return () => `node-${++counter}`;
})();

function CanvasInner() {
  // start with two nodes so you can animate immediately
  const [nodes, setNodes] = useState<Node[]>([
    { id: "svc", position: { x: 60, y: 120 }, data: { label: "Service",  kind: "service"  }, type: "custom" },
    { id: "db",  position: { x: 360, y: 120 }, data: { label: "Database", kind: "database" }, type: "custom" },
    { id: "api", position: { x: 60, y: 220 }, data: { label: "API Gateway", kind: "gateway" }, type: "custom" },
    { id: "queue", position: { x: 360, y: 220 }, data: { label: "Message Queue", kind: "queue" }, type: "custom" },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { id: "e1", source: "svc", target: "db", label: "writes" },
    { id: "e2", source: "api", target: "svc", label: "requests" },
    { id: "e3", source: "svc", target: "queue", label: "events" },
  ]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { project } = useReactFlow();

  // Overlay SVG animation system
  const {
    containerRef,
    activeAnimations,
    startEdgeAnimation,
    stopEdgeAnimation,
    stopAllAnimations
  } = useOverlayAnimations();

  // Track selected edges
  const selectedEdges = edges.filter(edge => edge.selected);
  const selectedEdge = selectedEdges.length === 1 ? selectedEdges[0] : null;

  // reactflow change handlers
  const onNodesChange = useCallback((changes: Parameters<typeof applyNodeChanges>[0]) => {
    setNodes((ns) => applyNodeChanges(changes, ns));
  }, []);
  const onEdgesChange = useCallback((changes: Parameters<typeof applyEdgeChanges>[0]) => {
    setEdges((es) => applyEdgeChanges(changes, es));
  }, []);

  // connect by dragging between handles
  const onConnect = useCallback((c: Connection) => {
    setEdges((eds) => addEdge({ ...c }, eds));
  }, []);

  // enable drag-and-drop from Sidebar
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/reactflow");
    if (!raw || !wrapperRef.current) return;

    const item = JSON.parse(raw) as { type: "service"|"database"|"queue"|"gateway"; label: string };
    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });

    setNodes((ns) => ns.concat({
      id: newId(),
      position,
      type: "custom",
      data: { label: item.label, kind: item.type },
    }));
  }, [project]);

  // Handle edge animation start
  const handleStartEdgeAnimation = useCallback((edgeId: string, config: { size: number; color: string; speed: number; frequency: number }) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;

    startEdgeAnimation(edgeId, edge, nodes, config);
  }, [edges, nodes, startEdgeAnimation]);

  // Handle edge animation stop
  const handleStopEdgeAnimation = useCallback((edgeId: string) => {
    stopEdgeAnimation(edgeId);
  }, [stopEdgeAnimation]);

  return (
    <>
      <div
        ref={(el) => {
          wrapperRef.current = el;
          containerRef.current = el;
        }}
        data-editor-root
        className="relative h-[70vh] w-full rounded-xl border overflow-hidden"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[10, 10]}
          panOnScroll
          selectionMode={SelectionMode.Partial}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={stopAllAnimations}
            className="rounded-xl border bg-white/80 px-3 py-1 shadow hover:bg-white"
            disabled={activeAnimations.length === 0}
          >
            Stop All ({activeAnimations.length})
          </button>
        </div>
      </div>

      <ClientOnly fallback={<div />}>
        <SimpleAnimationPanel
          selectedEdge={selectedEdge}
          nodes={nodes}
          onStartEdgeAnimation={handleStartEdgeAnimation}
          onStopEdgeAnimation={handleStopEdgeAnimation}
          activeAnimations={activeAnimations}
        />
      </ClientOnly>
    </>
  );
}

export default function EditorCanvas() {
  return (
    <ClientOnly fallback={<div className="h-[70vh] w-full rounded-xl border bg-gray-50 flex items-center justify-center text-gray-500">Loading canvas...</div>}>
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </ClientOnly>
  );
}
