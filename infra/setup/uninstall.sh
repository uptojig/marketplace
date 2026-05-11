#!/usr/bin/env bash
# uninstall.sh — companion to install.sh. Removes the control plane from
# a droplet (services, container, caddy config, env file, cron) but
# leaves the droplet itself + shared DO resources (DB, VPC, registry,
# snapshot) intact so you can re-install fresh without losing data.
#
# To destroy DO resources too, pass --nuke-do.
# (Destroying shop droplets is handled separately via /admin/provisioning.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.sh"
[ -f "$CONFIG_FILE" ] || { echo "missing $CONFIG_FILE"; exit 1; }
# shellcheck disable=SC1090
source "$CONFIG_FILE"

NUKE_DO=0
for arg in "$@"; do
  [ "$arg" = "--nuke-do" ] && NUKE_DO=1
done

SSH_OPTS="-i $SSH_KEY_PATH -o StrictHostKeyChecking=accept-new"
ssh_run() { ssh $SSH_OPTS "$SSH_USER@$HOST_IP" "$@"; }

echo "▸ stopping control plane on $HOST_IP..."
ssh_run "systemctl disable --now marketplace-control 2>/dev/null || true"
ssh_run "docker rm -f marketplace-control 2>/dev/null || true"

echo "▸ removing systemd unit + caddy config + env"
ssh_run "rm -f /etc/systemd/system/marketplace-control.service && systemctl daemon-reload"
ssh_run "rm -f /etc/caddy/Caddyfile && systemctl reload caddy 2>/dev/null || true"
ssh_run "rm -f /etc/marketplace/control.env"

echo "▸ removing cron jobs"
ssh_run "crontab -l 2>/dev/null | grep -v cron-provisioner- | crontab - || true"
ssh_run "rm -f /usr/local/bin/cron-provisioner-tick.sh /usr/local/bin/cron-provisioner-health.sh"

if [ "$NUKE_DO" = 1 ]; then
  echo "▸ --nuke-do: destroying shared DO resources"
  echo "   THIS DESTROYS THE DATABASE AND ALL SHOP SNAPSHOTS"
  read -p "   Type 'DESTROY' to confirm: " confirm
  [ "$confirm" = "DESTROY" ] || { echo "aborted"; exit 1; }

  do_api() {
    curl -sS -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
             -H "Content-Type: application/json" "$@"
  }

  # Postgres
  DB_ID=$(do_api "https://api.digitalocean.com/v2/databases?per_page=200" \
    | jq -r --arg n "$DO_DB_NAME" '.databases[] | select(.name==$n) | .id' | head -n1)
  [ -n "$DB_ID" ] && {
    do_api -X DELETE "https://api.digitalocean.com/v2/databases/$DB_ID" >/dev/null
    echo "  ✓ database $DB_ID destroyed"
  }

  # Shop snapshots
  for sid in $(do_api "https://api.digitalocean.com/v2/snapshots?resource_type=droplet&per_page=200" \
                 | jq -r '.snapshots[] | select(.name | startswith("shop-droplet-")) | .id'); do
    do_api -X DELETE "https://api.digitalocean.com/v2/snapshots/$sid" >/dev/null
    echo "  ✓ snapshot $sid destroyed"
  done

  # Registry — only if it matches our name
  REG_NAME=$(do_api https://api.digitalocean.com/v2/registry | jq -r '.registry.name // empty')
  [ "$REG_NAME" = "$DO_REGISTRY_NAME" ] && {
    do_api -X DELETE https://api.digitalocean.com/v2/registry >/dev/null
    echo "  ✓ registry $REG_NAME destroyed"
  }

  # VPC — only if no droplets are still attached
  VPC_UUID=$(do_api "https://api.digitalocean.com/v2/vpcs?per_page=200" \
    | jq -r --arg n "$DO_VPC_NAME" '.vpcs[] | select(.name==$n) | .id' | head -n1)
  [ -n "$VPC_UUID" ] && {
    DROPLETS=$(do_api "https://api.digitalocean.com/v2/droplets?per_page=200" \
      | jq --arg v "$VPC_UUID" '[.droplets[] | select(.vpc_uuid==$v)] | length')
    if [ "$DROPLETS" = "0" ]; then
      do_api -X DELETE "https://api.digitalocean.com/v2/vpcs/$VPC_UUID" >/dev/null
      echo "  ✓ VPC $VPC_UUID destroyed"
    else
      echo "  ⚠ VPC $VPC_UUID still has $DROPLETS droplets attached — skipping delete"
    fi
  }
fi

echo "✓ uninstall complete (target droplet itself preserved)"
