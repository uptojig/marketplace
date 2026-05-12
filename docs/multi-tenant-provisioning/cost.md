# Cost model

Rough monthly cost at different shop counts. All prices in USD, sourced
from DigitalOcean pricing page (May 2026 snapshot).

## Per-shop fixed cost

| Item                                      | Unit       | Monthly |
|-------------------------------------------|------------|---------|
| Droplet `s-1vcpu-1gb`                     | 1          | $6.00   |
| Droplet weekly snapshot (backup) — 20%    | 1          | $1.20   |
| Outbound traffic (1 TB included, ~50 GB)  | included   | $0.00   |
| **Total per shop**                        |            | **$7.20** |

If you skip backups (snapshot-based recovery is fine for stateless
droplets), drop to $6.00.

## Shared fixed cost

| Item                                          | Monthly |
|-----------------------------------------------|---------|
| Control-plane droplet `s-2vcpu-4gb`           | $24     |
| Managed Postgres `db-s-1vcpu-2gb` (1-node)    | $30     |
| DO Spaces (object storage for assets)         | $5      |
| Cloudflare (DNS, free plan)                   | $0      |
| **Shared overhead**                           | **$59** |

## Total at N shops

| Shops | Per-shop cost | Shared | **Total** | $ / shop |
|-------|---------------|--------|-----------|----------|
| 20    | $144          | $59    | **$203**  | $10.15   |
| 50    | $360          | $59    | **$419**  | $8.38    |
| 100   | $720          | $59    | **$779**  | $7.79    |
| 200   | $1,440        | $59    | **$1,499**| $7.50    |
| 500   | $3,600        | $89*   | **$3,689**| $7.38    |

*At 500 shops, control plane needs an upgrade to `s-4vcpu-8gb` ($48)
and Postgres to `db-s-2vcpu-4gb` ($60).

## Cost ceiling: $7.50/shop at scale

Anything below that breakeven means switching providers (Hetzner cloud
gives ~50% off but with TH latency penalty) or going hybrid (decision 1
in [architecture-decisions.md](./architecture-decisions.md)).

## What you don't pay for in this model

- Manual whitelist team time (varies; if PG gives API later, drops to 0)
- Initial snapshot build (one-off ~$0.10 worth of compute)
- Engineering time to scale beyond 500 shops (probably one engineer-week
  to harden the queue + add region-routed control plane)

## Visualizing waste

If a shop is provisioned but the merchant churned + never went live,
the droplet quietly burns ~$7/mo. The admin UI surfaces this:

- `/admin/provisioning?status=READY_FOR_WHITELIST` for stuck-pre-PG shops
- Shop "last order" cross-checked with deployment "active since" — any
  ACTIVE deployment with zero orders > 60 days is a destroy candidate.

Add a monthly billing query:

```sql
SELECT s.slug, d."publicIpv4", d."paymentWhitelistStatus",
       AGE(NOW(), d."createdAt") AS uptime,
       (SELECT COUNT(*) FROM "Order" o
          JOIN "OrderItem" oi ON oi."orderId" = o.id
         WHERE oi."storeId" = s.id) AS orders
FROM   "ShopDeployment" d
JOIN   "Store" s ON s.id = d."storeId"
WHERE  d.status = 'ACTIVE'
ORDER  BY orders ASC;
```

Cull the zero-order shops aggressively — the IPs are useful elsewhere.
