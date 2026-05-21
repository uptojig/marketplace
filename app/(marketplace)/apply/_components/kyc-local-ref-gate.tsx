"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Bridges the server /apply gate (which can't read localStorage) and a
 * previously-captured invite code. If a code was stored on an earlier
 * visit we silently re-enter /apply with it; otherwise the page behaves
 * as if it does not exist (notFound) — no mention of any invite system.
 */
export function KycLocalRefGate() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRef = window.localStorage.getItem("bp.ref");
    if (storedRef) {
      const params = new URLSearchParams(window.location.search);
      params.set("c", storedRef);
      router.replace(`/apply?${params.toString()}`);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-mp-cream">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-mp-coral animate-spin mx-auto mb-3" />
          <p className="text-[15px] text-mp-ink-muted">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  notFound();
}
