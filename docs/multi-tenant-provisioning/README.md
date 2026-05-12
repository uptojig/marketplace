# Multi-tenant provisioning

> One DigitalOcean droplet per approved shop, so the payment provider's
> IP-whitelist requirement is satisfied (one IP for inbound + outbound API).

## Why this exists

The payment provider (PG) requires every merchant to:

1. Register a public IP that hosts the merchant's storefront.
2. Use *that same IP* when calling the PG's API (server-side checkout, refund,
   reconcile). The PG matches inbound API calls against the whitelist.

A single shared host can satisfy 1 (front it with multiple IPs and reverse-proxy
by Host header) but cannot easily satisfy 2 — without per-container SNAT or
macvlan plumbing that DigitalOcean droplets do **not** support reliably.

The simplest model that satisfies both is **one droplet per shop**. Each
droplet has exactly one public IPv4 used for everything in/out, which makes
the whitelist a 1:1 mapping with the shop.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Control plane (1 droplet)                      │
│                                                                      │
│  ┌────────────────┐  ┌─────────────────────┐  ┌──────────────────┐ │
│  │ Marketplace    │  │ Provisioner         │  │  Managed         │ │
│  │ admin + API    │──│ orchestrator +      │──│  Postgres        │ │
│  │ (this repo)    │  │ queue worker        │  │  (shared)        │ │
│  └────────────────┘  └─────────────────────┘  └──────────────────┘ │
│                                  │  ▲                                │
│                                  │  │  HTTPS, internal-bearer        │
└──────────────────────────────────│──│────────────────────────────────┘
                                   │  │
                  DO + CF APIs ──┐ │  │
                                 ▼ ▼  │ caddy-ask, agent heartbeat
              ┌──────────────────────┴───────────────────────┐
              │                Shop droplets                  │
              │  ┌──────────────┐ ┌──────────────┐            │
              │  │ shop A       │ │ shop B       │   ...      │
              │  │ IP 159.x.1   │ │ IP 159.x.2   │            │
              │  │ Caddy + app  │ │ Caddy + app  │            │
              │  └──────────────┘ └──────────────┘            │
              └────────────────────────────────────────────────┘
                                  ▲
                                  │
                 customers ───────┘ via Cloudflare DNS (grey cloud)
```

Key principles:

- **Control plane stays small**: one droplet runs the admin UI, the
  provisioner orchestrator, and the cron-driven queue worker. It doesn't
  serve any storefront traffic.
- **Shop droplets are stateless** except for their Caddy cert cache. All
  data lives in the shared managed Postgres, accessed over VPC.
- **Cloudflare grey-cloud (DNS-only)**: we explicitly do NOT proxy the
  storefront through CF, because CF would change the visible source IP
  for outbound calls. The full request path is `customer → CF DNS →
  droplet:443 → Caddy → app:3000`.
- **Caddy on-demand TLS** handles custom-domain certs without pre-config.

## Lifecycle

```
   admin approves store
            │
            ▼
       PENDING ──► CREATING_DROPLET ──► CONFIGURING_DNS ──► DEPLOYING_APP
                                                                  │
                                                                  ▼
                                                       READY_FOR_WHITELIST
                                                                  │
                                            admin emails PG, PG confirms
                                                                  │
                                                                  ▼
                                                       WHITELIST_REQUESTED
                                                                  │
                                              admin clicks "Confirm" button
                                                                  │
                                                                  ▼
                                                              ACTIVE
```

Every transition is driven by a `ProvisioningJob` row. Each job is
idempotent, so re-running any stage is safe. Failed jobs retry with
exponential backoff up to 5 attempts before marking the deployment FAILED.

See `lib/provisioner/jobs/index.ts` for the per-stage logic.

## Database schema

Two tables added:

- `ShopDeployment` — 1:1 with `Store`. Tracks the droplet, its IPs, DNS
  records, custom-domain verification, and payment-whitelist status.
- `ProvisioningJob` — append-only queue/audit log. Worker drains these.

See `prisma/schema.prisma` for the full definitions.

## Operational surface

| Path                                              | Who calls it      | Purpose                                  |
|---------------------------------------------------|-------------------|------------------------------------------|
| `POST /api/provisioner/provision`                 | Admin UI          | Start or resume provisioning             |
| `GET  /api/provisioner/status`                    | Admin UI          | Read deployment + recent jobs            |
| `POST /api/provisioner/whitelist`                 | Admin UI          | Confirm/reject PG whitelist (manual)     |
| `POST /api/provisioner/deprovision`               | Admin UI          | Destroy droplet + DNS records            |
| `GET  /api/provisioner/caddy-ask?domain=x`        | Caddy on droplet  | Gate Let's Encrypt cert issuance         |
| `GET  /api/provisioner/agent/desired`             | update-agent      | "What image should I be running?"        |
| `POST /api/provisioner/agent/heartbeat`           | update-agent      | Periodic check-in + reported version     |
| `GET  /api/cron/provisioner-tick`                 | scheduler         | Drain the job queue (run every minute)   |
| `GET  /api/cron/provisioner-health`               | scheduler         | Enqueue health checks (run every 5 min)  |

## Files

- `lib/provisioner/config.ts`         — env wrapper
- `lib/provisioner/digitalocean.ts`   — DO REST client (5 endpoints)
- `lib/provisioner/cloudflare.ts`     — CF DNS client (DoH lookups too)
- `lib/provisioner/cloud-init.ts`     — renders per-droplet user-data
- `lib/provisioner/jobs/index.ts`     — state machine, one fn per job type
- `lib/provisioner/orchestrator.ts`   — public surface + worker loop
- `lib/provisioner/notifier.ts`       — Discord/LINE/console alerts
- `lib/provisioner/auth.ts`           — admin session + bearer helpers
- `app/api/provisioner/*`             — public API routes
- `app/api/cron/provisioner-*`        — scheduler entry points
- `app/admin/provisioning/*`          — admin UI pages
- `infra/shop-droplet/*`              — image + snapshot recipe

## Related docs

- **[setup-do-fresh.md](./setup-do-fresh.md)** — ติดตั้งระบบใหม่ทั้งหมดบน DO
  ตั้งแต่ศูนย์ (recommended starting point — ไทย)
- [first-time-setup.md](./first-time-setup.md) — env + credentials checklist
  (เน้นค่าที่ต้องตั้ง ไม่ลงรายละเอียดการ provision infra)
- [runbook.md](./runbook.md)            — day-to-day ops + troubleshooting
- [payment-whitelist.md](./payment-whitelist.md) — manual PG workflow
- [architecture-decisions.md](./architecture-decisions.md) — why we chose
  this shape (with rejected alternatives)
- [cost.md](./cost.md)                  — capacity planning + cost ceiling
