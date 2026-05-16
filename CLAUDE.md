# Repo rules for Claude sessions

## Git workflow — branches

- **PR base is ALWAYS `feat/multi-tenant-provisioning`, NEVER `main`.**
  - `feat/multi-tenant-provisioning` is the active integration branch that
    Vercel deploys to production (basketplace.co) and from which shop
    droplets pull. `main` is stale and not used for releases.
  - Any new PR must target `feat/multi-tenant-provisioning` as its base.
  - If a PR was accidentally opened against `main`, retarget the base
    before merging.
- Feature work goes on `claude/<topic>-<suffix>` branches off
  `feat/multi-tenant-provisioning`.
