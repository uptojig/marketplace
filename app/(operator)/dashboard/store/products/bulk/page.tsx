import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BulkDigitalAdd } from "@/components/dashboard/bulk-digital-add";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";

export const dynamic = "force-dynamic";

/**
 * /dashboard/store/products/bulk — add many digital products at once.
 *
 * Server component gates auth + store ownership via the multi-store
 * resolver; the drag-drop UI + per-row editor is <BulkDigitalAdd />.
 * Each dropped file becomes one DIGITAL product with the file attached.
 */
export default async function BulkAddPage({
  searchParams,
}: {
  searchParams?: { storeSlug?: string };
}) {
  await resolveDashboardStore({ requestedSlug: searchParams?.storeSlug });

  const slugSuffix = searchParams?.storeSlug
    ? `?storeSlug=${encodeURIComponent(searchParams.storeSlug)}`
    : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/store/products${slugSuffix}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับ
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">เพิ่มสินค้าดิจิทัลทีละหลายรายการ</h1>
        <p className="text-sm text-muted-foreground">
          ลากไฟล์มาวางหลายไฟล์ — แต่ละไฟล์กลายเป็น 1 สินค้า ตั้งราคาแยกได้
        </p>
      </div>

      <BulkDigitalAdd
        storeSlug={searchParams?.storeSlug}
        redirectTo={`/dashboard/store/products${slugSuffix}`}
      />
    </div>
  );
}
