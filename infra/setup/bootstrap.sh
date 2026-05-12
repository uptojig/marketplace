#!/usr/bin/env bash
# bootstrap.sh — runs ON the target droplet (uploaded by install.sh).
# Installs Docker + Caddy + clones the repo. Idempotent.
#
# Env passed in:
#   REPO_URL, REPO_BRANCH, DOMAIN

set -euo pipefail

: "${REPO_URL:?REPO_URL required}"
: "${REPO_BRANCH:=main}"
: "${DOMAIN:?DOMAIN required}"

echo "▸ apt update"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq

echo "▸ installing prerequisites"
apt-get install -y -qq ca-certificates curl gnupg jq git ufw \
  debian-keyring debian-archive-keyring apt-transport-https

# ── Docker ─────────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null; then
  echo "▸ installing Docker"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi
echo "✓ docker $(docker --version)"

# ── Caddy ──────────────────────────────────────────────────────────────────
if ! command -v caddy >/dev/null; then
  echo "▸ installing Caddy"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy
fi
echo "✓ caddy $(caddy version | head -n1)"

# ── Firewall — open 80/443/22 only ────────────────────────────────────────
echo "▸ configuring ufw firewall"
ufw --force default deny incoming  >/dev/null
ufw --force default allow outgoing >/dev/null
ufw allow 22/tcp   >/dev/null
ufw allow 80/tcp   >/dev/null
ufw allow 443/tcp  >/dev/null
yes | ufw enable   >/dev/null 2>&1 || true

# ── Clone or update repo ──────────────────────────────────────────────────
mkdir -p /opt
if [ ! -d /opt/marketplace/.git ]; then
  echo "▸ cloning $REPO_URL ($REPO_BRANCH)"
  git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" /opt/marketplace
else
  echo "▸ fetching latest of $REPO_BRANCH"
  cd /opt/marketplace
  git fetch origin "$REPO_BRANCH"
  git checkout "$REPO_BRANCH"
  git reset --hard "origin/$REPO_BRANCH"
fi
chmod +x /opt/marketplace/infra/shop-droplet/build-snapshot.sh 2>/dev/null || true
chmod +x /opt/marketplace/infra/setup/*.sh 2>/dev/null || true

# ── doctl (used by build-snapshot.sh) ──────────────────────────────────────
if ! command -v doctl >/dev/null; then
  echo "▸ installing doctl"
  DOCTL_VERSION=1.110.0
  curl -sLO "https://github.com/digitalocean/doctl/releases/download/v${DOCTL_VERSION}/doctl-${DOCTL_VERSION}-linux-amd64.tar.gz"
  tar -xzf "doctl-${DOCTL_VERSION}-linux-amd64.tar.gz"
  mv doctl /usr/local/bin/
  rm "doctl-${DOCTL_VERSION}-linux-amd64.tar.gz"
fi
echo "✓ doctl $(doctl version | head -n1)"

mkdir -p /etc/marketplace
echo "✓ bootstrap complete"
