# Architecture decisions

The shape of this system reflects 5 hard choices we made. Each section
explains what we picked, what we rejected, and why.

## 1. One droplet per shop, not macvlan or per-container IPs

**Picked.** Each shop = its own `s-1vcpu-1gb` DigitalOcean droplet.

**Rejected.**

- **Docker macvlan / per-container IPs on one host.** Doesn't work on
  DigitalOcean. DO uses virtio with anti-MAC-spoofing at the hypervisor
  — macvlan containers can send packets but never receive replies on
  their custom MAC. (Works fine on bare-metal or Hetzner/OVH, not DO.)

- **DO Reserved IPs + iptables SNAT per container.** Reserved IPs are
  1:1 NAT for inbound only. To make outbound use a different IP than
  the droplet's anchor IP requires custom routing tables + per-container
  netns work. Brittle, hard to test, breaks when droplet is power-cycled.

- **Move to Hetzner/Vultr for true additional IPs.** Best technical fit,
  but vendor lock-in pain and TH-region latency is worse. Revisit if cost
  becomes a blocker.

**Trade-off.** Cost: at 200 shops, ~$1,200/mo for droplets alone vs ~$100
on a single fat host. We accepted this because per-shop revenue clears
the bar and the simpler model saves engineering time.

## 2. Pull-based update agent, not push from control plane

**Picked.** Each droplet runs a small shell loop that polls
`/api/provisioner/agent/desired` every 5 minutes and updates if drifted.

**Rejected.**

- **SSH loop from control plane.** O(N) connections fan out badly at 200+
  shops, complex retry logic, requires bastion access.
- **Kubernetes / Nomad.** Massive operational overhead for the workload
  we have. We don't need scheduling — every shop has its own home.
- **Webhook push.** Requires every droplet to be reachable from control
  plane (which it already is via the bearer-secret channel). Push works
  but pull is cheaper to reason about — droplets are responsible for
  their own state and the control plane just publishes intent.

**Trade-off.** 5-minute rollout delay. Acceptable; emergency rollback
isn't faster than `docker compose down` on the affected droplet directly.

## 3. Caddy on-demand TLS, not centralized cert issuance

**Picked.** Each droplet's Caddy issues its own Let's Encrypt certs on
first HTTPS request, gated by the control-plane `caddy-ask` endpoint.

**Rejected.**

- **Cert-Manager in K8s.** No K8s. (See decision 2.)
- **Issue certs centrally and ship them.** Adds cert distribution
  pipeline, rotation logic, secrets-at-rest concerns. Caddy already does
  this — let it.
- **Cloudflare proxy mode (orange cloud).** CF would terminate TLS and
  re-originate to the droplet. This *changes the visible source IP* of
  the storefront, which breaks PG's IP-match assumption (they'd be
  checking against CF egress IPs, not the merchant's droplet). Hard no.

**Trade-off.** Let's Encrypt rate limits (50 certs/week per registered
domain). The `caddy-ask` endpoint prevents abuse by only allowing certs
for verified-customer-domain rows.

## 4. Shared Postgres with schema per shop, not DB per shop

**Picked.** Single managed Postgres (DO Managed Database). On provision,
worker runs `CREATE SCHEMA shop_<slug>` and shop's Prisma client uses
`search_path=shop_<slug>`.

**Rejected.**

- **Single DB + `tenant_id` column.** Cheapest, but bug-prone: every
  query needs the filter; one missed `WHERE tenant_id=` is a data leak.
- **DB per shop.** Strongest isolation. But: 200 databases to back up,
  patch, migrate. Operational nightmare and the cost of managed DB per
  shop is high.

**Trade-off.** All shops share the same DB instance, so a runaway shop
query can starve others. Mitigation: per-shop role with statement
timeouts; query monitoring at the DB layer.

## 5. Cron-driven worker, not a long-lived process

**Picked.** Two cron hits (`/api/cron/provisioner-tick` every minute,
`/api/cron/provisioner-health` every 5 minutes) drain the
`ProvisioningJob` queue.

**Rejected.**

- **BullMQ + Redis.** Adds Redis dependency, more moving parts.
  ProvisioningJob already gives us at-least-once durability via
  Postgres rows.
- **Always-on worker process.** Needs a process supervisor; cron +
  status-based polling on Postgres is enough for our throughput
  (worst case: ~5 new shops per day, ~200 health checks per cycle).

**Trade-off.** Up to 60 s latency between job-enqueue and first attempt.
Plenty fast for shop provisioning (5-minute end-to-end is fine for a
human-driven approval).

## Future revisits

| When                                       | Switch to                                |
|--------------------------------------------|------------------------------------------|
| > 500 shops AND DO IP pool feels small     | Move to /29 subnet provider              |
| Provision time matters for UX              | Pre-warm a "ready droplet pool"          |
| Multi-region for latency                   | Region-routed control plane + queue      |
| Shop-runaway queries hurting noisy-neighbor| Migrate hot shops to dedicated DBs       |
| Need true zero-downtime updates per shop   | Add blue/green at the Caddy layer        |
