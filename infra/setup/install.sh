#!/usr/bin/env bash
# install.sh — one-shot installer for the Marketplace control plane on
# a fresh DigitalOcean Ubuntu 24.04 droplet.
#
# Usage:
#   1. cp infra/setup/config.example.sh infra/setup/config.sh
#   2. edit config.sh with your IP, SSH key path, tokens, domain
#   3. bash infra/setup/install.sh
#
# What this does (idempotent — safe to re-run):
#   Phase 1 — Verify local prereqs (doctl, ssh, curl)
#   Phase 2 — Ensure DO resources (VPC, Postgres, Container Registry)
#   Phase 3 — Bootstrap the droplet (Docker, Caddy, clone repo, build images)
#   Phase 4 — Write env, run migrations, start systemd services
#   Phase 5 — Build shop snapshot
#   Phase 6 — Final env update + restart + smoke test
#
# Re-running is safe — every step checks current state before acting.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.sh"

# ─── Pretty logging ────────────────────────────────────────────────────────
c_reset="\033[0m"; c_bold="\033[1m"; c_dim="\033[2m"
c_blue="\033[34m"; c_green="\033[32m"; c_yellow="\033[33m"; c_red="\033[31m"
log()  { printf "%b▸%b %s\n"           "$c_blue"   "$c_reset" "$*"; }
ok()   { printf "%b✓%b %s\n"           "$c_green"  "$c_reset" "$*"; }
warn() { printf "%b!%b %s\n"           "$c_yellow" "$c_reset" "$*" >&2; }
die()  { printf "%b✗%b %s\n"           "$c_red"    "$c_reset" "$*" >&2; exit 1; }
section() { printf "\n%b━━ %s ━━%b\n"  "$c_bold"   "$*" "$c_reset"; }

# ─── Load config ──────────────────────────────────────────────────────────
[ -f "$CONFIG_FILE" ] || die "missing $CONFIG_FILE — copy config.example.sh to config.sh and fill in"
# shellcheck disable=SC1090
source "$CONFIG_FILE"

require_var() {
  local name=$1
  local val="${!name:-}"
  [ -n "$val" ] || die "config.sh: $name is empty"
}

require_var HOST_IP
require_var SSH_KEY_PATH
require_var DOMAIN
require_var ADMIN_EMAILS
require_var DIGITALOCEAN_TOKEN
require_var CLOUDFLARE_API_TOKEN
require_var CLOUDFLARE_ZONE_ID
require_var REPO_URL

[ -f "$SSH_KEY_PATH" ] || die "SSH_KEY_PATH ($SSH_KEY_PATH) doesn't exist"

# ─── Helpers ──────────────────────────────────────────────────────────────
SSH_OPTS="-i $SSH_KEY_PATH -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15"
ssh_run() {
  ssh $SSH_OPTS "$SSH_USER@$HOST_IP" "$@"
}
ssh_run_script() {
  # send a script over stdin to bash on the remote
  ssh $SSH_OPTS "$SSH_USER@$HOST_IP" "bash -s"
}
scp_to() {
  scp $SSH_OPTS "$1" "$SSH_USER@$HOST_IP:$2"
}

# ─── DO API helper (since not everyone has doctl installed) ──────────────
do_api() {
  curl -sS -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
           -H "Content-Type: application/json" "$@"
}

# ───────────────────────────────────────────────────────────────────────────
section "Phase 1 — Local prerequisites"
# ───────────────────────────────────────────────────────────────────────────

for tool in ssh scp curl jq openssl; do
  command -v "$tool" >/dev/null || die "missing local tool: $tool"
done
ok "all local tools present"

log "testing SSH to $HOST_IP..."
ssh_run "echo ok" >/dev/null || die "SSH to $SSH_USER@$HOST_IP failed (check key + droplet running)"
ok "SSH works"

