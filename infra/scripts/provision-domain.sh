#!/usr/bin/env bash
# =============================================================================
# provision-domain.sh — Add a new domain with a dedicated IP
# Usage: ./provision-domain.sh <domain> <dedicated-ip>
# Example: ./provision-domain.sh shop-d.example.com 10.10.1.4
# =============================================================================

set -euo pipefail

DOMAIN_NAME="${1:?Usage: $0 <domain> <dedicated-ip>}"
DEDICATED_IP="${2:?Usage: $0 <domain> <dedicated-ip>}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="${SCRIPT_DIR}/../nginx/conf.d/domain-template.conf.template"
OUTPUT_DIR="${SCRIPT_DIR}/../nginx/conf.d/domains"
OUTPUT_FILE="${OUTPUT_DIR}/${DOMAIN_NAME}.conf"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if config already exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "⚠️  Config already exists: $OUTPUT_FILE"
    echo "    Remove it first if you want to regenerate."
    exit 1
fi

# Generate config from template
echo "📝 Generating Nginx config for ${DOMAIN_NAME} → ${DEDICATED_IP}..."
sed \
    -e "s/\${DOMAIN_NAME}/${DOMAIN_NAME}/g" \
    -e "s/\${DEDICATED_IP}/${DEDICATED_IP}/g" \
    "$TEMPLATE" > "$OUTPUT_FILE"

echo "✅ Config written: $OUTPUT_FILE"

# Create SSL directory
SSL_DIR="${SCRIPT_DIR}/../nginx/ssl/${DOMAIN_NAME}"
mkdir -p "$SSL_DIR"
echo "📁 SSL directory created: $SSL_DIR"
echo "   Place fullchain.pem and privkey.pem here."

# Register domain-IP mapping
REGISTRY="${SCRIPT_DIR}/../domain-registry.json"
if [ ! -f "$REGISTRY" ]; then
    echo "[]" > "$REGISTRY"
fi

# Append to registry using python (available in most systems)
python3 -c "
import json, sys
with open('$REGISTRY', 'r') as f:
    data = json.load(f)
data.append({
    'domain': '$DOMAIN_NAME',
    'dedicatedIp': '$DEDICATED_IP',
    'createdAt': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'sslConfigured': False,
    'active': True
})
with open('$REGISTRY', 'w') as f:
    json.dump(data, f, indent=2)
"
echo "📋 Domain registered in: $REGISTRY"

# Test nginx config
echo ""
echo "🔧 Test nginx config:"
echo "   nginx -t"
echo ""
echo "🔄 Reload nginx:"
echo "   nginx -s reload"
echo ""
echo "🌐 Domain: https://${DOMAIN_NAME}"
echo "🔗 Dedicated IP: ${DEDICATED_IP}"
echo "📡 Webhook URLs:"
echo "   QuickPay: https://${DOMAIN_NAME}/api/webhook/quickpay"
echo "   AnyPay:   https://${DOMAIN_NAME}/api/webhook/anypay"
