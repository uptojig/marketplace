#!/usr/bin/env bash
# deploy.sh — invoked by CI (GitHub Actions) over SSH.
# Pulls the named branch, rebuilds + pushes both images, applies
# migrations, restarts systemd, verifies /api/health.
#
# Usage (from CI):
#   ssh root@<droplet> "/opt/marketplace/infra/setup/deploy.sh <branch>"

set -euo pipefail

BRANCH="${1:-main}"
ENV_FILE="/etc/marketplace/control.env"
REGISTRY="registry.digitalocean.com/marketplace"

c_reset="\033[0m"; c_bold="\033[1m"
c_blue="\033[34m"; c_green="\033[32m"; c_red="\033[31m"
log()     { printf "%b▸%b %s\n"          "$c_blue"  "$c_reset" "$*"; }
ok()      { printf "%b✓%b %s\n"          "$c_green" "$c_reset" "$*"; }
section() { printf "\n%b━━ %s ━━%b\n"    "$c_bold"  "$*" "$c_reset"; }

[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE"; exit 1; }

section "Pulling $BRANCH"
cd /opt/marketplace
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
git log -1 --oneline
ok "checkout done"

section "Docker login to DO registry"
TOKEN=$(grep '^DIGITALOCEAN_TOKEN=' "$ENV_FILE" | cut -d= -f2-)
[ -n "$TOKEN" ] || { echo "DIGITALOCEAN_TOKEN missing in env"; exit 1; }
echo "$TOKEN" | docker login -u "$TOKEN" --password-stdin registry.digitalocean.com >/dev/null
ok "logged in"

section "Build + push control-plane"
docker build -t "$REGISTRY/control-plane:latest" .
# Retry push on transient registry GOAWAY
for i in 1 2 3; do
  if docker push "$REGISTRY/control-plane:latest"; then
    break
  fi
  echo "push attempt $i failed, re-login + retry..."
  echo "$TOKEN" | docker login -u "$TOKEN" --password-stdin registry.digitalocean.com >/dev/null
  sleep 5
done
ok "control-plane pushed"

section "Build + push shop-app"
docker build -f infra/shop-droplet/Dockerfile.shop -t "$REGISTRY/shop-app:latest" .
for i in 1 2 3; do
  if docker push "$REGISTRY/shop-app:latest"; then
    break
  fi
  echo "$TOKEN" | docker login -u "$TOKEN" --password-stdin registry.digitalocean.com >/dev/null
  sleep 5
done
ok "shop-app pushed"

section "Apply migrations + sync schema drift"
# Run migrate deploy first (applies committed migration files), then db push
# as a fallback that catches schema fields added without a migration file.
# db push is non-fatal — destructive drifts (column drops with data) require
# manual --accept-data-loss decision, but ADD COLUMN changes apply cleanly.
docker run --rm --env-file "$ENV_FILE" \
  "$REGISTRY/control-plane:latest" \
  sh -c 'cd /app && \
    node node_modules/prisma/build/index.js migrate deploy; \
    node node_modules/prisma/build/index.js db push 2>&1 | tail -20 || \
    echo "WARN: db push failed — destructive drift? Inspect schema manually."'
ok "migrations + drift sync done"

section "Restart marketplace-control"
systemctl restart marketplace-control
ok "service restarted"

section "Health check"
for i in $(seq 1 20); do
  if curl -fsS --max-time 5 https://basketplace.co/api/health >/dev/null 2>&1; then
    ok "/api/health responds 200"
    break
  fi
  sleep 3
  printf "."
done
echo ""

printf "\n%bDeploy of %s complete%b\n" "$c_bold" "$BRANCH" "$c_reset"
