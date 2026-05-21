import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Supplier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import {
  OperatorPageHeader,
  OperatorTable,
  OperatorFilterChips,
  OperatorStatusBadge,
  OperatorEmptyState,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type StatusTone,
} from "@/components/operator/operator-primitives";
import { EnrichButton } from "./enrich-button";

export const dynamic = "force-dynamic";

const SUPPLIER_TONE: Record<string, StatusTone> = {
  CJ: "info",
  ALIEXPRESS: "processing",
  MOCK: "neutral",
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
      <OperatorPageHeader
        title="สินค้าทั้งหมด"
        description={`${products.length} แสดง (จำกัด 100 ล่าสุด)`}
        actions={<EnrichButton />}
      />

      <OperatorFilterChips
        items={[
          {
            label: `ทั้งหมด (${supplierCounts.reduce((s, x) => s + x._count._all, 0)})`,
            href: "/admin/products",
            active: !supplier,
          },
          ...supplierCounts.map((sc) => ({
            label: `${sc.supplier} (${sc._count._all})`,
            href: `/admin/products?supplier=${sc.supplier}`,
            active: supplier === sc.supplier,
          })),
        ]}
      />

      <form className="flex gap-2">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="ค้นหาชื่อสินค้าหรือหมวดหมู่..."
          className="flex-1"
        />
        {supplier && <input type="hidden" name="supplier" value={supplier} />}
        <Button type="submit" variant="outline">
          ค้นหา
        </Button>
      </form>

      {products.length === 0 ? (
        <OperatorTable>
          <OperatorEmptyState title="ไม่พบสินค้า" description="ลองปรับคำค้นหรือตัวกรอง supplier" />
        </OperatorTable>
      ) : (
        <OperatorTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สินค้า</TableHead>
                <TableHead>ร้าน</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">ราคา</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                      <p className="line-clamp-2 max-w-md text-xs">{p.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{p.store.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.categoryName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <OperatorStatusBadge tone={SUPPLIER_TONE[p.supplier] ?? "neutral"}>
                      {p.supplier}
                    </OperatorStatusBadge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatTHB(Number(p.priceTHB))}
                  </TableCell>
                  <TableCell>
                    <OperatorStatusBadge tone={p.active ? "success" : "neutral"}>
                      {p.active ? "Active" : "Inactive"}
                    </OperatorStatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        แก้ไข
                      </Link>
                      <Link
                        href={`/stores/${p.store.slug}/products/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                      >
                        ดู <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </OperatorTable>
      )}
    </div>
  );
}
