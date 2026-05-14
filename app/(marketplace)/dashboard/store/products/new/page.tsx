import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddProductTabs } from "@/components/dashboard/add-product-tabs";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";

export const dynamic = "force-dynamic";

/**
 * /dashboard/store/products/new — unified "add to catalog" page.
 *
 * Server component handles auth gating + ownership lookup via the
 * multi-store resolver; the tabbed UI (catalog browse / URL paste /
 * manual form) is the <AddProductTabs /> client component below.
 * Kept as a single entry point so the products-list "เพิ่มสินค้า" CTA
 * always lands here regardless of which path the operator wants to
 * use.
 */
export default async function NewProductPage({
  searchParams,
}: {
  searchParams?: { storeSlug?: string };
}) {
  // Auth + store resolution lives in resolveDashboardStore — this
  // page just needs to confirm the user has SOMEWHERE to add a
  // product to. We don't render the picked store name here so we
  // don't actually need the returned object beyond the side effects.
  await resolveDashboardStore({ requestedSlug: searchParams?.storeSlug });

  const slugSuffix = searchParams?.storeSlug
    ? `?storeSlug=${encodeURIComponent(searchParams.storeSlug)}`
    : "";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href={`/dashboard/store/products${slugSuffix}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับ
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">เพิ่มสินค้าใหม่</h1>
        <p className="text-sm text-muted-foreground">
          เลือกจากซัพพลายเออร์ — วาง URL — หรือกรอกเอง
        </p>
      </div>

      <AddProductTabs />
    </div>
  );
}
