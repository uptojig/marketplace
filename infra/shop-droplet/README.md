# Shop droplet recipe

Everything in this directory is consumed by the provisioner when it creates
a new shop droplet on DigitalOcean. The goal is to keep boot time under 60s
by relying on a pre-built **snapshot** that already contains:

- Ubuntu 24.04 LTS
- Docker Engine + Compose plugin
- Caddy 2 (auto-TLS + on-demand TLS configured)
- The marketplace shop application image pulled and warm
- A tiny on-droplet `update-agent` that pulls newer image versions

The actual files Caddy and Docker read at runtime are **rendered into the
droplet by cloud-init** at first boot (see `lib/provisioner/cloud-init.ts`),
so the snapshot stays generic and per-shop secrets never leak into image
artifacts.

## Files in this directory

| File                     | Purpose                                                |
|--------------------------|--------------------------------------------------------|
| `Dockerfile.shop`        | Builds the shop app container image                    |
| `Caddyfile.template`     | Reference Caddyfile (the live one is rendered by cloud-init) |
| `update-agent.sh`        | Reference update agent (also rendered by cloud-init)   |
| `build-snapshot.sh`      | Builds a fresh DO snapshot used by the provisioner     |
| `cloud-init.example.yml` | What cloud-init renders, kept for documentation        |

## First-time setup

1. Build the shop image and push it to your registry:

   ```bash
   docker build -f infra/shop-droplet/Dockerfile.shop -t registry.digitalocean.com/<your-registry>/shop-app:latest .
   docker push registry.digitalocean.com/<your-registry>/shop-app:latest
   ```

2. Build the snapshot once (creates a throwaway droplet, installs Docker +
   pulls the image, takes snapshot, destroys droplet):

   ```bash
   export DIGITALOCEAN_TOKEN=...
   export SHOP_IMAGE=registry.digitalocean.com/<your-registry>/shop-app:latest
   bash infra/shop-droplet/build-snapshot.sh
   ```

   The script prints the snapshot ID at the end. Put it in
   `DO_SHOP_SNAPSHOT_ID` in your control-plane `.env`.

3. From then on, every `POST /api/provisioner/provision` boots a droplet
   from this snapshot in ~30s instead of 5 min.

## Why snapshot + cloud-init instead of a full image bake?

- Per-shop secrets (`SHOP_ID`, `INTERNAL_API_SECRET`, DB connection string)
  *must not* live in the snapshot — that would leak them across tenants.
- Cloud-init is the standard DO mechanism for first-boot configuration and
  it idempotently re-renders these files on every reboot (so rotating a
  secret = re-render user-data → reboot droplet).
- The snapshot only holds shared, non-secret bits (Docker, Caddy binary,
  warm shop image).
