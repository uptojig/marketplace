# First-time setup

Run through this checklist once before approving the first shop.

## 1. DigitalOcean

1. Create a DO API token at https://cloud.digitalocean.com/account/api/tokens
   — scope: **Read + Write** for `droplet`, `snapshot`, `image`, `ssh_key`.
   Save it as `DIGITALOCEAN_TOKEN`.

2. Decide on region and size. Defaults are `sgp1` + `s-1vcpu-1gb` (~$6/mo,
   1 GB RAM). Match the region of your managed Postgres so VPC works.

3. Create a Project (optional but tidy):
   `DigitalOcean → Projects → New → "Marketplace shops"`
   — every provisioned droplet gets tagged `marketplace,shop-droplet,shop:<slug>`.

4. Upload SSH keys you want to be able to debug droplets with. Note the
   key fingerprints. Set `DO_SSH_KEY_IDS=fingerprint1,fingerprint2`.

## 2. Cloudflare

`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` are already defined for the
platform-email feature. The provisioner reuses them — just make sure the
token has BOTH scopes:

1. `Zone:Email Routing:Edit` — for alias provisioning (existing)
2. `Zone:DNS:Edit`           — for shop subdomain A records (NEW)

If the token only has Email Routing, regenerate it at
https://dash.cloudflare.com/profile/api-tokens with both scopes on the
platform zone, then update `CLOUDFLARE_API_TOKEN`.

The zone must match `MAIN_DOMAIN`. Verify by reading the zone overview
on the Cloudflare dashboard — the apex matches your `MAIN_DOMAIN` env.

3. Verify a manual A record write works:
   ```
   curl -X POST https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"A","name":"_provisioner-test","content":"1.2.3.4","ttl":60,"proxied":false}'
   ```

## 3. Postgres

The same managed Postgres serves both the control plane and every shop
droplet. Each shop gets its own schema (e.g. `shop_petlove`) provisioned
by the worker on first run.

1. Create a managed Postgres on DO (or use an existing one). Place it in
   the same VPC + region as the future droplets.

2. Run migrations from the control plane:
   ```
   npx prisma migrate deploy
   ```

3. Set `DATABASE_URL` for the control plane and `SHOP_DATABASE_URL` for
   shops. If they're the same database, you can leave `SHOP_DATABASE_URL`
   unset — provisioner will reuse `DATABASE_URL`.

## 4. Internal secrets

```
INTERNAL_API_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)
```

For admin alerts ("shop ready for whitelist", "droplet unhealthy"), the
provisioner reuses the existing platform notifier:

```
NOTIFIER_DRIVER=discord            # or "line" or "console"
DISCORD_WEBHOOK_URL=https://...    # if driver=discord
LINE_NOTIFY_TOKEN=...              # if driver=line
```

`INTERNAL_API_SECRET` is shared between the control plane and every shop
droplet's update-agent. Rotating it requires regenerating cloud-init on
each droplet (re-render + reboot).

## 5. Shop image + snapshot

1. Build + push the shop image:
   ```bash
   docker build -f infra/shop-droplet/Dockerfile.shop \
     -t registry.digitalocean.com/<registry>/shop-app:latest .
   docker push registry.digitalocean.com/<registry>/shop-app:latest
   ```

2. Build the boot snapshot (~15 min, one-off):
   ```bash
   export DIGITALOCEAN_TOKEN=...
   export SHOP_IMAGE=registry.digitalocean.com/<registry>/shop-app:latest
   bash infra/shop-droplet/build-snapshot.sh
   # Save the printed snapshot id into DO_SHOP_SNAPSHOT_ID
   ```

3. After the snapshot exists, fresh shop provisioning takes ~30–90 s
   instead of ~5 min.

## 6. Cron scheduling

Two endpoints need to fire on a schedule:

- `GET /api/cron/provisioner-tick`   — every 1 minute (drains queue)
- `GET /api/cron/provisioner-health` — every 5 minutes (enqueues probes)

Both require `Authorization: Bearer $CRON_SECRET`.

### Scheduling — DO Functions / GitHub Actions / system cron

Any HTTP scheduler works. With GitHub Actions:
```yaml
on:
  schedule:
    - cron: '* * * * *'
jobs:
  tick:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
               https://control.example.com/api/cron/provisioner-tick
```

## 7. Smoke test

1. Create a test store in `/admin/stores/new`.
2. Approve it → an entry appears in `/admin/provisioning` within seconds.
3. Watch jobs flow through `CREATE_DROPLET → ... → READY_FOR_WHITELIST`.
4. The slug subdomain `<slug>.<platform>.com` should serve the storefront
   over HTTPS within ~90 s.
5. Confirm whitelist with a fake note — deployment moves to ACTIVE.
6. Click "Destroy droplet" — droplet + DNS records are reaped.

If anything goes wrong, see [runbook.md](./runbook.md).
