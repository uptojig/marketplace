// Build a cloud-init user-data script for a fresh shop droplet.
//
// The droplet is booted from a *snapshot* that already has Docker, Caddy,
// and the shop app image pre-installed. Cloud-init only injects per-shop
// secrets + tells the on-droplet update agent which shop it is. This
// keeps boot time near 30s instead of 5 min worth of apt installs.
//
// If the snapshot doesn't exist yet (first deploy, before snapshot.sh has
// been run), fall back to a longer install-everything bootstrap.

import { getConfig } from "./config";

export type CloudInitInput = {
  shopId: string;
  shopSlug: string;
  shopDomains: string[]; // ordered list -- slug subdomain first, custom after
  // Postgres URL the shop droplet uses to reach the managed DB over VPC.
  // We pass the schema name separately so we don't leak the master URL.
  databaseUrl: string;
  databaseSchema: string;
  // Internal API secret -- droplet uses this to authenticate to control plane
  // (caddy ask, update-agent heartbeats).
  internalApiSecret: string;
  // NextAuth secret -- shop app boots with auth pages, so this must be set
  // or every request hits NO_SECRET MissingSecretError.
  nextauthSecret: string;
  // Control plane base URL -- used by Caddy's `on_demand_tls ask` endpoint
  // and the update-agent's `/internal/agent/...` calls.
  controlPlaneBaseUrl: string;
  // Google OAuth — when both are set, the shop registers the Google
  // provider in NextAuth. The OAuth client's Authorized Redirect URIs
  // must include `https://<primary-domain>/api/auth/callback/google`
  // for each shop; Google doesn't expose an API to register those, so
  // operators add them manually via the Cloud Console.
  googleClientId?: string;
  googleClientSecret?: string;
  // SMTP creds for NextAuth EmailProvider (magic-link signup). Optional —
  // when either is unset the provider doesn't register and email signup
  // is silently disabled.
  emailServer?: string;
  emailFrom?: string;
  // DigitalOcean Spaces creds for /api/admin/upload (image picker).
  // Optional — when unset, /api/admin/upload returns 503.
  spacesEndpoint?: string;
  spacesRegion?: string;
  spacesBucket?: string;
  spacesKey?: string;
  spacesSecret?: string;
  // Whether snapshot is available -- falls back to bootstrap install if not.
  useSnapshot: boolean;
  // Optional override for the shop image registry coordinates.
  shopImage?: string;
};

const DEFAULT_SHOP_IMAGE = process.env.SHOP_IMAGE ?? "registry.digitalocean.com/marketplace/shop-app:latest";

