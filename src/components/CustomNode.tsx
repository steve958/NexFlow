"use client";
import { Handle, Position, NodeProps } from "reactflow";

type Data = { label: string; kind: "service"|"database"|"queue"|"gateway" };

export default function CustomNode({ data }: NodeProps<Data>) {
  return (
    <div className="rounded-xl border bg-white px-3 py-2 shadow-sm min-w-[140px]">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{data.kind}</div>
      <div className="font-medium">{data.label}</div>

      {/* target on the left, source on the right */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
