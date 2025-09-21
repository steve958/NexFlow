"use client";

import { getFirebaseRtdb, getFirebaseAuth } from "@/lib/firestoreClient";
import { ref, onDisconnect, set, serverTimestamp, onValue, update, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useRef, useState } from "react";

const COLORS = ["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899"];

export function usePresence(sceneId: string) {
  const [uid, setUid] = useState<string | null>(null);
  const [peers, setPeers] = useState<Record<string, { cursor?: { x: number; y: number }; color?: string; email?: string }>>({});
  const colorRef = useRef<string>(COLORS[Math.floor(Math.random()*COLORS.length)]);

  // join/leave
  useEffect(() => {
    const auth = getFirebaseAuth();
    const rtdb = getFirebaseRtdb();

    if (!auth || !rtdb) return;

    let unsub = () => {};
    const offAuth = onAuthStateChanged(auth, (u) => {
      if (!u) return;
      setUid(u.uid);
      const meRef = ref(rtdb, `presence/${sceneId}/${u.uid}`);
      set(meRef, {
        name: u.displayName ?? (u.email?.split("@")[0] ?? "user"),
        color: colorRef.current,
        cursor: null,
        selection: [],
        ts: serverTimestamp(),
      });
      onDisconnect(meRef).remove(); // auto cleanup if tab closes
      // keep a tiny heartbeat every 30s (optional)
      const id = setInterval(() => update(meRef, { ts: serverTimestamp() }), 30000);
      unsub = () => clearInterval(id);
    });
    return () => { unsub(); offAuth(); };
  }, [sceneId]);

  // read room
  useEffect(() => {
    const rtdb = getFirebaseRtdb();
    if (!rtdb) return;

    const roomRef = ref(rtdb, `presence/${sceneId}`);
    return onValue(roomRef, (snap) => setPeers(snap.val() ?? {}));
  }, [sceneId]);

  // helpers
  const onlineCount = useMemo(() => Object.keys(peers).length, [peers]);
  const me = uid ? peers[uid] : null;

  const updateCursor = (cursor: {x:number,y:number} | null) => {
    if (!uid) return;
    const rtdb = getFirebaseRtdb();
    if (!rtdb) return;
    return update(ref(rtdb, `presence/${sceneId}/${uid}`), { cursor, ts: serverTimestamp() });
  };

  const updateSelection = (nodeIds: string[]) => {
    if (!uid) return;
    const rtdb = getFirebaseRtdb();
    if (!rtdb) return;
    return update(ref(rtdb, `presence/${sceneId}/${uid}`), { selection: nodeIds, ts: serverTimestamp() });
  };

  const leave = async () => {
    if (!uid) return;
    const rtdb = getFirebaseRtdb();
    if (!rtdb) return;
    await remove(ref(rtdb, `presence/${sceneId}/${uid}`));
  };

  return { peers, onlineCount, me, updateCursor, updateSelection, leave };
}
