#!/usr/bin/env node
/**
 * Read-only audit script for the 6 launch stores from
 * docs/six-store-golive-audit.md Section 1.
 *
 * Pulls everything needed to fill in the "NEEDS PROD LOOKUP" cells
 * and verify go-live blockers without touching any data.
 *
 * Usage:  node scripts/audit-six-stores.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUGS = [
  "minimop24",
  "zugarbox",
  "ergobodies",
  "Powerpuff678",
  "casethep",
  "bikini551",
];

// Mirrors templateGroups in lib/templates/registry.ts (per audit doc)
const TEMPLATE_GROUP = {
  classic: "trust", "official-brand": "trust", "premium-luxury": "trust",
  lookbook: "fashion-beauty", "beauty-swatch": "fashion-beauty", boutique: "fashion-beauty",
  "catalog-dense": "electronics-tech", "tech-compare": "electronics-tech", "single-product": "electronics-tech",
  "home-living": "lifestyle", "sport-active": "lifestyle", "kids-toys": "lifestyle",
  "live-commerce": "community", "video-feed": "community", storyteller: "community",
  "wholesale-b2b": "business-model", "flash-deal": "business-model", subscription: "business-model",
  handmade: "specialty", vintage: "specialty",
};

// Coverage status per audit doc Section 1
const FAMILY_COVERAGE = {
  trust: { status: "✅ MERGED", pr: "#41" },
  "fashion-beauty": { status: "✅ MERGED", pr: "#38" },
  specialty: { status: "✅ MERGED (PR #43 referenced)", pr: "#43" },
  "electronics-tech": { status: "🟡 in-flight (#79 covers 6 families)", pr: "—" },
  lifestyle: { status: "🟡 in-flight (#79 covers 6 families)", pr: "—" },
  "business-model": { status: "✅ MERGED (BM family work #89-94)", pr: "—" },
  community: { status: "🛑 NOT BEING BUILT", pr: "—" },
};

function renderPath(s) {
  if (!s.landingBlocks && !s.templateId) return "default";
  if (s.templateId) return "react-template";
  return "ai-multi-page";
}

function familyOf(s) {
  if (s.templateId && TEMPLATE_GROUP[s.templateId]) return TEMPLATE_GROUP[s.templateId];
  if (s.landingThemeVariant === "business-model") return "business-model";
  return null;
}

function fmt(d) {
  return d ? new Date(d).toISOString().slice(0, 19).replace("T", " ") : "—";
}

function header(title) {
  console.log("\n" + "═".repeat(78));
  console.log(" " + title);
  console.log("═".repeat(78));
}

async function main() {
  header("1. STORE ROWS — 6 launch stores");

  const stores = await prisma.store.findMany({
    where: { slug: { in: SLUGS } },
    select: {
      id: true,
      slug: true,
      name: true,
      templateId: true,
      landingThemeVariant: true,
      landingStatus: true,
      approvalStatus: true,
      customDomain: true,
      isActive: true,
      ownerId: true,
      createdAt: true,
      approvedAt: true,
      // Detect render path
      landingBlocks: false, // never select the full JSON
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
  });

  // We need landingBlocks presence; do a second slim query
  const blocksPresence = await prisma.store.findMany({
    where: { slug: { in: SLUGS } },
    select: { id: true, slug: true, landingBlocks: true },
  });
  const hasBlocks = new Map(
    blocksPresence.map((r) => [r.id, r.landingBlocks != null]),
  );

  // Missing stores?
  const found = new Set(stores.map((s) => s.slug.toLowerCase()));
  const missing = SLUGS.filter((s) => !found.has(s.toLowerCase()));
  if (missing.length) {
    console.log(`⚠ Missing from DB: ${missing.join(", ")}`);
  }

  console.log("");
  for (const s of stores) {
    const hb = hasBlocks.get(s.id) ?? false;
    const rp = renderPath({ landingBlocks: hb, templateId: s.templateId });
    const fam = familyOf(s);
    const cov = fam ? FAMILY_COVERAGE[fam] : null;
    console.log(`▸ ${s.slug}  (${s.name})`);
    console.log(`  id              ${s.id}`);
    console.log(`  approvalStatus  ${s.approvalStatus}   isActive=${s.isActive}`);
    console.log(`  customDomain    ${s.customDomain ?? "—"}`);
    console.log(`  templateId      ${s.templateId ?? "—"}`);
    console.log(`  landingVariant  ${s.landingThemeVariant ?? "—"}   landingStatus=${s.landingStatus ?? "—"}`);
    console.log(`  landingBlocks   ${hb ? "present" : "—"}`);
    console.log(`  render path     ${rp}`);
    console.log(`  family          ${fam ?? "(default render — no family pilot needed)"}`);
    if (cov) console.log(`  family cov.     ${cov.status}  ${cov.pr}`);
    console.log(`  products        ${s._count.products}`);
    console.log(`  orders          ${s._count.orders}`);
    console.log(`  created/approved ${fmt(s.createdAt)} / ${fmt(s.approvedAt)}`);
    console.log("");
  }

  header("2. SHOP DEPLOYMENT — provisioning + IP + whitelist");

  const deployments = await prisma.shopDeployment.findMany({
    where: { storeId: { in: stores.map((s) => s.id) } },
    select: {
      storeId: true,
      status: true,
      doDropletId: true,
      doRegion: true,
      publicIpv4: true,
      customDomainVerified: true,
      customDomainVerifiedAt: true,
      paymentWhitelistStatus: true,
      paymentWhitelistRequestedAt: true,
      paymentWhitelistConfirmedAt: true,
      healthyAt: true,
      missedHealthChecks: true,
      lastError: true,
    },
  });
  const depBy = new Map(deployments.map((d) => [d.storeId, d]));

  console.log("");
  for (const s of stores) {
    const d = depBy.get(s.id);
    if (!d) {
      console.log(`▸ ${s.slug}  ❌ NO ShopDeployment row`);
      continue;
    }
    console.log(`▸ ${s.slug}`);
    console.log(`  status              ${d.status}`);
    console.log(`  droplet             ${d.doDropletId ?? "—"}  region=${d.doRegion ?? "—"}`);
    console.log(`  publicIpv4          ${d.publicIpv4 ?? "—"}`);
    console.log(`  customDomainVerif   ${d.customDomainVerified}  at=${fmt(d.customDomainVerifiedAt)}`);
    console.log(`  paymentWhitelist    ${d.paymentWhitelistStatus}`);
    console.log(`     requested=${fmt(d.paymentWhitelistRequestedAt)}  confirmed=${fmt(d.paymentWhitelistConfirmedAt)}`);
    console.log(`  healthyAt           ${fmt(d.healthyAt)}  missed=${d.missedHealthChecks ?? 0}`);
    if (d.lastError) console.log(`  lastError           ${String(d.lastError).slice(0, 200)}`);
    console.log("");
  }

  header("3. IDENTITY VERIFICATION (Phase 1 + KYC anchor)");

  const ids = await prisma.identityVerification.findMany({
    where: { storeId: { in: stores.map((s) => s.id) } },
    select: {
      storeId: true,
      status: true,
      emailVerifiedAt: true,
      kycSubmittedAt: true,
      kycReviewedAt: true,
    },
  });
  const idBy = new Map(ids.map((i) => [i.storeId, i]));
  console.log("");
  for (const s of stores) {
    const i = idBy.get(s.id);
    const tag = i ? `${i.status}  email=${fmt(i.emailVerifiedAt)}  kyc=${fmt(i.kycReviewedAt)}` : "❌ NO row";
    console.log(`  ${s.slug.padEnd(15)} ${tag}`);
  }

  header("4. ORDERS / PAYMENTS — has any money moved?");

  const orderCounts = await prisma.order.groupBy({
    by: ["storeId", "status"],
    where: { storeId: { in: stores.map((s) => s.id) } },
    _count: { _all: true },
    _sum: { totalTHB: true },
  });

  console.log("");
  for (const s of stores) {
    const rows = orderCounts.filter((r) => r.storeId === s.id);
    if (!rows.length) {
      console.log(`  ${s.slug.padEnd(15)} no orders`);
      continue;
    }
    const parts = rows
      .map((r) => `${r.status}=${r._count._all}(${r._sum.totalTHB ?? 0}฿)`)
      .join("  ");
    console.log(`  ${s.slug.padEnd(15)} ${parts}`);
  }

  header("5. PRODUCT HEALTH — translation backlog + stock");

  for (const s of stores) {
    const total = await prisma.product.count({ where: { storeId: s.id } });
    const noTitleTh = await prisma.product.count({
      where: { storeId: s.id, OR: [{ titleTh: null }, { titleTh: "" }] },
    });
    const inactive = await prisma.product.count({
      where: { storeId: s.id, active: false },
    });
    const noStock = await prisma.product.count({
      where: { storeId: s.id, stockTotal: 0, hasVariants: false },
    });
    console.log(
      `  ${s.slug.padEnd(15)} total=${total}  noTitleTh=${noTitleTh}  inactive=${inactive}  zeroStock=${noStock}`,
    );
  }

  header("6. COVERAGE MATRIX — final go-live verdict");

  const verdict = [];
  for (const s of stores) {
    const hb = hasBlocks.get(s.id) ?? false;
    const rp = renderPath({ landingBlocks: hb, templateId: s.templateId });
    const fam = familyOf(s);
    const cov = fam ? FAMILY_COVERAGE[fam] : null;
    const d = depBy.get(s.id);

    const blockers = [];
    if (s.approvalStatus !== "APPROVED") blockers.push(`approval=${s.approvalStatus}`);
    if (!d) blockers.push("no-deployment-row");
    else {
      if (d.status !== "ACTIVE") blockers.push(`deploy=${d.status}`);
      if (!d.publicIpv4) blockers.push("no-IP");
      if (s.customDomain && !d.customDomainVerified) blockers.push("domain-unverified");
      if (d.paymentWhitelistStatus !== "CONFIRMED") blockers.push(`pg-whitelist=${d.paymentWhitelistStatus}`);
    }
    if (fam === "community") blockers.push("family=community-NOT-BUILT");
    if (cov && cov.status.startsWith("🟡")) blockers.push(`family=${fam}-in-flight`);

    verdict.push({ slug: s.slug, family: fam ?? "default", render: rp, blockers });
  }

  console.log("");
  console.log("  Slug             Family            Render            Blockers");
  console.log("  ───────────────  ────────────────  ────────────────  " + "─".repeat(40));
  for (const v of verdict) {
    const b = v.blockers.length ? v.blockers.join(", ") : "✅ READY";
    console.log(
      `  ${v.slug.padEnd(15)}  ${(v.family ?? "—").padEnd(16)}  ${v.render.padEnd(16)}  ${b}`,
    );
  }

  console.log("");
  console.log("Done. (read-only — no rows changed)");
}

main()
  .catch((e) => {
    console.error("ERROR:", e?.message || e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
