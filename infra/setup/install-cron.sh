#!/usr/bin/env bash
# install-cron.sh — runs ON the droplet. Installs the two cron jobs that
# drain the provisioning queue and run periodic health checks.
#
# Env passed in:
#   CRON_SECRET — bearer token shared with the control plane
#   DOMAIN      — apex used to call /api/cron/*

set -euo pipefail
: "${CRON_SECRET:?CRON_SECRET required}"
: "${DOMAIN:?DOMAIN required}"

# Wrapper scripts so the secret lives in one place (env file) and crontab
# stays clean. Re-creating these on every install keeps the secret in sync
# when it's rotated.

cat > /usr/local/bin/cron-provisioner-tick.sh <<EOF
#!/bin/sh
curl -fsS --max-time 55 \\
  -H "Authorization: Bearer $CRON_SECRET" \\
  "https://$DOMAIN/api/cron/provisioner-tick" > /dev/null 2>&1
EOF

cat > /usr/local/bin/cron-provisioner-health.sh <<EOF
#!/bin/sh
curl -fsS --max-time 55 \\
  -H "Authorization: Bearer $CRON_SECRET" \\
  "https://$DOMAIN/api/cron/provisioner-health" > /dev/null 2>&1
EOF

chmod +x /usr/local/bin/cron-provisioner-tick.sh
chmod +x /usr/local/bin/cron-provisioner-health.sh

# Install crontab — replace any prior entries with the same markers so this
# is idempotent.
CRON_FILE=$(mktemp)
crontab -l 2>/dev/null | grep -v "cron-provisioner-" > "$CRON_FILE" || true

cat >> "$CRON_FILE" <<'EOF'
# marketplace provisioner — installed by infra/setup/install-cron.sh
*  *   * * *  /usr/local/bin/cron-provisioner-tick.sh
*/5 *   * * *  /usr/local/bin/cron-provisioner-health.sh
EOF

crontab "$CRON_FILE"
rm "$CRON_FILE"

echo "✓ cron jobs installed"
crontab -l | grep cron-provisioner
