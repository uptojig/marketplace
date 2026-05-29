#!/usr/bin/env bash
# rollout-shop-prune-fix.sh — push disk-eviction fix to all existing shop
# droplets without re-imaging them.
#
# What it deploys, per droplet:
#   1. /etc/docker/daemon.json with log-rotation caps (10MB × 3 files).
#   2. /opt/marketplace-shop/update-agent.sh patched to `docker image
#      prune -f` + `docker container prune -f` AFTER a successful image
#      recreate (keeps the previous image around as a rollback target
#      until the new one is healthy).
#   3. Restart docker (to apply daemon.json) + the update-agent unit.
#   4. One-shot `docker system prune -af --volumes` to reclaim current
#      dangling layers immediately.
#
# Why a one-shot script and not just `git push` + redeploy: existing
# shops are booted from old snapshots and don't get cloud-init re-run.
# This script is the manual rollout path; new shops created after
# build-snapshot.sh has been re-run pick up the fix natively.
#
# Required env:
#   DIGITALOCEAN_TOKEN  — DO API token (lists shop droplets by tag)
#   SHOP_SSH_KEY        — path to private key with root@shop access
#                         (default ~/.ssh/marketplace_ed25519)
# Optional:
#   DRY_RUN=1           — list targets, don't push
#   ONLY_SHOPS=a,b,c    — restrict to specific shop slugs
#
# Safe to re-run: each step is idempotent.

set -euo pipefail

: "${DIGITALOCEAN_TOKEN:?DIGITALOCEAN_TOKEN required}"
SHOP_SSH_KEY="${SHOP_SSH_KEY:-$HOME/.ssh/marketplace_ed25519}"
[ -f "$SHOP_SSH_KEY" ] || { echo "❌ SSH key not found: $SHOP_SSH_KEY"; exit 1; }

# ---------- payloads to push ----------

DAEMON_JSON='{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}'

# The patched update-agent.sh. Keep this in sync with
# lib/provisioner/cloud-init.ts -- the source of truth for new shops.
# Differences from the old script: prune image + container after a
# SUCCESSFUL recreate; otherwise unchanged.
read -r -d '' UPDATE_AGENT <<'AGENT' || true
#!/bin/sh
# Pull-based update agent. Polls every $INTERVAL seconds; if the registry
# digest behind ${IMAGE} differs from the running container's image ID,
# recreate the shop container via compose, then drop dangling layers.
set -u
INTERVAL=300
DEFAULT_IMAGE="registry.digitalocean.com/marketplace/shop-app:latest"
CONTAINER="marketplace-shop-shop-1"

. /opt/marketplace-shop/.env

while true; do
  RESP=$(wget -qO- --timeout=15 \
    --header="Authorization: Bearer $INTERNAL_API_SECRET" \
    "$CONTROL_PLANE_BASE_URL/api/provisioner/agent/desired?shopId=$SHOP_ID" 2>/dev/null || echo '{}')
  IMAGE=$(echo "$RESP" | grep -o '"image":"[^"]*"' | cut -d'"' -f4)
  IMAGE="${IMAGE:-$DEFAULT_IMAGE}"

  if docker pull "$IMAGE" >/dev/null 2>&1; then
    PULLED_ID=$(docker image inspect "$IMAGE" --format '{{.Id}}' 2>/dev/null || echo "")
    RUNNING_ID=$(docker inspect "$CONTAINER" --format '{{.Image}}' 2>/dev/null || echo "")
    if [ -n "$PULLED_ID" ] && [ "$PULLED_ID" != "$RUNNING_ID" ]; then
      echo "[update-agent] $(date -Iseconds) recreate: $RUNNING_ID -> $PULLED_ID"
      cd /opt/marketplace-shop
      if docker compose up -d --no-deps shop; then
        docker image prune -f >/dev/null 2>&1 || true
        docker container prune -f >/dev/null 2>&1 || true
      else
        echo "[update-agent] recreate failed"
      fi
    fi
  fi

  CURRENT_ID=$(docker inspect "$CONTAINER" --format '{{.Image}}' 2>/dev/null || echo "")
  wget -q --timeout=10 \
    --post-data="shopId=$SHOP_ID&running=$CURRENT_ID" \
    --header="Authorization: Bearer $INTERNAL_API_SECRET" \
    "$CONTROL_PLANE_BASE_URL/api/provisioner/agent/heartbeat" -O /dev/null 2>/dev/null || true

  sleep $INTERVAL
done
AGENT

# ---------- discover shop droplets ----------

