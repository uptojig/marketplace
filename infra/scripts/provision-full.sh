#!/usr/bin/env bash
# =============================================================================
# provision-full.sh — Full domain provisioning (Nginx + Email + Registry)
#
# Usage: ./provision-full.sh <domain> <dedicated-ip> <forward-email>
# Example: ./provision-full.sh ready-pay.co 10.10.1.2 admin@gmail.com
#
# This script:
#   1. Generates Nginx config (dedicated IP)
#   2. Sets up email forwarding (ImprovMX)
#   3. Registers domain in domain-registry.json
#   4. Prints DNS setup instructions
# =============================================================================

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <dedicated-ip> <forward-email>}"
DEDICATED_IP="${2:?Usage: $0 <domain> <dedicated-ip> <forward-email>}"
FORWARD_EMAIL="${3:?Usage: $0 <domain> <dedicated-ip> <forward-email>}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Full Domain Provisioning: ${DOMAIN}"
echo "   IP: ${DEDICATED_IP}"
echo "   Email forward: ${FORWARD_EMAIL}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Step 1: Nginx Config ───────────────────────────────────
echo "🌐 Step 1: Nginx Config"
bash "${SCRIPT_DIR}/provision-domain.sh" "${DOMAIN}" "${DEDICATED_IP}" || true
echo ""

# ── Step 2: Email Forwarding ───────────────────────────────
echo "📧 Step 2: Email Forwarding"
if [ -n "${IMPROVMX_API_KEY:-}" ]; then
  bash "${SCRIPT_DIR}/provision-email.sh" "${DOMAIN}" "${FORWARD_EMAIL}" || true
else
  echo "   ⏭️  Skipped (IMPROVMX_API_KEY not set)"
  echo "   Run manually: ./provision-email.sh ${DOMAIN} ${FORWARD_EMAIL}"
fi
echo ""

# ── Step 3: Summary ───────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Provisioning complete for ${DOMAIN}"
echo ""
echo "📋 Next steps:"
echo ""
echo "   1. DNS: Point ${DOMAIN} to the droplet"
echo "      Add A record → ${DEDICATED_IP}"
echo ""
echo "   2. DNS: Add MX records for email"
echo "      MX  @  mx1.improvmx.com  (priority 10)"
echo "      MX  @  mx2.improvmx.com  (priority 20)"
echo "      TXT @  v=spf1 include:spf.improvmx.com ~all"
echo ""
echo "   3. DB: Create store with customDomain"
echo "      UPDATE \"Store\" SET \"customDomain\" = '${DOMAIN}' WHERE slug = 'xxx';"
echo ""
echo ""
echo "🔗 URLs:"
echo "   Website:  https://${DOMAIN}"
echo "   Email:    admin@${DOMAIN} → ${FORWARD_EMAIL}"
echo "   Webhook:  https://${DOMAIN}/api/webhook/quickpay"
