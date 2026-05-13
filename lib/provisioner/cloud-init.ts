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
  shopDomains: string[]; // ordered list -- primary first, custom after
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
  const primaryHost = `${input.shopSlug}.${cfg.cfPlatformDomain}`;
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

  update-agent:
    image: ${image}
    restart: unless-stopped
    network_mode: host
    env_file: /opt/marketplace-shop/.env
    entrypoint: ["/bin/sh", "/opt/marketplace-shop/update-agent.sh"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /opt/marketplace-shop:/opt/marketplace-shop
`;

  const updateAgent = `#!/bin/sh
# Pull-based update agent. Polls the control plane for desired image
# version every 5 min. If different from currently running, pulls + restarts.
set -e
INTERVAL=300
while true; do
  RESP=$(wget -qO- \\
    --header="Authorization: Bearer $INTERNAL_API_SECRET" \\
    "$CONTROL_PLANE_BASE_URL/api/provisioner/agent/desired?shopId=$SHOP_ID" || echo '{}')
  DESIRED=$(echo "$RESP" | grep -o '"image":"[^"]*"' | cut -d'"' -f4 || true)
  CURRENT=$(docker inspect shop --format '{{.Config.Image}}' 2>/dev/null || echo "")
  if [ -n "$DESIRED" ] && [ "$DESIRED" != "$CURRENT" ]; then
    echo "[update-agent] $CURRENT -> $DESIRED"
    docker pull "$DESIRED" || { sleep $INTERVAL; continue; }
    cd /opt/marketplace-shop
    SHOP_IMAGE="$DESIRED" docker compose up -d --no-deps shop
  fi
  # heartbeat
  wget -q --post-data="shopId=$SHOP_ID&running=$CURRENT" \\
    --header="Authorization: Bearer $INTERNAL_API_SECRET" \\
    "$CONTROL_PLANE_BASE_URL/api/provisioner/agent/heartbeat" -O /dev/null || true
  sleep $INTERVAL
done
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

runcmd:
  - timedatectl set-timezone Asia/Bangkok
  - mkdir -p /var/lib/caddy /var/log/caddy
  - echo "${cfg.doToken}" | docker login -u "${cfg.doToken}" --password-stdin registry.digitalocean.com
  - cd /opt/marketplace-shop && docker compose pull
  - cd /opt/marketplace-shop && docker compose up -d
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
`;
}
