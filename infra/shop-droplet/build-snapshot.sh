#!/usr/bin/env bash
# build-snapshot.sh — build a fresh DO snapshot for shop droplets.
#
# Spins up a throwaway droplet, installs Docker + Caddy + pulls the shop
# image, powers off, snapshots, then destroys the source droplet. Prints
# the snapshot id at the end — put it in DO_SHOP_SNAPSHOT_ID in your
# control plane env.
#
# Required env:
#   DIGITALOCEAN_TOKEN   — API token with droplet+snapshot write
#   SHOP_IMAGE           — full registry path of the shop app image
# Optional:
#   DO_REGION            — default sgp1
#   DO_SIZE_FOR_BUILD    — default s-1vcpu-2gb (snapshots use smaller running size)
#   DO_SSH_KEY_ID        — first ssh key fingerprint to inject for debugging

set -euo pipefail

: "${DIGITALOCEAN_TOKEN:?DIGITALOCEAN_TOKEN required}"
: "${SHOP_IMAGE:?SHOP_IMAGE required (registry path of shop-app image)}"

REGION="${DO_REGION:-sgp1}"
SIZE="${DO_SIZE_FOR_BUILD:-s-1vcpu-2gb}"
NAME="shop-snapshot-builder-$(date +%s)"
SSH_KEYS_ARG=""
if [ -n "${DO_SSH_KEY_ID:-}" ]; then
  SSH_KEYS_ARG=",\"ssh_keys\":[\"$DO_SSH_KEY_ID\"]"
fi

USER_DATA=$(cat <<EOF
#cloud-config
package_update: true
packages:
  - ca-certificates
  - curl
  - gnupg
  - jq

write_files:
  - path: /etc/marketplace/snapshot-info
    permissions: '0644'
    content: |
      Snapshot built at $(date -u +%Y-%m-%dT%H:%M:%SZ)
      Shop image: ${SHOP_IMAGE}

runcmd:
  # Docker repo + install
  - install -m 0755 -d /etc/apt/keyrings
  - curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  - chmod a+r /etc/apt/keyrings/docker.gpg
  - echo "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(. /etc/os-release && echo \$VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
  - apt-get update
  - DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  # Caddy image
  - docker pull caddy:2-alpine
  # Shop app image
  - docker pull ${SHOP_IMAGE}
  # Prepare directories cloud-init will populate per-shop later
  - mkdir -p /opt/marketplace-shop /var/lib/caddy /var/log/caddy
  # Mark complete
  - touch /etc/marketplace/snapshot-ready
EOF
)

echo "📦 Creating builder droplet..."
CREATE_RESP=$(curl -sS -X POST "https://api.digitalocean.com/v2/droplets" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"region\":\"$REGION\",\"size\":\"$SIZE\",\"image\":\"ubuntu-24-04-x64\",\"backups\":false,\"ipv6\":true,\"monitoring\":true,\"user_data\":$(jq -Rs . <<<"$USER_DATA"),\"tags\":[\"snapshot-builder\"]$SSH_KEYS_ARG}")

DROPLET_ID=$(echo "$CREATE_RESP" | jq -r '.droplet.id')
[ "$DROPLET_ID" = "null" ] && { echo "❌ Create failed: $CREATE_RESP"; exit 1; }
echo "  → droplet id $DROPLET_ID"

echo "⏳ Waiting for /etc/marketplace/snapshot-ready..."
# Poll active first
for i in $(seq 1 60); do
  STATUS=$(curl -sS "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" \
    -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" | jq -r '.droplet.status')
  [ "$STATUS" = "active" ] && break
  sleep 5
done
[ "$STATUS" = "active" ] || { echo "❌ Droplet didn't become active"; exit 1; }

# Give cloud-init time to complete (Docker install + image pulls)
echo "  → active. Waiting 4 minutes for cloud-init..."
sleep 240

echo "⏻ Powering off..."
curl -sS -X POST "https://api.digitalocean.com/v2/droplets/$DROPLET_ID/actions" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"shutdown"}' >/dev/null

# Wait for off
for i in $(seq 1 30); do
  STATUS=$(curl -sS "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" \
    -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" | jq -r '.droplet.status')
  [ "$STATUS" = "off" ] && break
  sleep 5
done
# Force off if shutdown didn't take
if [ "$STATUS" != "off" ]; then
  curl -sS -X POST "https://api.digitalocean.com/v2/droplets/$DROPLET_ID/actions" \
    -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type":"power_off"}' >/dev/null
  sleep 30
fi

echo "📸 Taking snapshot..."
SNAPSHOT_NAME="shop-droplet-$(date +%Y%m%d-%H%M%S)"
SNAP_RESP=$(curl -sS -X POST "https://api.digitalocean.com/v2/droplets/$DROPLET_ID/actions" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"snapshot\",\"name\":\"$SNAPSHOT_NAME\"}")
ACTION_ID=$(echo "$SNAP_RESP" | jq -r '.action.id')
[ "$ACTION_ID" = "null" ] && { echo "❌ Snapshot start failed: $SNAP_RESP"; exit 1; }

echo "  → action $ACTION_ID running. Polling..."
for i in $(seq 1 60); do
  ACT_STATUS=$(curl -sS "https://api.digitalocean.com/v2/actions/$ACTION_ID" \
    -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" | jq -r '.action.status')
  [ "$ACT_STATUS" = "completed" ] && break
  [ "$ACT_STATUS" = "errored" ] && { echo "❌ Snapshot errored"; exit 1; }
  sleep 10
done

SNAPSHOT_ID=$(curl -sS "https://api.digitalocean.com/v2/snapshots?resource_type=droplet&per_page=50" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  | jq -r --arg n "$SNAPSHOT_NAME" '.snapshots[] | select(.name==$n) | .id')

echo "🗑  Destroying builder droplet $DROPLET_ID..."
curl -sS -X DELETE "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN"

echo ""
echo "✅ Snapshot built: $SNAPSHOT_NAME"
echo "   Snapshot ID:  $SNAPSHOT_ID"
echo ""
echo "Set this in your control-plane env:"
echo "  DO_SHOP_SNAPSHOT_ID=$SNAPSHOT_ID"
