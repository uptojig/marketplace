"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Snapshot of the landing-page generation status as returned by
 * `GET /api/admin/stores/[id]/landing`. Used by the polling hook and
 * the StatusCard variants.
 */
export type LandingStatusSnapshot = {
  status: "generating" | "ready" | "failed" | null;
  error: string | null;
  brief: string | null;
  startedAt: string | null;
  generatedAt: string | null;
  blockCount: number;
  title: string | null;
  themeVariant: string | null;
};

export type StreamEvent = {
  type: string;
  message?: string;
};

const POLL_INTERVAL_MS = 4000;

/**
 * Polls the admin landing endpoint at a fixed interval and exposes:
 * - the latest snapshot (`status`)
 * - a stable `consumeStream` callback that drains an NDJSON streaming
 *   response from `generate-landing` and forwards parsed events back to
 *   the caller so they can update message UI.
 *
 * When a poll completes and the previously-generating job is no longer
 * "generating", the hook calls `router.refresh()` to pull the new
 * landing schema from the server component above.
 */
export function useLandingStatus(storeId: string, generating: boolean) {
  const router = useRouter();
  const [status, setStatus] = useState<LandingStatusSnapshot | null>(null);

  useEffect(() => {
    let stop = false;
    let prevGenerating = generating;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/admin/stores/${storeId}/landing`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as LandingStatusSnapshot;
        if (stop) return;
        setStatus(data);
        if (data.status && data.status !== "generating" && prevGenerating) {
          prevGenerating = false;
          router.refresh();
        }
      } catch {
        // ignore — keep polling
      }
    }

    void fetchStatus();
    const id = setInterval(() => {
      if (stop) return;
      void fetchStatus();
    }, POLL_INTERVAL_MS);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [storeId, generating, router]);

  /**
   * Drain an NDJSON stream emitted by `generate-landing` and forward
   * each parsed line back to `onEvent`. Silently skips malformed lines
   * so a single bad chunk doesn't kill the whole connection.
   */
  const consumeStream = useCallback(
    async (
      body: ReadableStream<Uint8Array>,
      onEvent: (evt: StreamEvent) => void,
    ) => {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const evt = JSON.parse(trimmed) as StreamEvent;
              onEvent(evt);
            } catch {
              // skip malformed lines
            }
          }
        }
      } catch {
        // stream closed
      }
    },
    [],
  );

  return { status, consumeStream };
}
