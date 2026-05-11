// Cheap liveness probe — does NOT touch the database. Used by both:
//
//   - Docker healthcheck inside each shop droplet's `shop` container
//   - The provisioner's WAIT_FOR_APP_READY job (over HTTPS via the slug
//     subdomain, so it also exercises Caddy + DNS)
//   - Cron health poller that updates ShopDeployment.healthyAt
//
// We keep this dependency-free so a misconfigured DB / migrated-out DATABASE_URL
// doesn't make a shop droplet appear dead from the control plane's perspective.

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      shopId: process.env.SHOP_ID ?? null,
      runtime: process.env.NODE_ENV ?? "unknown",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    },
  );
}
