"use client";

import { useCallback, useRef, useEffect } from 'react';
import type { DiagramNode, DiagramEdge, NodeGroup, Viewport, AnimationConfig, FlowConfig } from '@/types/diagram';

interface SavePayload {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: NodeGroup[];
  viewport: Viewport;
  animationConfigs?: Record<string, AnimationConfig>;
  flowConfigs?: FlowConfig[];
}

/**
 * Debounced auto-save hook.
 *
 * Waits `delay` ms after the last call before actually persisting to Firestore.
 * Also flushes on unmount so no data is lost when navigating away.
 *
 * @param projectId  The current project ID (skip save when "demo" or falsy)
 * @param delay      Debounce delay in milliseconds (default 2000)
 */
export function useDebouncedSave(projectId: string | undefined, delay = 2000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<SavePayload | null>(null);
  const isSavingRef = useRef(false);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const payload = latestPayloadRef.current;
    if (!payload || !projectId || projectId === 'demo' || isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      const { saveProjectData } = await import('@/lib/projectStorage');
      await saveProjectData(projectId, payload);
    } catch (error) {
      console.error('Debounced auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
      latestPayloadRef.current = null;
    }
  }, [projectId]);

  const save = useCallback(
    (payload: SavePayload) => {
      if (!projectId || projectId === 'demo') return;

      latestPayloadRef.current = payload;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(flush, delay);
    },
    [projectId, delay, flush],
  );

  // Flush pending save on unmount (e.g. navigating away)
  useEffect(() => {
    return () => {
      if (latestPayloadRef.current) {
        flush();
      }
    };
  }, [flush]);

  return { save, flush };
}
