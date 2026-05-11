// GET /api/provisioner/caddy-ask?domain=foo.example.com
//
// Caddy on every shop droplet uses on-demand TLS for any host that isn't
// the platform slug subdomain. Before issuing a Let's Encrypt cert it
// hits this endpoint with `?domain=<sni>` — we respond 200 only if a
// verified deployment exists for that domain. Anything else is 404, which
// makes Caddy abort and stops Let's Encrypt rate-limit abuse.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/provisioner/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = (searchParams.get("domain") ?? "").toLowerCase().trim();
  if (!domain) return NextResponse.json({ allow: false, reason: "missing domain" }, { status: 400 });

  const cfg = getConfig();
  const platform = cfg.cfPlatformDomain.toLowerCase();

  // 1. Platform-owned slug subdomain — always allow (handled by snapshot wildcard
  //    in production, but if Caddy falls through we still want to issue per-host).
  if (domain.endsWith(`.${platform}`)) {
    const slug = domain.slice(0, -platform.length - 1);
    const store = await prisma.store.findUnique({
      where: { slug },
      select: {
        id: true,
        approvalStatus: true,
        deployment: { select: { status: true, publicIpv4: true } },
      },
    });
    if (
      store?.approvalStatus === "APPROVED" &&
      store.deployment &&
      store.deployment.publicIpv4
    ) {
      return NextResponse.json({ allow: true });
    }
    return NextResponse.json({ allow: false, reason: "unknown slug" }, { status: 404 });
  }

  // 2. Vendor custom domain — must be tied to an active+verified deployment.
  const store = await prisma.store.findUnique({
    where: { customDomain: domain },
    select: {
      id: true,
      approvalStatus: true,
      deployment: {
        select: {
          status: true,
          customDomainVerified: true,
          publicIpv4: true,
        },
      },
    },
  });

  if (
    store &&
    store.approvalStatus === "APPROVED" &&
    store.deployment?.customDomainVerified &&
    store.deployment.publicIpv4 &&
    store.deployment.status !== "ARCHIVED" &&
    store.deployment.status !== "SUSPENDED"
  ) {
    return NextResponse.json({ allow: true });
  }

  return NextResponse.json({ allow: false, reason: "domain not verified" }, { status: 404 });
}
