"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Must match the key the wizard actually writes (kyc-wizard.tsx → "kyc.session").
// The pre-2026-05-17 wizard used "kyc.session.v3"; stale entries under that
// old key were silently hijacking fresh ?c= invite landings (redirecting to
// ?sid=OLD and dropping the invite code), so we proactively clear it.
const LOCAL_STORAGE_KEY = "kyc.session";
const LEGACY_STORAGE_KEY = "kyc.session.v3";

export function KycResumeRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Purge the dead key from the previous wizard version.
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);

      // Already on a specific session (resume / view) — nothing to do, and
      // redirecting again would loop.
      const params = new URLSearchParams(window.location.search);
      if (params.get("sid")) return;

      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { sid?: string };
      if (!parsed?.sid) return;

      // Preserve existing query params — crucially the agent invite code `c`,
      // so resuming a cached session never strips the referral the landing
      // gate (and /api/wizard) requires for a fresh start.
      params.set("sid", parsed.sid);
      router.replace(`/apply?${params.toString()}`);
    } catch {
      // Ignore invalid local cache and keep normal landing flow.
    }
  }, [router]);

  return null;
}
