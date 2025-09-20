"use client";
export function PresenceBadge({ count }: { count: number }) {
  return (
    <div className="rounded-full border bg-white/80 px-3 py-1 text-sm shadow-sm">
      Online: {count}
    </div>
  );
}