echo "🔎 Discovering shop droplets via DO API..."
DROPLETS=$(curl -fsSL "https://api.digitalocean.com/v2/droplets?per_page=200" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  | python3 -c '
import json, sys
d = json.load(sys.stdin)
for dr in d.get("droplets", []):
    name = dr["name"]
    if not name.startswith("shop-"):
        continue
    ip = next((n["ip_address"] for n in dr.get("networks",{}).get("v4",[]) if n.get("type")=="public"), "")
    if ip:
        print("\t".join([name, ip, dr["status"]]))
')

if [ -n "${ONLY_SHOPS:-}" ]; then
  FILTER=$(echo "$ONLY_SHOPS" | tr ',' '|')
  DROPLETS=$(echo "$DROPLETS" | grep -E "shop-($FILTER)-" || true)
fi

COUNT=$(echo "$DROPLETS" | grep -c '^shop-' || true)
echo "  → $COUNT shop droplets matched"
[ "$COUNT" -gt 0 ] || { echo "nothing to do"; exit 0; }

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "$DROPLETS"
  echo "(dry run — exit)"
  exit 0
fi

# ---------- per-shop rollout ----------

SSH_OPTS="-i $SHOP_SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=15 -o ServerAliveInterval=20 -o BatchMode=yes"

SUCCESS=0
FAILED=()
SKIPPED=()

while IFS=$'\t' read -r NAME IP STATUS; do
  [ -z "$NAME" ] && continue
  if [ "$STATUS" != "active" ]; then
    echo "⏭  $NAME ($IP) — status=$STATUS — skip"
    SKIPPED+=("$NAME")
    continue
  fi

  echo ""
  echo "━━━ $NAME ($IP) ━━━"

  # Quick reachability check (skip when sshd is wedged so we don't hang).
  # `-n` is critical: without it, ssh reads stdin from the outer while-loop
  # (which is bound to `$DROPLETS` via the `<<<` here-string) and gobbles
  # the rest of the shop list -- causing the loop to exit after one shop.
  if ! ssh -n $SSH_OPTS "root@$IP" 'echo ok' >/dev/null 2>&1; then
    echo "❌ ssh unreachable — skip"
    FAILED+=("$NAME (ssh)")
    continue
  fi

  # Push payloads via stdin so secrets don't land in argv / shell history.
  # The heredoc supplies ssh's stdin, so no `-n` needed here.
  if ! ssh $SSH_OPTS "root@$IP" bash <<REMOTE
set -e

# 1. daemon.json — only write + restart if it differs from current.
NEW_DAEMON='$DAEMON_JSON'
if ! diff -q <(printf '%s' "\$NEW_DAEMON") /etc/docker/daemon.json >/dev/null 2>&1; then
  mkdir -p /etc/docker
  printf '%s\n' "\$NEW_DAEMON" > /etc/docker/daemon.json
  echo "  ✓ daemon.json updated — restarting docker"
  systemctl restart docker
  # Compose containers are restart: unless-stopped, but the recreate after
  # daemon restart can race the network — give them a couple of seconds.
  sleep 3
else
  echo "  ✓ daemon.json already current"
fi

# 2. update-agent.sh — replace only if checksum differs.
NEW_AGENT=\$(cat <<'AGENT_EOF'
$UPDATE_AGENT
AGENT_EOF
)
if ! diff -q <(printf '%s' "\$NEW_AGENT") /opt/marketplace-shop/update-agent.sh >/dev/null 2>&1; then
  printf '%s\n' "\$NEW_AGENT" > /opt/marketplace-shop/update-agent.sh
  chmod 755 /opt/marketplace-shop/update-agent.sh
  echo "  ✓ update-agent.sh updated — restarting service"
  systemctl restart marketplace-shop-update-agent
else
  echo "  ✓ update-agent.sh already current"
fi

# 3. Reclaim current dangling layers immediately. Safe: only removes
# images NOT referenced by any container (running or stopped). The image
# that the running shop container points at is preserved.
echo "  ⤿ pruning dangling resources..."
docker image prune -f >/dev/null 2>&1 || true
docker container prune -f >/dev/null 2>&1 || true

# 4. Brief health snapshot.
DISK_USAGE=\$(df -h / | tail -n1 | awk '{print \$3 "/" \$2 " (" \$5 " used)"}')
SHOP_STATUS=\$(docker inspect marketplace-shop-shop-1 --format '{{.State.Status}}' 2>/dev/null || echo 'missing')
echo "  ↳ disk: \$DISK_USAGE"
echo "  ↳ shop: \$SHOP_STATUS"
REMOTE
  then
    echo "❌ rollout failed"
    FAILED+=("$NAME (push)")
    continue
  fi

  SUCCESS=$((SUCCESS+1))
done <<< "$DROPLETS"

echo ""
echo "━━━ rollout summary ━━━"
echo "  ✓ success: $SUCCESS"
echo "  ⏭  skipped: ${#SKIPPED[@]} ${SKIPPED[*]:-}"
echo "  ✗ failed:  ${#FAILED[@]} ${FAILED[*]:-}"

[ "${#FAILED[@]}" -eq 0 ]
