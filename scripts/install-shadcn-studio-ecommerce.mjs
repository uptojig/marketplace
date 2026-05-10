#!/usr/bin/env node
/**
 * Install every Shadcn Studio e-commerce block (https://shadcnstudio.com/blocks#ecommerce)
 * into this repo via the @ss-blocks registry declared in components.json.
 *
 * Prereq: SHADCN_STUDIO_EMAIL and SHADCN_STUDIO_LICENSE_KEY must be in .env.local
 * (run `vercel env pull .env.local` to copy from Vercel).
 *
 * Usage:
 *   node scripts/install-shadcn-studio-ecommerce.mjs              # try every variant
 *   node scripts/install-shadcn-studio-ecommerce.mjs --max 30     # widen variant search
 *   node scripts/install-shadcn-studio-ecommerce.mjs --only shopping-cart,checkout-page
 *
 * The shadcn CLI surfaces a "401 unauthorized" error for both missing slugs and
 * unauthorized ones, so we don't try to distinguish — we simply attempt each
 * candidate and log success/failure.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CATEGORIES = [
  // E-commerce blocks
  "shopping-cart",
  "product-list",
  "product-overview",
  "product-category",
  "product-quick-view",
  "product-reviews",
  "checkout-page",
  "order-summary",
  "category-filter",
  "offer-modal",
  "mega-footer",
  // Dashboard / application blocks (used by /dashboard chrome).
  // The shadcn-studio "dashboard-and-application" category exposes
  // each piece as its own slug, so we try each independently.
  "dashboard-shell",
  "dashboard-sidebar",
  "dashboard-header",
  "dashboard-footer",
  "dashboard-dropdown",
];

const args = process.argv.slice(2);
const maxIdx = args.indexOf("--max");
const onlyIdx = args.indexOf("--only");
const MAX = maxIdx >= 0 ? Number(args[maxIdx + 1]) : 20;
const ONLY = onlyIdx >= 0 ? args[onlyIdx + 1].split(",").map((s) => s.trim()) : null;

const envLocal = resolve(process.cwd(), ".env.local");
if (existsSync(envLocal)) {
  for (const line of readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
if (!process.env.SHADCN_STUDIO_EMAIL || !process.env.SHADCN_STUDIO_LICENSE_KEY) {
  console.error("Missing SHADCN_STUDIO_EMAIL / SHADCN_STUDIO_LICENSE_KEY.");
  console.error("Run: vercel env pull .env.local");
  process.exit(1);
}

const targets = ONLY ? CATEGORIES.filter((c) => ONLY.includes(c)) : CATEGORIES;
const installed = [];
const skipped = [];

for (const cat of targets) {
  for (let i = 1; i <= MAX; i++) {
    const slug = `${cat}-${String(i).padStart(2, "0")}`;
    const item = `@ss-blocks/${slug}`;
    process.stdout.write(`→ ${item} ... `);
    const res = spawnSync("npx", ["shadcn@latest", "add", item, "--yes", "--overwrite"], {
      encoding: "utf8",
      env: process.env,
    });
    const out = (res.stdout || "") + (res.stderr || "");
    if (res.status === 0 && !/error|not authorized|404/i.test(out)) {
      console.log("ok");
      installed.push(item);
    } else {
      console.log("skip");
      skipped.push(item);
    }
  }
}

console.log(`\nInstalled ${installed.length} block(s):`);
for (const i of installed) console.log(`  ${i}`);
if (installed.length === 0) {
  console.log("  (none — check credentials and registry config in components.json)");
}
