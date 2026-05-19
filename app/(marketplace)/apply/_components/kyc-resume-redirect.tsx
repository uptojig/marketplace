"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LOCAL_STORAGE_KEY = "kyc.session.v3";

export function KycResumeRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { sid?: string };
      if (!parsed?.sid) return;
      router.replace(`/apply?sid=${encodeURIComponent(parsed.sid)}`);
    } catch {
      // Ignore invalid local cache and keep normal landing flow.
    }
  }, [router]);

  return null;
}

