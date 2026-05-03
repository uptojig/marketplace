#!/usr/bin/env node
/**
 * Seed three demo accounts for QA/walkthrough:
 *   admin@demo.basketplace.co     ADMIN     password: demo-admin-2026
 *   vendor@demo.basketplace.co    VENDOR    password: demo-vendor-2026
 *   customer@demo.basketplace.co  CUSTOMER  password: demo-customer-2026
 *
 * Each account gets a bcrypt-hashed password set so QA can log in via
 * the credentials form at /signin without needing access to the
 * EMAIL_SERVER mailbox for magic-link delivery. The same accounts can
 * also still sign in via Google OAuth or magic-link if the operator
 * prefers — passwordHash and OAuth/Account rows coexist on User.
 *
 * Re-running is safe: upserts by email, so role + passwordHash flip
 * back to the canonical values if someone changed them via /admin/users.
 *
 * Usage:
 *   node scripts/create-demo-accounts.mjs
 *   node scripts/create-demo-accounts.mjs --email=foo@bar.com --role=VENDOR --password=hunter2
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULTS = [
  {
    email: "admin@demo.basketplace.co",
    name: "Demo Admin",
    role: "ADMIN",
    password: "demo-admin-2026",
  },
  {
    email: "vendor@demo.basketplace.co",
    name: "Demo Vendor",
    role: "VENDOR",
    password: "demo-vendor-2026",
  },
  {
    email: "customer@demo.basketplace.co",
    name: "Demo Customer",
    role: "CUSTOMER",
    password: "demo-customer-2026",
  },
];

const args = process.argv.slice(2);
const flagEmail = args.find((a) => a.startsWith("--email="))?.split("=")[1];
const flagRole = args.find((a) => a.startsWith("--role="))?.split("=")[1];
const flagName = args.find((a) => a.startsWith("--name="))?.split("=")[1];
const flagPwd = args.find((a) => a.startsWith("--password="))?.split("=")[1];

const targets =
  flagEmail && flagRole
    ? [
        {
          email: flagEmail,
          name: flagName ?? flagEmail.split("@")[0],
          role: flagRole.toUpperCase(),
          password: flagPwd ?? null, // null = leave password unset
        },
      ]
    : DEFAULTS;

const VALID_ROLES = ["CUSTOMER", "VENDOR", "ADMIN"];

console.log(`Seeding ${targets.length} demo account(s)…\n`);

for (const t of targets) {
  if (!VALID_ROLES.includes(t.role)) {
    console.error(
      `  ✗ ${t.email}: invalid role "${t.role}" (must be one of ${VALID_ROLES.join(", ")})`,
    );
    continue;
  }
  const passwordHash = t.password ? await bcrypt.hash(t.password, 12) : null;
  const u = await prisma.user.upsert({
    where: { email: t.email.toLowerCase() },
    // Only update passwordHash if we computed a new one — passing
    // null would clobber any pwd the operator manually set.
    update: passwordHash
      ? { role: t.role, name: t.name, passwordHash }
      : { role: t.role, name: t.name },
    create: {
      email: t.email.toLowerCase(),
      name: t.name,
      role: t.role,
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  const isNew = Date.now() - new Date(u.createdAt).getTime() < 5_000;
  const pwdNote = t.password ? ` · pwd: ${t.password}` : " · no pwd";
  console.log(
    `  ${isNew ? "+" : "↻"} ${u.role.padEnd(8)} ${u.email}  →  ${u.id}${pwdNote}`,
  );
}

console.log(
  `\n✅ Done. Sign in via /signin with email + password — or via Google OAuth / magic-link to the same email.`,
);

await prisma.$disconnect();
