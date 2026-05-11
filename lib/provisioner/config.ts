// Provisioner runtime configuration — all values pulled from env.
//
// Required vs optional is enforced at first-use, not at module load, so the
// rest of the marketplace app keeps booting even if a DO/CF credential is
// missing. The provisioner worker calls `requireConfig()` at startup instead.

export type ProvisionerConfig = {
  // DigitalOcean
  doToken: string;
  doRegion: string; // e.g. "sgp1"
  doSize: string;   // e.g. "s-1vcpu-1gb"
  doImageSnapshotId: string; // numeric snapshot id; required once snapshot exists
  doImageFallbackSlug: string; // e.g. "ubuntu-24-04-x64" — used before snapshot exists
  doSshKeyIds: string[]; // fingerprints or numeric IDs

  // Cloudflare
  cfToken: string;
  cfZoneId: string;      // zone of the platform main domain (subdomains live here)
  cfPlatformDomain: string; // e.g. "basketplace.co"

  // Control plane base URL (Caddy on-droplet calls this for on-demand TLS)
  controlPlaneBaseUrl: string;

  // Cross-droplet shared secret used to sign internal calls
  // (control plane ↔ droplet update agent, on-demand TLS ask endpoint).
  internalApiSecret: string;

  // Notifier for "ready_for_whitelist" admin alerts
  whitelistAlertChannel: "discord" | "line" | "console";
  whitelistAlertWebhookUrl: string | null;
};

let cached: ProvisionerConfig | null = null;

function readEnv(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v && v.trim().length > 0) return v.trim();
  if (fallback !== undefined) return fallback;
  return "";
}

export function getConfig(): ProvisionerConfig {
  if (cached) return cached;
  cached = {
    doToken: readEnv("DIGITALOCEAN_TOKEN"),
    doRegion: readEnv("DO_REGION", "sgp1"),
    doSize: readEnv("DO_SIZE", "s-1vcpu-1gb"),
    doImageSnapshotId: readEnv("DO_SHOP_SNAPSHOT_ID"),
    doImageFallbackSlug: readEnv("DO_FALLBACK_IMAGE", "ubuntu-24-04-x64"),
    doSshKeyIds: readEnv("DO_SSH_KEY_IDS")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    cfToken: readEnv("CLOUDFLARE_API_TOKEN"),
    cfZoneId: readEnv("CLOUDFLARE_ZONE_ID"),
    cfPlatformDomain: readEnv("MAIN_DOMAIN", "basketplace.co"),
    controlPlaneBaseUrl: readEnv("CONTROL_PLANE_BASE_URL", readEnv("NEXT_PUBLIC_BASE_URL")),
    internalApiSecret: readEnv("INTERNAL_API_SECRET"),
    whitelistAlertChannel:
      (readEnv("WHITELIST_ALERT_CHANNEL", "console") as "discord" | "line" | "console"),
    whitelistAlertWebhookUrl: readEnv("WHITELIST_ALERT_WEBHOOK_URL") || null,
  };
  return cached;
}

export class ProvisionerConfigError extends Error {
  constructor(field: keyof ProvisionerConfig) {
    super(`Provisioner config missing required field: ${field}`);
  }
}

export function requireConfig(): ProvisionerConfig {
  const c = getConfig();
  const required: (keyof ProvisionerConfig)[] = [
    "doToken",
    "doRegion",
    "doSize",
    "cfToken",
    "cfZoneId",
    "cfPlatformDomain",
    "controlPlaneBaseUrl",
    "internalApiSecret",
  ];
  for (const k of required) {
    const v = c[k];
    if (!v || (Array.isArray(v) && v.length === 0)) {
      throw new ProvisionerConfigError(k);
    }
  }
  return c;
}

// Reset between tests / runtime config reloads.
export function _resetConfigForTests() {
  cached = null;
}
