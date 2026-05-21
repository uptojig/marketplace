/**
 * Per-store enrichment screen — alternative entrypoint to the inline
 * dialog on /admin/stores. Surfaces a richer breakdown of the product
 * data quality (translation / category / image counts) before the
 * operator triggers the LLM run.
 *
 * Both surfaces share the same `enrichStoreProducts` server action;
 * this one just offers a roomier UI and links back to the store edit
 * page.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStoreQualitySnapshot } from "@/lib/admin/enrich-products";
import { EnrichProductsButton } from "../../enrich-products-button";

export const dynamic = "force-dynamic";

export default async function StoreEnrichProductsPage({
  params,
}: {
  params: { id: string };
}) {
  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, slug: true },
  });
  if (!store) notFound();

  const snapshot = await getStoreQualitySnapshot(store.id);
  const allTranslated = snapshot.total > 0 && snapshot.translated === snapshot.total;
  const allCategorized = snapshot.total > 0 && snapshot.categorized === snapshot.total;
  const noLowImage = snapshot.lowImage === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/admin/stores/${store.id}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> กลับไปที่ {store.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">เติมข้อมูลสินค้า — {store.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ใช้ Claude (Haiku 4.5) แปลชื่อ + รายละเอียดเป็นไทย, จัด Category อัตโนมัติ
          และแจ้งสินค้าที่มีรูปน้อย
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="แปลภาษาไทยแล้ว"
          value={`${snapshot.translated}/${snapshot.total}`}
          done={allTranslated}
        />
        <Stat
          label="จัด Category แล้ว"
          value={`${snapshot.categorized}/${snapshot.total}`}
          done={allCategorized}
        />
        <Stat
          label="สินค้ารูปน้อย"
          value={`${snapshot.lowImage}`}
          done={noLowImage}
          warnIfNotDone
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium">วิธีทำงาน</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>เรียก Claude Haiku 4.5 พร้อม prompt caching เพื่อแปล title + description</li>
          <li>เลือก Category ที่มีอยู่หรือสร้างใหม่ (slug ไม่ซ้ำในร้าน)</li>
          <li>ทำงาน 5 รายการพร้อมกัน — ข้ามรายการที่มีข้อมูลครบแล้ว (idempotent)</li>
          <li>ไม่ดึงรูปเองอัตโนมัติ ผู้ดูแลตัดสินใจเอง</li>
        </ul>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/stores/${store.id}/products`}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted"
        >
          ดูสินค้าทั้งหมด
        </Link>
        <EnrichProductsButton storeId={store.id} storeName={store.name} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  done,
  warnIfNotDone,
}: {
  label: string;
  value: string;
  done: boolean;
  warnIfNotDone?: boolean;
}) {
  const cls = done
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : warnIfNotDone
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-amber-200 bg-amber-50 text-amber-700";
  return (
    <div className={`rounded-lg border p-4 ${cls}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
