import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/domain-ips
 *
 * Returns the configured domain-to-IP mappings.
 * Used by admin dashboard to show dedicated IP assignments.
 */
export async function GET() {
  // In production, these mappings come from env or a config file.
  // For now, we derive from stores with custom domains.
  try {
    const stores = await prisma.store.findMany({
      where: { customDomain: { not: null } },
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
      },
    });

    // Parse domain registry from env if available
    const registryJson = process.env.DOMAIN_IP_REGISTRY;
    let registry: Array<{
      domain: string;
      dedicatedIp: string;
      active: boolean;
    }> = [];

    if (registryJson) {
      try {
        registry = JSON.parse(registryJson);
      } catch {
        // ignore parse errors
      }
    }

    // Merge store data with IP registry
    const domains = stores.map((s) => {
      const reg = registry.find((r) => r.domain === s.customDomain);
      return {
        storeId: s.id,
        storeName: s.name,
        slug: s.slug,
        domain: s.customDomain,
        dedicatedIp: reg?.dedicatedIp ?? "Not assigned",
        active: reg?.active ?? true,
        webhookUrls: {
          quickpay: `https://${s.customDomain}/api/webhook/quickpay`,
          anypay: `https://${s.customDomain}/api/webhook/anypay`,
        },
      };
    });

    return NextResponse.json({
      ok: true,
      count: domains.length,
      domains,
      // Also include registry entries without stores
      unlinkedDomains: registry
        .filter((r) => !stores.find((s) => s.customDomain === r.domain))
        .map((r) => ({
          domain: r.domain,
          dedicatedIp: r.dedicatedIp,
          active: r.active,
          linkedStore: null,
        })),
    });
  } catch (err) {
    console.error("[admin/domain-ips]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
