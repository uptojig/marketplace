// Lightweight `waitUntil(promise)` for fire-and-forget background work
// (analytics, cache fills, translation back-fills) that should outlive
// the HTTP response.
//
// On a long-lived Node server (DigitalOcean droplet — this repo's
// deployment target) the process doesn't exit between requests, so
// just attaching a defensive `.catch` so unhandled rejections don't
// crash the process is enough.
export function waitUntil(promise: Promise<unknown>): void {
  promise.catch((err) => {
    console.error("[waitUntil] unhandled rejection:", err);
  });
}
