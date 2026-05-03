#!/usr/bin/env node
/**
 * Seed three demo accounts for QA/walkthrough:
 *   admin@demo.basketplace.co     ADMIN
 *   vendor@demo.basketplace.co    VENDOR
 *   customer@demo.basketplace.co  CUSTOMER
 *
 * NextAuth uses Google OAuth + email magic-link. We don't store
 * passwords, so this script just inserts/updates the User rows
 * so the demo emails are recognized + role-mapped on first sign-in.
 *
 * To actually log in as a demo account:
 *   1. Visit /signin
 *   2. Enter the demo email
 *   3. Click the magic link in the inbox configured by EMAIL_SERVER
 *   4. NextAuth links the OAuth/email session to the existing row
 *
 * Re-running is safe: upserts by email, so role flips back to the
 * intended one if someone changed it via /admin/users.
 *
 * Usage:
 *   node scripts/create-demo-accounts.mjs
 *   node scripts/create-demo-accounts.mjs --email=foo@bar.com --role=VENDOR
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULTS = [
  {
    email: "admin@demo.basketplace.co",
    name: "Demo Admin",
    role: "ADMIN",
  },
  {
    email: "vendor@demo.basketplace.co",
    name: "Demo Vendor",
    role: "VENDOR",
  },
  {
    email: "customer@demo.basketplace.co",
    name: "Demo Customer",
    role: "CUSTOMER",
  },
];

const args = process.argv.slice(2);
const flagEmail = args.find((a) => a.startsWith("--email="))?.split("=")[1];
const flagRole = args.find((a) => a.startsWith("--role="))?.split("=")[1];
const flagName = args.find((a) => a.startsWith("--name="))?.split("=")[1];

const targets =
  flagEmail && flagRole
    ? [
        {
          email: flagEmail,
          name: flagName ?? flagEmail.split("@")[0],
          role: flagRole.toUpperCase(),
        },
      ]
    : DEFAULTS;

const VALID_ROLES = ["CUSTOMER", "VENDOR", "ADMIN"];

console.log(`Seeding ${targets.length} demo account(s)…\n`);

for (const t of targets) {
  if (!VALID_ROLES.includes(t.role)) {
    console.error(`  ✗ ${t.email}: invalid role "${t.role}" (must be one of ${VALID_ROLES.join(", ")})`);
    continue;
  }
  const u = await prisma.user.upsert({
    where: { email: t.email.toLowerCase() },
    update: { role: t.role, name: t.name },
    create: { email: t.email.toLowerCase(), name: t.name, role: t.role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  const isNew = Date.now() - new Date(u.createdAt).getTime() < 5_000;
  console.log(
    `  ${isNew ? "+" : "↻"} ${u.role.padEnd(8)} ${u.email}  →  ${u.id}`,
  );
}

console.log(
  `\n✅ Done. Sign in via /signin with any of these emails to get the role.`,
);
console.log(
  `   (Magic link goes to whatever inbox EMAIL_SERVER is configured for.)`,
);

await prisma.$disconnect();
