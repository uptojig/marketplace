"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Must match the key the wizard writes (see kyc-wizard.tsx → "kyc.session").
// The pre-2026-05-17 wizard used "kyc.session.v3"; stale entries under that
// old key used to silently hijack fresh ?c= invite landings, so we proactively
// purge it.
const LOCAL_STORAGE_KEY = "kyc.session";
const LEGACY_STORAGE_KEY = "kyc.session.v3";

// States that mean "still doing KYC — resume the wizard here". Terminal /
// landing states are excluded: we don't want to silently drop a returning
// visitor back into an approved / rejected / review screen via a stale cache
// entry. List mirrors IN_PROGRESS in app/(marketplace)/apply/page.tsx.
const IN_PROGRESS_STATES: ReadonlySet<string> = new Set([
  "S1_ID_CARD_REF",
  "S1_ID_CARD_REVIEW",
  "S2_EMAIL_PENDING",
  "S3_OTP_VERIFIED",
  "S1_DGA_CAPTURE",
  "S1_DGA_REVIEW",
  "S2_ID_SELFIE",
  "S3_PHONE_RESPONSE",
  "S4_BANKBOOK_UPLOAD",
  "S5_SUMMARY",
]);

export function KycResumeRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Purge the dead key from the previous wizard version.
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);

        // URL already pins a specific session — leave it alone (and avoid a
        // redirect loop).
        const params = new URLSearchParams(window.location.search);
        if (params.get("sid")) return;

        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { sid?: string };
        if (!parsed?.sid) return;

        // Validate the cached sid against the server BEFORE redirecting.
        //
        // Two failure modes the unguarded redirect used to produce, both
        // healed by this validation:
        //
        //   1. Ghost sid (cached entry pointing at a session that no longer
        //      exists in the DB — e.g. data left over from an older deploy or
        //      from a 1h-expired-then-pruned session). The redirect would land
        //      ?sid=<ghost> without ?c=, the server snapshot would return null,
        //      and the landing fell through with no agent code, so the start
        //      button POSTed an empty body and got 400 agent_code_required.
        //
        //   2. Terminal session (approved / rejected / review). Silently
        //      sending an agent-invite visitor into someone else's previously-
        //      finalized session is the wrong UX even when it doesn't 400.
        //
        // Vendors don't know that an agent referral layer exists (the system
        // is intentionally opaque on that), so `?c=AGENT` is NOT a "start
        // fresh" gesture from their POV — it's just whatever link someone
        // sent them. That means in-progress sessions MUST resume silently so
        // returning visitors don't lose work. Hence the strict
        // exists+IN_PROGRESS+not-expired check below.
        let snapshot: { ok?: boolean; state?: string; expiresAt?: string | null };
        try {
          const res = await fetch(
            `/api/wizard/${encodeURIComponent(parsed.sid)}`,
            { method: "GET", cache: "no-store" },
          );
          if (cancelled) return;
          if (!res.ok) {
            // 404 / 5xx → cached sid is dead. Drop the entry so this user
            // doesn't keep re-validating the same ghost on every visit.
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
            return;
          }
          snapshot = (await res.json()) as typeof snapshot;
        } catch {
          // Network blip — don't redirect, but also don't drop the cache
          // (this might recover next page load).
          return;
        }
        if (cancelled) return;

        const stateOk = !!snapshot.state && IN_PROGRESS_STATES.has(snapshot.state);
        const notExpired =
          !snapshot.expiresAt ||
          new Date(snapshot.expiresAt).getTime() > Date.now();
        if (!snapshot.ok || !stateOk || !notExpired) {
          // Terminal / expired / not-real → don't resume; clear the cache so
          // the next visit starts clean.
          window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          return;
        }

        // Real in-progress session — silently resume. Preserve existing query
        // params (notably ?c=, so the landing gate keeps the referral context
        // if the resume happens to bounce off a non-wizard branch later).
        params.set("sid", parsed.sid);
        router.replace(`/apply?${params.toString()}`);
      } catch {
        // Best-effort. Any unexpected failure → leave the landing flow alone.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
