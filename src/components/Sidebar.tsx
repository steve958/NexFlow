"use client";

const items = [
  { type: "service", label: "Service" },
  { type: "database", label: "Database" },
  { type: "queue", label: "Queue" },
  { type: "gateway", label: "API Gateway" },
];

export default function Sidebar() {
  const onDragStart = (e: React.DragEvent, item: {type:string; label:string}) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-48 shrink-0 border rounded-xl p-3 space-y-2">
      <div className="text-sm font-medium mb-2">Palette</div>
      {items.map((it) => (
        <div
          key={it.type}
          draggable
          onDragStart={(e) => onDragStart(e, it)}
          className="cursor-grab active:cursor-grabbing select-none rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          {it.label}
        </div>
      ))}
    </aside>
  );
}
