#!/usr/bin/env bash
# install-services.sh — runs ON the droplet. Installs systemd unit for
# the control plane container and configures Caddy as front proxy with
# automatic Let's Encrypt TLS.
#
# Env passed in:
#   CONTROL_IMAGE  — full registry path of control plane image
#   DOMAIN         — apex domain (also handles www + admin subdomains)

set -euo pipefail
: "${CONTROL_IMAGE:?CONTROL_IMAGE required}"
: "${DOMAIN:?DOMAIN required}"

# ── systemd unit ──────────────────────────────────────────────────────────
cat > /etc/systemd/system/marketplace-control.service <<EOF
[Unit]
Description=Marketplace control plane (Next.js)
After=docker.service
Requires=docker.service

[Service]
Restart=always
RestartSec=5
ExecStartPre=-/usr/bin/docker stop marketplace-control
ExecStartPre=-/usr/bin/docker rm marketplace-control
ExecStartPre=/usr/bin/docker pull $CONTROL_IMAGE
ExecStart=/usr/bin/docker run --rm --name marketplace-control \\
  --env-file /etc/marketplace/control.env \\
  -p 127.0.0.1:3000:3000 \\
  $CONTROL_IMAGE
ExecStop=/usr/bin/docker stop marketplace-control

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable marketplace-control
systemctl restart marketplace-control

# Wait briefly so Caddy reload below succeeds against a live upstream
for i in $(seq 1 30); do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then break; fi
  sleep 2
done

# ── Caddyfile ─────────────────────────────────────────────────────────────
cat > /etc/caddy/Caddyfile <<EOF
{
        # email used for Let's Encrypt ACME registration
        email admin@$DOMAIN
}

$DOMAIN, www.$DOMAIN, admin.$DOMAIN {
        encode zstd gzip
        reverse_proxy 127.0.0.1:3000 {
                header_up Host {host}
                header_up X-Real-IP {remote}
                header_up X-Forwarded-For {remote}
                header_up X-Forwarded-Proto {scheme}
        }
        # Larger upload limit for product image uploads
        request_body {
                max_size 50MB
        }
}
EOF

# Validate + reload (use systemctl reload, which does graceful)
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy || systemctl restart caddy

echo "✓ marketplace-control + caddy running"
