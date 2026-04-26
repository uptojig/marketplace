import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductEditForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      titleTh: true,
      description: true,
      descriptionTh: true,
      priceTHB: true,
      compareAtPriceTHB: true,
      imageUrl: true,
      categoryName: true,
      active: true,
      supplier: true,
      externalProductId: true,
      createdAt: true,
      store: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        กลับไปรายการสินค้า
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">แก้ไขสินค้า</h1>
          <p className="text-sm text-muted-foreground">
            ร้าน: <span className="font-medium">{product.store.name}</span> •{" "}
            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
              {product.supplier}
            </span>
          </p>
        </div>
        <Link
          href={`/stores/${product.store.slug}/products/${product.id}`}
          target="_blank"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent"
        >
          ดูในร้าน
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ProductEditForm
        productId={product.id}
        defaultValues={{
          title: product.title,
          titleTh: product.titleTh ?? "",
          description: product.description ?? "",
          descriptionTh: product.descriptionTh ?? "",
          priceTHB: Number(product.priceTHB),
          compareAtPriceTHB: product.compareAtPriceTHB
            ? Number(product.compareAtPriceTHB)
            : null,
          imageUrl: product.imageUrl ?? "",
          categoryName: product.categoryName ?? "",
          active: product.active,
        }}
      />

      <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-muted-foreground">
        <p>External ID: <code>{product.externalProductId}</code></p>
        <p>Imported: {product.createdAt.toLocaleString("th-TH")}</p>
      </div>
    </div>
  );
}
