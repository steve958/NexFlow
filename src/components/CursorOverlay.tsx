"use client";
type Peers = Record<string, { name?:string; color?:string; cursor?:{x:number,y:number}|null }>;

export default function CursorOverlay({ peers }: { peers: Peers }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Object.entries(peers).map(([id, p]) => {
        if (!p?.cursor) return null;
        const { x, y } = p.cursor;
        return (
          <div key={id} style={{ transform: `translate(${x}px, ${y}px)` }} className="absolute -translate-x-1 -translate-y-6">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color ?? "#111" }} />
            <div className="text-[10px] px-1 rounded bg-white/90 border mt-1">
              {p.name ?? "user"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
