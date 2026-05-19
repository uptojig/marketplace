#!/usr/bin/env bash
# Configuration for install.sh — copy to config.sh and fill in.
#
# All variables here are sourced by install.sh. The config.sh file (with real
# values) is in .gitignore and MUST NEVER be committed.

# ─── Target server ──────────────────────────────────────────────────────────
# IP + SSH user of the fresh Ubuntu 24.04 droplet you want to install onto.
# Make sure your SSH key is in ~/.ssh/authorized_keys on the droplet first.
HOST_IP="159.65.0.0"
SSH_USER="root"
SSH_KEY_PATH="$HOME/.ssh/id_ed25519"

# ─── Domain ─────────────────────────────────────────────────────────────────
# Apex domain that customers visit. Must be a Cloudflare-managed zone.
# Shop subdomains end up as <slug>.<DOMAIN>.
DOMAIN="basketplace.co"

# Admin emails — comma-separated. These Google accounts auto-promote to
# ADMIN role on first sign-in. (Mirrors ADMIN_EMAILS in .env.)
ADMIN_EMAILS="you@example.com"

# ─── DigitalOcean ───────────────────────────────────────────────────────────
# Token scope: Droplet/Snapshot/Image/SSH Key/Tag/VPC/Database/Registry
DIGITALOCEAN_TOKEN=""

DO_REGION="sgp1"
DO_DROPLET_SIZE="s-1vcpu-1gb"           # size for shop droplets
DO_CONTROL_DROPLET_NAME="marketplace-control"

# Registry namespace under registry.digitalocean.com
DO_REGISTRY_NAME="marketplace"

# Managed Postgres + VPC names (created if missing — script is idempotent)
DO_VPC_NAME="marketplace-vpc"
DO_VPC_IP_RANGE="10.110.0.0/20"
DO_DB_NAME="marketplace-db"
DO_DB_SIZE="db-s-1vcpu-2gb"

# ─── Cloudflare ─────────────────────────────────────────────────────────────
# Token scope on the platform zone:
#   Zone:DNS:Edit  AND  Zone:Email Routing:Edit
CLOUDFLARE_API_TOKEN=""
CLOUDFLARE_ZONE_ID=""

# ─── NextAuth / Google OAuth ────────────────────────────────────────────────
# Get from https://console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ─── Payment Provider (Optional — leave empty for mock mode) ────────────────
ANYPAY_MODE="mock"
ANYPAY_API_BASE=""
ANYPAY_MERCHANT_ID=""
ANYPAY_API_KEY=""
ANYPAY_SECRET=""

QUICKPAY_API_BASE=""
QUICKPAY_MERCHANT_ID=""
QUICKPAY_API_KEY=""
QUICKPAY_SECRET=""
QUICKPAY_EXTRA_WHITELIST_IPS=""

# ─── DO Spaces (optional — for logo/banner uploads) ─────────────────────────
SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
SPACES_REGION="sgp1"
SPACES_BUCKET=""
SPACES_KEY=""
SPACES_SECRET=""

# ─── Notifier ───────────────────────────────────────────────────────────────
# Where "shop ready for whitelist" alerts go.
NOTIFIER_DRIVER="console"          # console | discord | line
DISCORD_WEBHOOK_URL=""
LINE_NOTIFY_TOKEN=""

# ─── Repository ─────────────────────────────────────────────────────────────
# Branch/tag the droplet will check out + build from.
REPO_URL="https://github.com/uptojig/marketplace.git"
REPO_BRANCH="feat/multi-tenant-provisioning"

# ─── Image tags ─────────────────────────────────────────────────────────────
CONTROL_IMAGE_TAG="latest"
SHOP_IMAGE_TAG="latest"

# ─── Anthropic (for AI store builder feature — optional) ────────────────────
ANTHROPIC_API_KEY=""

# ─── Transactional email (Resend SMTP) ──────────────────────────────────────
# Used by NextAuth magic-link sign-in + order/whitelist notifications.
EMAIL_SERVER=""
EMAIL_FROM="noreply@${DOMAIN}"

# ─── Suppliers ──────────────────────────────────────────────────────────────
# CJ Dropshipping (https://developers.cjdropshipping.com)
CJ_API_BASE="https://developers.cjdropshipping.com/api2.0/v1"
CJ_EMAIL=""
CJ_API_KEY=""
CJ_USD_THB="36"

# AliExpress (optional — leave empty if not using)
ALIEXPRESS_APP_KEY=""
ALIEXPRESS_APP_SECRET=""
ALIEXPRESS_ACCESS_TOKEN=""

# Default supplier when seed/import doesn't specify one
DEFAULT_SUPPLIER="CJ"

# ─── Domain-IP registry ─────────────────────────────────────────────────────
# JSON array — provisioner overwrites this at runtime per shop.
DOMAIN_IP_REGISTRY="[]"

# ─── iApp KYC (Thai ID OCR + Face Verification + Liveness) ──────────────────
# Get from https://iapp.co.th — used by the apply/KYC wizard.
IAPP_API_KEY=""
IAPP_BASE_URL="https://api.iapp.co.th"
IAPP_REQUEST_TIMEOUT_MS="10000"
IAPP_RETRIES="1"
IAPP_IC_COST_THB="1.25"

# ─── shadcn Studio registry (build-time) ────────────────────────────────────
# License key required to pull premium components during `next build`.
SHADCN_STUDIO_LICENSE_KEY=""
