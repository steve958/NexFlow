"use client";
import { useEffect, useRef } from "react";
import { usePresence } from "@/hooks/usePresence";
import { useCursorBroadcast } from "@/hooks/useCursorBroadcast";
import CursorOverlay from "@/components/CursorOverlay";
import { PresenceBadge } from "@/components/PresenceBadge";

export default function PresenceClient({ sceneId }: { sceneId: string }) {
  const { peers, onlineCount, updateCursor } = usePresence(sceneId);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    containerRef.current = document.querySelector("[data-editor-root]") as HTMLElement | null;
  }, []);

  useCursorBroadcast(true, containerRef.current, updateCursor);

  return (
    <>
      <PresenceBadge count={onlineCount} />
      <div className="relative">
        <CursorOverlay peers={peers} />
      </div>
    </>
  );
}
