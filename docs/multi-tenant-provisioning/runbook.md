# Runbook

Day-to-day operational tasks + troubleshooting for the multi-tenant
provisioning system.

## Approving a shop

1. Admin opens `/admin/stores/<id>`, reviews KYC + landing page.
2. Click **Approve**. `PATCH /api/admin/stores/<id>/approval` runs.
3. Approval handler fires `provisionStore(storeId)` (background).
4. A `ShopDeployment` row is created (status=`PENDING`) and the first
   `ProvisioningJob` of type `CREATE_DROPLET` is enqueued.
5. The cron-driven worker picks it up within 1 minute.

Estimated time from approve → storefront live: **60–120 seconds** (with
snapshot) or **3–6 minutes** (first deploy before snapshot exists).

## Watching a deployment

`/admin/provisioning` — list of every deployment with current state.
Click into a deployment to see:

- Droplet info (id, region, IP)
- DNS record ids (subdomain + custom domain if any)
- Health status + last seen
- Provisioning job history (last 50)
- Payment whitelist actions

## Common transitions

### Confirm payment whitelist

After admin sends the IP to the payment provider and they confirm:

1. Go to `/admin/provisioning/<deploymentId>`.
2. Scroll to "Payment Provider Whitelist".
3. Click **Confirm whitelist** (optional: paste PG ticket number into note).
4. Deployment moves to `ACTIVE`. Storefront's payment flow is enabled.

### Resume a FAILED deployment

A deployment ends up FAILED when a job exhausts its 5 attempts. Common
causes:

- DO API rate-limited mid-create
- CF zone permission missing
- Snapshot id is stale / deleted
- Droplet booted but cloud-init failed

Fix the underlying cause, then click **Resume / Retry provisioning** on
the deployment page. The orchestrator picks up at whichever stage the
deployment is in (idempotent — no duplicate droplets created).

### Destroy a droplet

`/admin/provisioning/<deploymentId>` → expand "Destroy droplet" → type the
slug to confirm. The orchestrator:

1. Deletes Cloudflare DNS records (subdomain + any custom-domain records
   we own).
2. Calls `DELETE /v2/droplets/<id>` on DO.
3. Sets the deployment to `ARCHIVED`. The shop row + schema in Postgres
   are NOT touched.

The IP is released back to DO's pool. **Notify the payment provider** so
they unwhitelist — otherwise the IP gets recycled to someone else's shop
and the PG starts accepting calls from a stranger.

## Vendor custom domains

### Setup flow (what the vendor sees)

1. In vendor dashboard, vendor enters their domain (e.g. `myshop.com`).
2. UI shows: "Set an A record on `myshop.com` pointing to
   `<droplet IP>`."
3. Vendor adds the A record at their own DNS provider.
4. Vendor clicks **Verify** — control plane resolves the domain via DoH
   and checks the answer matches `publicIpv4`.
5. On match, `customDomainVerified` becomes true and Caddy starts
   issuing a Let's Encrypt cert on first HTTPS request.

If verification fails, the UI surfaces the answer it actually saw
(usually the vendor pointed to a CNAME or wrong IP).

### Cert renewal

Caddy auto-renews 60 days before expiry. No action needed.

### Vendor moves their domain elsewhere

Periodic check: `customDomainLastChecked` updated by the health-check job
(future enhancement). When the resolved IP stops matching, set
`customDomainVerified=false` → caddy-ask stops authorizing fresh certs.
Existing cert keeps working until it expires (~90 days).

## Updates / patches

The on-droplet `update-agent` polls `/api/provisioner/agent/desired`
every 5 minutes. If the returned image tag differs from what's running,
agent pulls + restarts the `shop` service.

To push an update fleet-wide:

1. Build + push a new image tag (CI does this on merge to main).
2. Set `SHOP_IMAGE=registry.../shop-app:vX.Y.Z` in the control plane env.
3. Within 5 minutes, every droplet rolls forward. Heartbeat reports the
   new tag in `ShopDeployment.runningVersion`.

To roll back: revert `SHOP_IMAGE`. Same TTL.

To pin a single shop to an older version (canary unwind): set
`runningVersion` on the deployment + mark status `SUSPENDED` temporarily,
then re-enable. (Future: explicit pin field.)

## Troubleshooting

### Deployment stuck in CREATING_DROPLET

```
SELECT job.* FROM "ProvisioningJob" job
  JOIN "ShopDeployment" d ON d.id = job."deploymentId"
 WHERE d.status = 'CREATING_DROPLET' AND job.status = 'FAILED'
 ORDER BY job."finishedAt" DESC LIMIT 5;
```

Common reasons:

| `errorMessage`                              | Fix                                         |
|---------------------------------------------|---------------------------------------------|
| `HTTP 401 unauthorized`                     | `DIGITALOCEAN_TOKEN` invalid / expired      |
| `HTTP 422 ... region`                       | Region quota — request limit increase       |
| `HTTP 422 ... image not found`              | `DO_SHOP_SNAPSHOT_ID` deleted/wrong region  |
| `Droplet ... did not become active`         | DO control plane slow — click Resume        |

### Deployment stuck in DEPLOYING_APP

The droplet is up but `/health` never returns 200. SSH in:

```
ssh -i ~/.ssh/your-do-key root@<publicIpv4>
journalctl -u cloud-final --no-pager
docker compose -f /opt/marketplace-shop/docker-compose.yml ps
docker compose -f /opt/marketplace-shop/docker-compose.yml logs shop --tail=200
```

Most common issues:
- `DATABASE_URL` not reachable (check VPC peering)
- Image pull failed (registry creds missing)
- Caddy hits Let's Encrypt rate-limit (check `/var/log/caddy/access.log`)

### Caddy keeps issuing then failing certs

If `caddy-ask` returns 200 but Let's Encrypt fails, you'll see repeated
`acme` errors in Caddy logs. Either:

- The hostname doesn't resolve to the droplet IP (DNS not propagated yet)
- HTTP-01 challenge blocked by firewall (port 80 must be open)
- LE rate limit hit (50 certs/week per registered domain) — wait 24h or
  use staging issuer

### Worker isn't draining the queue

```
curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  https://<control-plane>/api/cron/provisioner-tick
```

Should return `{"ok":true,"processed":N}`. If 401, secret mismatch. If
0 processed but queue has rows, the queued rows might be in the future
(`scheduledFor > now`) — that's normal during exponential backoff.

### Outbound IP doesn't match what the PG sees

From the shop droplet:

```
ssh root@<publicIpv4>
curl -4 https://api.ipify.org
```

This MUST return the same IP as `ShopDeployment.publicIpv4`. If different,
something's NATting outbound — check that you DIDN'T enable Cloudflare
proxying ("orange cloud") on the A record. We always use grey-cloud
for shop subdomains.

## Audit trail

Every provisioning side-effect writes to `AuditLog`:

- `deployment.provision` / `deployment.resume` / `deployment.deprovision`
- `payment_whitelist.confirm` / `payment_whitelist.reject`

Query via `/admin/audit-log` or directly with SQL.
