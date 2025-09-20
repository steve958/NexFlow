"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, Connection, Node, Edge,
  applyNodeChanges, applyEdgeChanges, ReactFlowProvider, useReactFlow,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import gsap from "gsap";
import CustomNode from "@/components/CustomNode";

const nodeTypes = { custom: CustomNode };

let idSeq = 1;
const newId = () => String(idSeq++);

function CanvasInner() {
  // start with two nodes so you can animate immediately
  const [nodes, setNodes] = useState<Node[]>([
    { id: "svc", position: { x: 60, y: 120 }, data: { label: "Service",  kind: "service"  }, type: "custom" },
    { id: "db",  position: { x: 360, y: 120 }, data: { label: "Database", kind: "database" }, type: "custom" },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { id: "e1", source: "svc", target: "db", label: "writes" },
  ]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const packetRef  = useRef<HTMLDivElement | null>(null);
  const { project } = useReactFlow();

  // reactflow change handlers
  const onNodesChange = useCallback((changes: any) => {
    setNodes((ns) => applyNodeChanges(changes, ns));
  }, []);
  const onEdgesChange = useCallback((changes: any) => {
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

  // animate along a selected edge (or first edge if none selected)
  const onAnimate = useCallback(() => {
    const edge = edges.find(e => e.selected) ?? edges[0];
    if (!edge || !packetRef.current) return;

    const byId = new Map(nodes.map(n => [n.id, n]));
    const src = byId.get(edge.source);
    const dst = byId.get(edge.target);
    if (!src || !dst) return;

    // rough centers (depends on node size; adjust offsets as you style nodes)
    const sx = src.position.x + 80, sy = src.position.y + 40;
    const dx = dst.position.x + 80, dy = dst.position.y + 40;

    gsap.set(packetRef.current, { x: sx, y: sy, opacity: 1 });
    gsap.to(packetRef.current, { x: dx, y: dy, duration: 1.2, ease: "power2.inOut" });
  }, [edges, nodes]);

  const packet = useMemo(
    () => <div ref={packetRef} className="absolute w-2 h-2 rounded-full bg-black opacity-0" />,
    []
  );

  return (
    <div
      ref={wrapperRef}
      data-editor-root
      className="relative h-[70vh] w-full rounded-xl border overflow-hidden"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {packet}
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

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button onClick={onAnimate} className="rounded-xl border bg-white/80 px-3 py-1 shadow">
          Animate
        </button>
      </div>
    </div>
  );
}

export default function EditorCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
