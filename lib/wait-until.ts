// Drop-in replacement for `waitUntil` from `@vercel/functions`.
//
// On Vercel, `waitUntil` keeps the serverless invocation alive until the
// passed promise resolves so background work (analytics, cache fills,
// translation back-fills) finishes even after the HTTP response is sent.
//
// On a long-lived Node server (DO droplet, this repo's deployment target)
// the process doesn't exit between requests — passing a promise here is
// enough to keep it running. We attach a defensive `.catch` so unhandled
// rejections don't crash the process.
export function waitUntil(promise: Promise<unknown>): void {
  promise.catch((err) => {
    console.error("[waitUntil] unhandled rejection:", err);
  });
}
