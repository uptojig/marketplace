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

      // Skip auto-resume in these cases:
      //   - sid in URL → already on a specific session; redirecting would loop.
      //   - c  in URL → an agent invite link is an explicit "start fresh under
      //     this agent" signal. Auto-resuming a cached old session here would
      //     silently drop the user back into an unrelated past application
      //     (returning visitors were getting ?c=0001 rewritten to
      //     ?c=0001&sid=<cached> every time). Refresh mid-wizard is unaffected
      //     because the wizard's URL carries ?sid= once a session has started.
      const params = new URLSearchParams(window.location.search);
      if (params.get("sid") || params.get("c")) return;

      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { sid?: string };
      if (!parsed?.sid) return;

      // No c / sid in URL — bare /apply visit. Resume the cached session by
      // appending its sid (other params, if any, are preserved).
      params.set("sid", parsed.sid);
      router.replace(`/apply?${params.toString()}`);
    } catch {
      // Ignore invalid local cache and keep normal landing flow.
    }
  }, [router]);

  return null;
}
