import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  OperatorPageHeader,
  OperatorStatusBadge,
  OperatorCallout,
  Button,
} from "@/components/operator/operator-primitives";
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

  const supplierTone =
    product.supplier === "CJ" ? "info" : product.supplier === "ALIEXPRESS" ? "processing" : "neutral";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        กลับไปรายการสินค้า
      </Link>

      <OperatorPageHeader
        title="แก้ไขสินค้า"
        description={
          <span className="flex items-center gap-2">
            ร้าน: <span className="font-medium text-foreground">{product.store.name}</span>
            <OperatorStatusBadge tone={supplierTone}>{product.supplier}</OperatorStatusBadge>
          </span>
        }
        actions={
          <Button asChild variant="outline">
            <Link href={`/stores/${product.store.slug}/products/${product.id}`} target="_blank">
              ดูในร้าน
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

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

      <OperatorCallout tone="neutral">
        <p>
          External ID: <code>{product.externalProductId}</code>
        </p>
        <p>Imported: {product.createdAt.toLocaleString("th-TH")}</p>
      </OperatorCallout>
    </div>
  );
}
