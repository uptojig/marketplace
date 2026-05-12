# Payment provider whitelist workflow

The PG doesn't expose an API for managing the IP whitelist — admins
contact them manually. This document captures the workflow.

## Why manual?

The PG verifies merchants behind the scenes (KYC) before granting access
to their production API. Every new IP needs a human at the PG to flip a
flag on the merchant's account. We've asked for API access; until then,
we treat this as a 1–2 business-day async step.

## Workflow

```
   READY_FOR_WHITELIST
         │
         │ ① control plane fires admin notification
         │   (Discord / LINE — see WHITELIST_ALERT_CHANNEL)
         │
         ▼
   admin opens ticket with PG, includes:
   - Shop legal name + tax id (from Store.companyName / Store.taxId)
   - Public IPv4 (from /admin/provisioning/<id>)
   - Storefront URL (slug subdomain + custom domain if any)
   - PG merchant id (already mapped per-shop in PG portal)
         │
         │ ② PG confirms (email / dashboard)
         │
         ▼
   admin clicks "Confirm whitelist" in /admin/provisioning/<id>
         │
         ▼
   ShopDeployment.paymentWhitelistStatus = CONFIRMED
   ShopDeployment.status                  = ACTIVE
```

## Communicating with the PG

A copy-paste template for the support ticket:

> Subject: New merchant — request IP whitelist for production API
>
> Hi PG team,
>
> Please add the following IP to the whitelist for merchant
> "<Store.companyName>" (merchant id: <pg-merchant-id>):
>
>   IP: <Public IPv4>
>   Storefront: https://<slug>.<platform>.com
>   Tax ID: <Store.taxId>
>
> This IP is dedicated to this merchant (1:1 mapping). Both inbound
> webhooks and outbound API calls will use it.
>
> Could you also confirm the webhook source IPs we should expect, so we
> can verify on our side?
>
> Thank you.

## When the PG rejects

Click **Reject** in the whitelist panel and paste the reason. The
deployment stays in `WHITELIST_REQUESTED` status — the droplet keeps
running, but `Order` creation blocks `Payment.create` calls at the app
layer (read `paymentWhitelistStatus` before charging).

Vendor sees an in-dashboard notice: *"Payment activation is on hold —
please contact support."*

## Rotating an IP

Sometimes a droplet's IP must change (DO sometimes recycles IPs after
ARCHIVE; we move shop to a different region; etc.). Steps:

1. Mark deployment SUSPENDED in admin.
2. Email PG asking them to **remove** the old IP from the whitelist.
3. Click "Destroy droplet" — captures audit trail.
4. Re-provision the shop. Fresh droplet, fresh IP.
5. Email PG with the new IP, wait for confirmation, click Confirm.

**Don't** skip step 2. Stale whitelisted IPs are a PG audit finding.

## Bulk audit

To produce a report of every IP currently registered with the PG:

```sql
SELECT
  s.slug,
  s."companyName",
  s."taxId",
  d."publicIpv4",
  d."paymentWhitelistStatus",
  d."paymentWhitelistConfirmedAt"
FROM "ShopDeployment" d
JOIN "Store"          s ON s.id = d."storeId"
WHERE d.status = 'ACTIVE'
ORDER BY d."paymentWhitelistConfirmedAt";
```

Reconcile this against the PG dashboard quarterly.
