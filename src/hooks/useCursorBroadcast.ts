"use client";
import { useEffect, useRef } from "react";

export function useCursorBroadcast(
  enabled: boolean,
  container: HTMLElement | null,
  updateCursor: (c: {x:number,y:number} | null) => void
) {
  const raf = useRef<number | null>(null);
  const last = useRef<{x:number,y:number} | null>(null);

  useEffect(() => {
    if (!enabled || !container) return;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      last.current = { x, y };
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        if (last.current) updateCursor(last.current);
        raf.current = null;
      });
    };
    const onLeave = () => updateCursor(null);

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) updateCursor(null);
    });

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled, container, updateCursor]);
}
