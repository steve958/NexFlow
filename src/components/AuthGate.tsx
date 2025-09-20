"use client";
import { ReactNode, useEffect, useState } from "react";
import { auth } from "@/lib/firestoreClient";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<null | { uid: string; email?: string }>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    return onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, email: u.email ?? undefined } : null);
      setLoading(false);
    });
  }, [mounted]);

  // Show loading during SSR and initial mount
  if (!mounted || loading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="p-6 rounded-2xl border max-w-sm w-full">
          <h1 className="text-xl font-semibold mb-3">Sign in</h1>
          <button
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
            className="w-full rounded-xl border px-4 py-2 hover:bg-muted"
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
