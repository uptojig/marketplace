# One-shot installer

Install the entire Marketplace control plane onto a fresh DigitalOcean
Ubuntu 24.04 droplet with a single script.

## What you need before running

- A fresh DO droplet (Ubuntu 24.04, any size ≥ `s-2vcpu-4gb`) with your
  SSH key in `~/.ssh/authorized_keys` for the `root` user
- The droplet's public IPv4
- Your SSH private key on your laptop
- A DigitalOcean API token (Read+Write on Droplet, Snapshot, Image, SSH Key,
  Tag, VPC, Database, Registry)
- A Cloudflare API token + zone id for your apex domain (scopes:
  `Zone:DNS:Edit` + `Zone:Email Routing:Edit`)
- Google OAuth credentials (client id + secret) for NextAuth sign-in
- An admin email (you'll sign in with this and the script auto-promotes you)

## Run

```bash
# 1. Fill in config
cp infra/setup/config.example.sh infra/setup/config.sh
$EDITOR infra/setup/config.sh

# 2. Run installer
bash infra/setup/install.sh
```

Takes **20–35 minutes** total (mostly waiting for managed Postgres to
provision + the shop droplet snapshot build).

## What it does

Six phases — all idempotent (safe to re-run if anything fails halfway):

| Phase | What                                                                 | Time  |
|-------|----------------------------------------------------------------------|-------|
| 1     | Verify local tools, SSH, DO + CF tokens                              | < 1m  |
| 2     | Create / reuse VPC, Managed Postgres, Container Registry             | 5–10m |
| 3     | SSH to droplet → install Docker + Caddy + clone repo                 | 3m    |
| 4     | Build + push images → run migrations → install systemd + Caddy + cron | 5–10m |
| 5     | Build shop droplet snapshot                                          | 15m   |
| 6     | Smoke test + install `promote-admin` helper                          | < 1m  |

## After it finishes

The script prints exact next steps — you'll need to:

1. Add 3 DNS A records in Cloudflare (apex + www + admin → control plane IP)
2. Sign in once at `https://<your-domain>/signin` with your admin email
3. Run the printed `promote-admin` command (sets your role to ADMIN)
4. Open `/admin/provisioning` and test approving a shop

## File layout

```
infra/setup/
├── README.md                   ← you are here
├── config.example.sh           ← template (commit this)
├── config.sh                   ← your real values (.gitignored — never commit)
├── install.sh                  ← run from your laptop
├── bootstrap.sh                ← runs on droplet (uploaded by install.sh)
├── install-services.sh         ← runs on droplet (systemd + Caddy)
├── install-cron.sh             ← runs on droplet (cron jobs)
└── uninstall.sh                ← reverses install.sh (optional --nuke-do)
```

## Troubleshooting

If `install.sh` fails partway through, re-run it. Each phase is idempotent
and will skip work that's already done.

For deeper issues see:

- [../../docs/multi-tenant-provisioning/setup-do-fresh.md](../../docs/multi-tenant-provisioning/setup-do-fresh.md)
  — manual step-by-step version of what this script automates, with
  troubleshooting notes
- [../../docs/multi-tenant-provisioning/runbook.md](../../docs/multi-tenant-provisioning/runbook.md)
  — day-2 ops (after install is done)

## Removing

```bash
bash infra/setup/uninstall.sh             # leaves DB + snapshots intact
bash infra/setup/uninstall.sh --nuke-do   # ALSO destroys DB + snapshots (requires typing DESTROY)
```

The target droplet itself is never destroyed by the script — destroy it
manually via `doctl compute droplet delete <id>` once you're done.