export function renderCloudInit(input: CloudInitInput): string {
  const cfg = getConfig();
  const image = input.shopImage ?? DEFAULT_SHOP_IMAGE;

  // env file written to /opt/marketplace-shop/.env
  //
  // primaryHost: the URL the buyer sees in the address bar — custom
  // domain when set, slug subdomain otherwise. NEXTAUTH_URL must
  // match this exactly so the OAuth callback lands on the same
  // origin the shopper is browsing from (Google would otherwise
  // refuse the redirect for mismatched URIs).
  const slugSubdomain = `${input.shopSlug}.${cfg.cfPlatformDomain}`;
  const primaryHost =
    input.shopDomains.find((d) => d && d !== slugSubdomain) ?? slugSubdomain;
  const envFile = [
    `SHOP_ID=${input.shopId}`,
    `SHOP_SLUG=${input.shopSlug}`,
    `SHOP_DOMAINS=${input.shopDomains.join(",")}`,
    `DATABASE_URL=${input.databaseUrl}`,
    `DATABASE_SCHEMA=${input.databaseSchema}`,
    `CONTROL_PLANE_BASE_URL=${input.controlPlaneBaseUrl}`,
    `INTERNAL_API_SECRET=${input.internalApiSecret}`,
    `NEXTAUTH_SECRET=${input.nextauthSecret}`,
    `NEXTAUTH_URL=https://${primaryHost}`,
    `NEXT_PUBLIC_BASE_URL=https://${primaryHost}`,
    `PLATFORM_DOMAIN=${cfg.cfPlatformDomain}`,
    ...(input.googleClientId ? [`GOOGLE_CLIENT_ID=${input.googleClientId}`] : []),
    ...(input.googleClientSecret ? [`GOOGLE_CLIENT_SECRET=${input.googleClientSecret}`] : []),
    ...(input.emailServer ? [`EMAIL_SERVER=${input.emailServer}`] : []),
    ...(input.emailFrom ? [`EMAIL_FROM=${input.emailFrom}`] : []),
    ...(input.spacesEndpoint ? [`SPACES_ENDPOINT=${input.spacesEndpoint}`] : []),
    ...(input.spacesRegion ? [`SPACES_REGION=${input.spacesRegion}`] : []),
    ...(input.spacesBucket ? [`SPACES_BUCKET=${input.spacesBucket}`] : []),
    ...(input.spacesKey ? [`SPACES_KEY=${input.spacesKey}`] : []),
    ...(input.spacesSecret ? [`SPACES_SECRET=${input.spacesSecret}`] : []),
    `TZ=Asia/Bangkok`,
  ].join("\n");

  // The Caddyfile uses on-demand TLS for any host that isn't the slug
  // subdomain (which has a static wildcard cert pre-baked into the snapshot
  // and refreshed by Caddy via DNS-01 on the platform zone).
  const caddyfile = `
{
        admin off
        on_demand_tls {
                ask ${input.controlPlaneBaseUrl}/api/provisioner/caddy-ask
        }
        servers {
                protocols h1 h2 h3
        }
}

# Slug subdomain -- managed by the platform's own wildcard cert distributed via snapshot.
${input.shopSlug}.${cfg.cfPlatformDomain} {
        encode zstd gzip
        reverse_proxy localhost:3000
}

# Catch-all -- custom domains. Caddy validates against the ask endpoint
# before issuing a cert via Let's Encrypt HTTP-01.
:443 {
        encode zstd gzip
        tls {
                on_demand
        }
        reverse_proxy localhost:3000
}

# HTTP -> HTTPS redirect for any host.
:80 {
        redir https://{host}{uri} permanent
}
`;

  // update-agent runs as a host-side systemd unit (not a container) because
  // the only container image available on droplets is shop-app, which is a
  // slim Node base without the docker CLI -- it can't drive docker.sock even
  // with the socket mounted. Running on the host gives us the docker CLI
  // + compose plugin for free.
  const dockerCompose = `
services:
  shop:
    image: ${image}
    restart: unless-stopped
    env_file: /opt/marketplace-shop/.env
    network_mode: host
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 30s

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    network_mode: host
    volumes:
      - /opt/marketplace-shop/Caddyfile:/etc/caddy/Caddyfile:ro
      - /var/lib/caddy:/data
      - /var/log/caddy:/var/log/caddy
`;

  // Compare-by-digest, not by tag-string: `:latest == :latest` always equals
  // true even when the registry moves the tag to a new image, which silently
  // pinned every droplet to the image baked into the snapshot. Using image
  // IDs forces a recreate whenever `docker pull` brings down a different
  // digest under the same tag.
  const updateAgent = `#!/bin/sh
# Pull-based update agent. Polls every $INTERVAL seconds; if the registry
# digest behind \${IMAGE} differs from the running container's image ID,
# recreate the shop container via compose.
set -u
INTERVAL=300
DEFAULT_IMAGE="${image}"
CONTAINER="marketplace-shop-shop-1"

. /opt/marketplace-shop/.env

while true; do
  # Desired image from control plane (with fallback). Allows pinning a
  # specific tag per shop for canary / rollback.
  RESP=$(wget -qO- --timeout=15 \\
    --header="Authorization: Bearer $INTERNAL_API_SECRET" \\
    "$CONTROL_PLANE_BASE_URL/api/provisioner/agent/desired?shopId=$SHOP_ID" 2>/dev/null || echo '{}')
  IMAGE=$(echo "$RESP" | grep -o '"image":"[^"]*"' | cut -d'"' -f4)
  IMAGE="\${IMAGE:-$DEFAULT_IMAGE}"

  # Pull. No-op if registry digest hasn't moved.
  if docker pull "$IMAGE" >/dev/null 2>&1; then
    PULLED_ID=$(docker image inspect "$IMAGE" --format '{{.Id}}' 2>/dev/null || echo "")
    RUNNING_ID=$(docker inspect "$CONTAINER" --format '{{.Image}}' 2>/dev/null || echo "")
    if [ -n "$PULLED_ID" ] && [ "$PULLED_ID" != "$RUNNING_ID" ]; then
      echo "[update-agent] $(date -Iseconds) recreate: $RUNNING_ID -> $PULLED_ID"
      cd /opt/marketplace-shop
      docker compose up -d --no-deps shop || echo "[update-agent] recreate failed"
    fi
  fi

  CURRENT_ID=$(docker inspect "$CONTAINER" --format '{{.Image}}' 2>/dev/null || echo "")
  wget -q --timeout=10 \\
    --post-data="shopId=$SHOP_ID&running=$CURRENT_ID" \\
    --header="Authorization: Bearer $INTERNAL_API_SECRET" \\
    "$CONTROL_PLANE_BASE_URL/api/provisioner/agent/heartbeat" -O /dev/null 2>/dev/null || true

  sleep $INTERVAL
done
`;

  const updateAgentUnit = `[Unit]
Description=Marketplace Shop Update Agent
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=simple
ExecStart=/opt/marketplace-shop/update-agent.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;

  const snapshotBoot = `#cloud-config
write_files:
  - path: /opt/marketplace-shop/.env
    permissions: '0600'
    content: |
${envFile.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /opt/marketplace-shop/Caddyfile
    permissions: '0644'
    content: |
${caddyfile.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /opt/marketplace-shop/docker-compose.yml
    permissions: '0644'
    content: |
${dockerCompose.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /opt/marketplace-shop/update-agent.sh
    permissions: '0755'
    content: |
${updateAgent.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /etc/systemd/system/marketplace-shop-update-agent.service
    permissions: '0644'
    content: |
${updateAgentUnit.split("\n").map((l) => `      ${l}`).join("\n")}

runcmd:
  - timedatectl set-timezone Asia/Bangkok
  - mkdir -p /var/lib/caddy /var/log/caddy
  - echo "${cfg.doToken}" | docker login -u "${cfg.doToken}" --password-stdin registry.digitalocean.com
  - cd /opt/marketplace-shop && docker compose pull
  - cd /opt/marketplace-shop && docker compose up -d
  - systemctl daemon-reload
  - systemctl enable --now marketplace-shop-update-agent.service
`;

  if (input.useSnapshot) {
    return snapshotBoot;
  }

  // Fallback: install docker + everything from scratch.
  return `#cloud-config
package_update: true
packages:
  - ca-certificates
  - curl
  - gnupg
  - jq

write_files:
  - path: /opt/marketplace-shop/.env
    permissions: '0600'
    content: |
${envFile.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /opt/marketplace-shop/Caddyfile
    permissions: '0644'
    content: |
${caddyfile.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /opt/marketplace-shop/docker-compose.yml
    permissions: '0644'
    content: |
${dockerCompose.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /opt/marketplace-shop/update-agent.sh
    permissions: '0755'
    content: |
${updateAgent.split("\n").map((l) => `      ${l}`).join("\n")}
  - path: /etc/systemd/system/marketplace-shop-update-agent.service
    permissions: '0644'
    content: |
${updateAgentUnit.split("\n").map((l) => `      ${l}`).join("\n")}

runcmd:
  - timedatectl set-timezone Asia/Bangkok
  - install -m 0755 -d /etc/apt/keyrings
  - curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  - chmod a+r /etc/apt/keyrings/docker.gpg
  - echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  - apt-get update
  - DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  - mkdir -p /var/lib/caddy /var/log/caddy
  - echo "${cfg.doToken}" | docker login -u "${cfg.doToken}" --password-stdin registry.digitalocean.com
  - cd /opt/marketplace-shop && docker compose pull
  - cd /opt/marketplace-shop && docker compose up -d
  - systemctl daemon-reload
  - systemctl enable --now marketplace-shop-update-agent.service
`;
}