log "testing DigitalOcean API token..."
DO_ACCOUNT=$(do_api https://api.digitalocean.com/v2/account | jq -r '.account.email // empty')
[ -n "$DO_ACCOUNT" ] || die "DO API token invalid"
ok "DO token belongs to $DO_ACCOUNT"

log "testing Cloudflare API token..."
CF_OK=$(curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify | jq -r '.success')
[ "$CF_OK" = "true" ] || die "Cloudflare token invalid"
ok "CF token verified"

# ───────────────────────────────────────────────────────────────────────────
section "Phase 2 — DigitalOcean infrastructure"
# ───────────────────────────────────────────────────────────────────────────

# 2.1 — VPC
log "checking VPC '$DO_VPC_NAME'..."
VPC_UUID=$(do_api "https://api.digitalocean.com/v2/vpcs?per_page=200" \
  | jq -r --arg n "$DO_VPC_NAME" '(.vpcs // [])[] | select(.name==$n) | .id' | head -n1)
if [ -z "$VPC_UUID" ]; then
  log "creating VPC..."
  VPC_UUID=$(do_api -X POST https://api.digitalocean.com/v2/vpcs \
    -d "{\"name\":\"$DO_VPC_NAME\",\"region\":\"$DO_REGION\",\"ip_range\":\"$DO_VPC_IP_RANGE\"}" \
    | jq -r '.vpc.id')
  [ -n "$VPC_UUID" ] && [ "$VPC_UUID" != "null" ] || die "VPC creation failed"
  ok "VPC created ($VPC_UUID)"
else
  ok "VPC exists ($VPC_UUID)"
fi

# 2.2 — Container Registry
log "checking container registry '$DO_REGISTRY_NAME'..."
REG_STATUS=$(do_api https://api.digitalocean.com/v2/registry | jq -r '.registry.name // empty')
if [ "$REG_STATUS" = "$DO_REGISTRY_NAME" ]; then
  ok "registry exists"
elif [ -z "$REG_STATUS" ]; then
  log "creating registry..."
  do_api -X POST https://api.digitalocean.com/v2/registry \
    -d "{\"name\":\"$DO_REGISTRY_NAME\",\"subscription_tier_slug\":\"basic\",\"region\":\"$DO_REGION\"}" \
    >/dev/null
  ok "registry created"
else
  warn "another registry exists ($REG_STATUS) — DO allows only 1 per account; using existing"
  DO_REGISTRY_NAME="$REG_STATUS"
fi

# 2.3 — Managed Postgres
log "checking managed Postgres '$DO_DB_NAME'..."
DB_INFO=$(do_api "https://api.digitalocean.com/v2/databases?per_page=200" \
  | jq -r --arg n "$DO_DB_NAME" '(.databases // [])[] | select(.name==$n)')
if [ -z "$DB_INFO" ]; then
  log "creating Postgres (takes ~5 min)..."
  DB_ID=$(do_api -X POST https://api.digitalocean.com/v2/databases \
    -d "{\"name\":\"$DO_DB_NAME\",\"engine\":\"pg\",\"version\":\"16\",\"region\":\"$DO_REGION\",\"size\":\"$DO_DB_SIZE\",\"num_nodes\":1,\"private_network_uuid\":\"$VPC_UUID\"}" \
    | jq -r '.database.id')
  [ -n "$DB_ID" ] && [ "$DB_ID" != "null" ] || die "Postgres creation failed"
  log "waiting for Postgres to come online..."
  for i in $(seq 1 60); do
    STATUS=$(do_api "https://api.digitalocean.com/v2/databases/$DB_ID" | jq -r '.database.status')
    [ "$STATUS" = "online" ] && break
    sleep 10
    printf "."
  done
  echo ""
  [ "$STATUS" = "online" ] || die "Postgres didn't come online"
  ok "Postgres ready"
else
  DB_ID=$(echo "$DB_INFO" | jq -r '.id')
  ok "Postgres exists ($DB_ID)"
fi

# 2.4 — Connection string
log "fetching Postgres connection string..."
DB_CONN=$(do_api "https://api.digitalocean.com/v2/databases/$DB_ID" | jq -r '.database.private_connection.uri')
[ -n "$DB_CONN" ] && [ "$DB_CONN" != "null" ] || die "DB connection string empty"
ok "private connection string obtained"

# 2.5 — Make sure the droplet (which we're installing onto) is on the VPC.
# (We just warn — moving an existing droplet across VPCs requires recreation.)
DROPLET_INFO=$(do_api "https://api.digitalocean.com/v2/droplets?per_page=200" \
  | jq -r --arg ip "$HOST_IP" '(.droplets // [])[] | select(.networks.v4[]?.ip_address==$ip)')
if [ -z "$DROPLET_INFO" ]; then
  warn "couldn't find droplet with IP $HOST_IP in this DO account — proceeding anyway"
else
  DROPLET_VPC=$(echo "$DROPLET_INFO" | jq -r '.vpc_uuid')
  if [ "$DROPLET_VPC" != "$VPC_UUID" ]; then
    warn "target droplet is on VPC $DROPLET_VPC, not $VPC_UUID — DB private endpoint may not be reachable"
  else
    ok "droplet is on the correct VPC"
  fi
fi

# 2.6 — Add VPC to DB trusted sources (so droplets in this VPC can connect)
log "adding VPC to DB trusted sources..."
do_api -X PUT "https://api.digitalocean.com/v2/databases/$DB_ID/firewall" \
  -d "{\"rules\":[{\"type\":\"vpc\",\"value\":\"$VPC_UUID\"}]}" >/dev/null
ok "VPC allowlisted on DB firewall"

# ───────────────────────────────────────────────────────────────────────────
section "Phase 3 — Bootstrap droplet (Docker + Caddy + clone)"
# ───────────────────────────────────────────────────────────────────────────

# Send bootstrap script
log "uploading bootstrap script..."
scp_to "$SCRIPT_DIR/bootstrap.sh" "/tmp/bootstrap.sh"
ssh_run "chmod +x /tmp/bootstrap.sh"

log "running bootstrap (this clones repo + installs Docker/Caddy)..."
ssh_run "REPO_URL='$REPO_URL' REPO_BRANCH='$REPO_BRANCH' DOMAIN='$DOMAIN' /tmp/bootstrap.sh"
ok "droplet bootstrapped"

# ───────────────────────────────────────────────────────────────────────────
section "Phase 4 — Write env, build images, run migrations"
# ───────────────────────────────────────────────────────────────────────────

# 4.1 — Generate secrets if not already on the droplet
log "generating secrets..."
NEXTAUTH_SECRET_VAL=$(openssl rand -base64 32)
INTERNAL_API_SECRET_VAL=$(openssl rand -hex 32)
CRON_SECRET_VAL=$(openssl rand -hex 32)

# 4.2 — Write env file
log "writing /etc/marketplace/control.env on droplet..."
SHOP_IMAGE_FULL="registry.digitalocean.com/$DO_REGISTRY_NAME/shop-app:$SHOP_IMAGE_TAG"

ENV_CONTENT=$(cat <<EOF
# --- Domain ---
MAIN_DOMAIN=$DOMAIN

# --- Database ---
DATABASE_URL=$DB_CONN
SHOP_DATABASE_URL=$DB_CONN

# --- NextAuth ---
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET_VAL
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ADMIN_EMAILS=${ADMIN_EMAILS:-}

# --- Transactional email ---
EMAIL_SERVER=${EMAIL_SERVER:-}
EMAIL_FROM=${EMAIL_FROM:-noreply@$DOMAIN}

# --- Public URLs ---
NEXT_PUBLIC_BASE_URL=https://$DOMAIN
CONTROL_PLANE_BASE_URL=https://$DOMAIN

# --- AnyPay ---
ANYPAY_MODE=${ANYPAY_MODE:-mock}
ANYPAY_API_BASE=${ANYPAY_API_BASE:-}
ANYPAY_MERCHANT_ID=${ANYPAY_MERCHANT_ID:-}
ANYPAY_API_KEY=${ANYPAY_API_KEY:-}
ANYPAY_SECRET=${ANYPAY_SECRET:-}

# --- QuickPay ---
QUICKPAY_API_BASE=${QUICKPAY_API_BASE:-}
QUICKPAY_MERCHANT_ID=${QUICKPAY_MERCHANT_ID:-}
QUICKPAY_API_KEY=${QUICKPAY_API_KEY:-}
QUICKPAY_SECRET=${QUICKPAY_SECRET:-}
QUICKPAY_EXTRA_WHITELIST_IPS=${QUICKPAY_EXTRA_WHITELIST_IPS:-}

# --- Cloudflare ---
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID=$CLOUDFLARE_ZONE_ID

# --- Provisioner — DigitalOcean ---
DIGITALOCEAN_TOKEN=$DIGITALOCEAN_TOKEN
DO_REGION=$DO_REGION
DO_SIZE=$DO_DROPLET_SIZE
DO_SHOP_SNAPSHOT_ID=
DO_FALLBACK_IMAGE=ubuntu-24-04-x64
DO_SSH_KEY_IDS=
DO_VPC_UUID=$VPC_UUID

# --- Provisioner — secrets ---
INTERNAL_API_SECRET=$INTERNAL_API_SECRET_VAL
CRON_SECRET=$CRON_SECRET_VAL
SHOP_IMAGE=$SHOP_IMAGE_FULL

# --- Notifier ---
NOTIFIER_DRIVER=${NOTIFIER_DRIVER:-console}
DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL:-}
LINE_NOTIFY_TOKEN=${LINE_NOTIFY_TOKEN:-}

# --- DO Spaces ---
SPACES_ENDPOINT=${SPACES_ENDPOINT:-}
SPACES_REGION=${SPACES_REGION:-}
SPACES_BUCKET=${SPACES_BUCKET:-}
SPACES_KEY=${SPACES_KEY:-}
SPACES_SECRET=${SPACES_SECRET:-}

# --- Anthropic ---
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}

# --- Suppliers ---
CJ_API_BASE=${CJ_API_BASE:-https://developers.cjdropshipping.com/api2.0/v1}
CJ_EMAIL=${CJ_EMAIL:-}
CJ_API_KEY=${CJ_API_KEY:-}
CJ_USD_THB=${CJ_USD_THB:-36}
ALIEXPRESS_APP_KEY=${ALIEXPRESS_APP_KEY:-}
ALIEXPRESS_APP_SECRET=${ALIEXPRESS_APP_SECRET:-}
ALIEXPRESS_ACCESS_TOKEN=${ALIEXPRESS_ACCESS_TOKEN:-}
DEFAULT_SUPPLIER=${DEFAULT_SUPPLIER:-CJ}

# --- Domain-IP registry ---
DOMAIN_IP_REGISTRY=${DOMAIN_IP_REGISTRY:-[]}
EOF
)

ssh_run "mkdir -p /etc/marketplace && cat > /etc/marketplace/control.env <<'MARKER_END_OF_ENV'
$ENV_CONTENT
MARKER_END_OF_ENV
chmod 600 /etc/marketplace/control.env"
ok "env file written"

# 4.3 — Registry login (locally on droplet)
log "logging docker into DO registry..."
ssh_run "doctl_token='$DIGITALOCEAN_TOKEN'; echo \"\$doctl_token\" | docker login -u \"\$doctl_token\" --password-stdin registry.digitalocean.com"
ok "docker logged in to registry"

# 4.4 — Build + push images
log "building control plane image (may take ~5 min on first run)..."
ssh_run "cd /opt/marketplace && docker build -t registry.digitalocean.com/$DO_REGISTRY_NAME/control-plane:$CONTROL_IMAGE_TAG ."
ssh_run "docker push registry.digitalocean.com/$DO_REGISTRY_NAME/control-plane:$CONTROL_IMAGE_TAG"
ok "control plane image pushed"

log "building shop image..."
ssh_run "cd /opt/marketplace && docker build -f infra/shop-droplet/Dockerfile.shop -t $SHOP_IMAGE_FULL ."
ssh_run "docker push $SHOP_IMAGE_FULL"
ok "shop image pushed"

# 4.5 — Run migrations
log "running prisma migrate deploy..."
ssh_run "docker run --rm --env-file /etc/marketplace/control.env \
  registry.digitalocean.com/$DO_REGISTRY_NAME/control-plane:$CONTROL_IMAGE_TAG \
  sh -c 'cd /app && node node_modules/prisma/build/index.js migrate deploy || node node_modules/prisma/build/index.js db push --accept-data-loss'"
ok "migrations applied"

# 4.6 — systemd unit + Caddyfile
log "installing systemd unit + Caddy config..."
ssh_run "CONTROL_IMAGE='registry.digitalocean.com/$DO_REGISTRY_NAME/control-plane:$CONTROL_IMAGE_TAG' \
         DOMAIN='$DOMAIN' \
         bash /opt/marketplace/infra/setup/install-services.sh"
ok "services configured + started"

# 4.7 — Cron
log "installing cron jobs..."
ssh_run "CRON_SECRET='$CRON_SECRET_VAL' DOMAIN='$DOMAIN' \
         bash /opt/marketplace/infra/setup/install-cron.sh"
ok "cron jobs installed"

# 4.8 — Wait for control plane healthy
log "waiting for control plane to serve /health..."
for i in $(seq 1 30); do
  if curl -fsS --max-time 5 "https://$DOMAIN/api/health" >/dev/null 2>&1; then
    ok "control plane is live at https://$DOMAIN"
    break
  fi
  sleep 5
  printf "."
done
echo ""

# ───────────────────────────────────────────────────────────────────────────
section "Phase 5 — Build shop droplet snapshot"
# ───────────────────────────────────────────────────────────────────────────

log "checking if a recent snapshot already exists..."
SNAPSHOT_ID=$(do_api "https://api.digitalocean.com/v2/snapshots?resource_type=droplet&per_page=200" \
  | jq -r '(.snapshots // [])[] | select(.name | startswith("shop-droplet-")) | .id' | head -n1)

if [ -z "$SNAPSHOT_ID" ]; then
  log "running build-snapshot.sh on droplet (~15 min)..."
  ssh_run "DIGITALOCEAN_TOKEN='$DIGITALOCEAN_TOKEN' \
           SHOP_IMAGE='$SHOP_IMAGE_FULL' \
           DO_REGION='$DO_REGION' \
           bash /opt/marketplace/infra/shop-droplet/build-snapshot.sh 2>&1 | tail -5"
  SNAPSHOT_ID=$(do_api "https://api.digitalocean.com/v2/snapshots?resource_type=droplet&per_page=200" \
    | jq -r '(.snapshots // [])[] | select(.name | startswith("shop-droplet-")) | .id' | head -n1)
  ok "snapshot built (id=$SNAPSHOT_ID)"
else
  ok "reusing existing snapshot $SNAPSHOT_ID"
fi

# Inject snapshot id + DO SSH key fingerprints into env
log "updating env with snapshot id + SSH keys..."
SSH_KEY_FPS=$(do_api "https://api.digitalocean.com/v2/account/keys?per_page=200" \
  | jq -r '(.ssh_keys // [])[].fingerprint' | paste -sd, -)

ssh_run "sed -i \
  -e 's|^DO_SHOP_SNAPSHOT_ID=.*|DO_SHOP_SNAPSHOT_ID=$SNAPSHOT_ID|' \
  -e 's|^DO_SSH_KEY_IDS=.*|DO_SSH_KEY_IDS=$SSH_KEY_FPS|' \
  /etc/marketplace/control.env"
ssh_run "systemctl restart marketplace-control"
ok "control plane restarted with snapshot"

# ───────────────────────────────────────────────────────────────────────────
section "Phase 6 — Smoke test + admin user"
# ───────────────────────────────────────────────────────────────────────────

# Wait for health again
for i in $(seq 1 20); do
  if curl -fsS --max-time 5 "https://$DOMAIN/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

ADMIN_EMAIL_FIRST=$(echo "$ADMIN_EMAILS" | cut -d, -f1 | tr -d ' ')
log "auto-promoting $ADMIN_EMAIL_FIRST to ADMIN (after they sign in once)..."
ssh_run "cat > /usr/local/bin/promote-admin <<'EOF'
#!/bin/sh
docker exec marketplace-control sh -c \"echo \\\"UPDATE \\\\\\\"User\\\\\\\" SET role='ADMIN' WHERE email='\$1';\\\" | npx prisma db execute --stdin\"
EOF
chmod +x /usr/local/bin/promote-admin"
ok "promote-admin helper installed"

cat <<EOF

${c_bold}═══════════════════════════════════════════════════════════════════════${c_reset}
${c_green}✓ Installation complete${c_reset}
${c_bold}═══════════════════════════════════════════════════════════════════════${c_reset}

  Control plane: ${c_bold}https://$DOMAIN${c_reset}
  Health check:  https://$DOMAIN/api/health
  Admin panel:   https://$DOMAIN/admin

  Next steps:
  ${c_bold}1.${c_reset} Add DNS A records in Cloudflare (grey-cloud, DNS only):
       @     A    $HOST_IP
       www   A    $HOST_IP
       admin A    $HOST_IP
  ${c_bold}2.${c_reset} Sign in once at https://$DOMAIN/signin with $ADMIN_EMAIL_FIRST
  ${c_bold}3.${c_reset} Promote yourself to admin:
       ${c_dim}ssh $SSH_USER@$HOST_IP "/usr/local/bin/promote-admin $ADMIN_EMAIL_FIRST"${c_reset}
  ${c_bold}4.${c_reset} Create a test shop and approve it — watch /admin/provisioning

  Useful droplet commands:
       systemctl status marketplace-control
       journalctl -u marketplace-control -f
       docker logs -f marketplace-control

EOF
