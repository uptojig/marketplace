import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Supplier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { EnrichButton } from "./enrich-button";

export const dynamic = "force-dynamic";

const SUPPLIER_BADGE: Record<string, string> = {
  CJ: "bg-orange-100 text-orange-700",
  ALIEXPRESS: "bg-pink-100 text-pink-700",
  MOCK: "bg-gray-100 text-gray-700",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; supplier?: string };
}) {
  const q = searchParams.q?.trim();
  const supplierParam = searchParams.supplier as Supplier | undefined;
  const supplier =
    supplierParam && Object.values(Supplier).includes(supplierParam)
      ? supplierParam
      : undefined;

  const products = await prisma.product.findMany({
    where: {
      ...(supplier ? { supplier } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { titleTh: { contains: q, mode: "insensitive" } },
              { categoryName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      priceTHB: true,
      imageUrl: true,
      supplier: true,
      categoryName: true,
      active: true,
      createdAt: true,
      store: { select: { name: true, slug: true } },
    },
  });

  const supplierCounts = await prisma.product.groupBy({
    by: ["supplier"],
    _count: { _all: true },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">สินค้าทั้งหมด</h1>
          <p className="text-sm text-muted-foreground">{products.length} แสดง (จำกัด 100 ล่าสุด)</p>
        </div>
        <EnrichButton />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <a
          href="/admin/products"
          className={`rounded-full border px-3 py-1 ${!supplier ? "border-black bg-black text-white" : "bg-white"}`}
        >
          ทั้งหมด ({supplierCounts.reduce((s, x) => s + x._count._all, 0)})
        </a>
        {supplierCounts.map((sc) => (
          <a
            key={sc.supplier}
            href={`/admin/products?supplier=${sc.supplier}`}
            className={`rounded-full border px-3 py-1 ${supplier === sc.supplier ? "border-black bg-black text-white" : "bg-white"}`}
          >
            {sc.supplier} ({sc._count._all})
          </a>
        ))}
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="ค้นหาชื่อสินค้าหรือหมวดหมู่..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        {supplier && <input type="hidden" name="supplier" value={supplier} />}
        <button
          type="submit"
          className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ค้นหา
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3">หมวดหมู่</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3 text-right">ราคา</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  ไม่พบสินค้า
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200" />
                      )}
                      <p className="line-clamp-2 max-w-md text-xs">{p.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{p.store.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.categoryName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${SUPPLIER_BADGE[p.supplier] ?? "bg-gray-100"}`}
                    >
                      {p.supplier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatTHB(Number(p.priceTHB))}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {p.active ? (
                      <span className="text-green-600">● Active</span>
                    ) : (
                      <span className="text-gray-400">○ Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        แก้ไข
                      </Link>
                      <Link
                        href={`/stores/${p.store.slug}/products/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:underline"
                      >
                        ดู <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
