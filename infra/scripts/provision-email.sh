#!/usr/bin/env bash
# =============================================================================
# provision-email.sh — Auto-setup email forwarding for a new domain
# Uses ImprovMX API (free tier: 25 aliases per domain)
#
# Usage: ./provision-email.sh <domain> <forward-to-email>
# Example: ./provision-email.sh ready-pay.co admin@gmail.com
#
# Prerequisites:
#   - ImprovMX account: https://improvmx.com
#   - API key: https://improvmx.com/api
#   - Set IMPROVMX_API_KEY in env
# =============================================================================

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <forward-to-email>}"
FORWARD_TO="${2:?Usage: $0 <domain> <forward-to-email>}"
API_KEY="${IMPROVMX_API_KEY:?Set IMPROVMX_API_KEY env variable}"

API_BASE="https://api.improvmx.com/v3"
AUTH="api:${API_KEY}"

echo "📧 Setting up email forwarding for ${DOMAIN}..."
echo "   Forward to: ${FORWARD_TO}"
echo ""

# ── Step 1: Add domain to ImprovMX ─────────────────────────
echo "1️⃣  Adding domain to ImprovMX..."
ADD_RESULT=$(curl -s -u "${AUTH}" \
  -X POST "${API_BASE}/domains" \
  -H "Content-Type: application/json" \
  -d "{\"domain\": \"${DOMAIN}\"}")

if echo "$ADD_RESULT" | grep -q '"success":true'; then
  echo "   ✅ Domain added"
elif echo "$ADD_RESULT" | grep -q 'already exists'; then
  echo "   ⚠️  Domain already exists, continuing..."
else
  echo "   ❌ Failed: $ADD_RESULT"
  exit 1
fi

# ── Step 2: Create admin@ alias ────────────────────────────
echo "2️⃣  Creating admin@${DOMAIN} → ${FORWARD_TO}..."
ALIAS_RESULT=$(curl -s -u "${AUTH}" \
  -X POST "${API_BASE}/domains/${DOMAIN}/aliases" \
  -H "Content-Type: application/json" \
  -d "{\"alias\": \"admin\", \"forward\": \"${FORWARD_TO}\"}")

if echo "$ALIAS_RESULT" | grep -q '"success":true'; then
  echo "   ✅ Alias created"
elif echo "$ALIAS_RESULT" | grep -q 'already exists'; then
  echo "   ⚠️  Alias already exists"
else
  echo "   ❌ Failed: $ALIAS_RESULT"
fi

# ── Step 3: Create catch-all (*@domain) ────────────────────
echo "3️⃣  Creating catch-all *@${DOMAIN} → ${FORWARD_TO}..."
CATCHALL_RESULT=$(curl -s -u "${AUTH}" \
  -X POST "${API_BASE}/domains/${DOMAIN}/aliases" \
  -H "Content-Type: application/json" \
  -d "{\"alias\": \"*\", \"forward\": \"${FORWARD_TO}\"}")

if echo "$CATCHALL_RESULT" | grep -q '"success":true'; then
  echo "   ✅ Catch-all created"
elif echo "$CATCHALL_RESULT" | grep -q 'already exists'; then
  echo "   ⚠️  Catch-all already exists"
else
  echo "   ⚠️  Catch-all: $CATCHALL_RESULT"
fi

# ── Step 4: Show DNS records to add ────────────────────────
echo ""
echo "4️⃣  Add these DNS records for ${DOMAIN}:"
echo ""
echo "   ┌─────────┬──────┬───────────────────────────────┬──────────┐"
echo "   │ Type    │ Name │ Value                         │ Priority │"
echo "   ├─────────┼──────┼───────────────────────────────┼──────────┤"
echo "   │ MX      │ @    │ mx1.improvmx.com              │ 10       │"
echo "   │ MX      │ @    │ mx2.improvmx.com              │ 20       │"
echo "   │ TXT     │ @    │ v=spf1 include:spf.improvmx.com ~all │  │"
echo "   └─────────┴──────┴───────────────────────────────┴──────────┘"
echo ""
echo "✅ Done! admin@${DOMAIN} → ${FORWARD_TO}"
echo "   All emails to *@${DOMAIN} will also forward to ${FORWARD_TO}"
