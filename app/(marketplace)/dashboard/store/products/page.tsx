import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { TranslateTitlesButton } from "@/components/dashboard/translate-titles-button";

export const dynamic = "force-dynamic";

export default async function StoreProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin?next=/dashboard/store/products");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });
  // No self-service store creation anymore — /onboarding was removed.
  // A signed-in user without a store has nothing to manage here, so
  // bump them back to the homepage. Admin can provision stores via
  // /admin/stores/new and assign ownership.
  if (!user?.store) redirect("/");

  const products = await prisma.product.findMany({
    where: { storeId: user.store.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { variants: true } },
    },
  });

  // Drives the "แปลชื่อ TH" button label so the operator sees how
  // many rows still fall back to English on category/PDP/search.
  // Skips inactive products — those won't render publicly anyway.
  const untranslatedCount = await prisma.product.count({
    where: { storeId: user.store.id, active: true, titleTh: null },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">สินค้าของร้าน</h1>
          <p className="text-sm text-muted-foreground">
            จัดการสินค้าทั้งหมด — เพิ่ม / แก้ไข / ตั้งราคา / variants
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-2">
          <TranslateTitlesButton untranslatedCount={untranslatedCount} />
          <a
            href={`/stores/${user.store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent"
          >
            ดูหน้าร้าน
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            href="/dashboard/store/products/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มสินค้า
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed bg-gray-50 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-gray-700">
            ยังไม่มีสินค้าในร้าน
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เริ่มต้นเพิ่มสินค้าเข้าร้านได้ในหน้าเดียว
          </p>
          <Link
            href="/dashboard/store/products/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มสินค้าแรก
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">สินค้า</th>
                <th className="px-4 py-3 text-right">ราคา</th>
                <th className="px-4 py-3 text-center">Variants</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/store/products/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {p.imageUrl && (
                          <Image
                            src={p.imageUrl}
                            alt={p.titleTh ?? p.title}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-gray-900">
                          {p.titleTh ?? p.title}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {p.categoryName ?? "—"}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold">
                      {formatTHB(Number(p.priceTHB))}
                    </span>
                    {p.compareAtPriceTHB && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        {formatTHB(Number(p.compareAtPriceTHB))}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p._count.variants > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {p._count.variants}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/store/products/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
                    >
                      <Pencil className="h-3 w-3" />
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
