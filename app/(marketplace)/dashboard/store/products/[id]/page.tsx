import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  ProductForm,
  type ProductFormValues,
  type VariantValues,
} from "@/components/dashboard/product-form";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { storeSlug?: string };
}) {
  // Multi-store resolution. The route still carries productId via
  // [id] — we preserve that flow and only change *which store* we
  // verify ownership against.
  const { store } = await resolveDashboardStore({
    requestedSlug: searchParams?.storeSlug,
  });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });

  // 404 (not 403) on cross-store access — same response shape whether
  // the product is missing or just isn't ours. Admins viewing another
  // store via the picker have already been resolved to that store
  // above, so the comparison still succeeds for the admin-edit case.
  if (!product || product.storeId !== store.id) notFound();

  const galleryUrls = Array.isArray(product.galleryUrls)
    ? (product.galleryUrls as string[]).filter(
        (u) => typeof u === "string" && u.length > 0,
      )
    : [];

  const variants: VariantValues[] = product.variants.map((v) => {
    const attrs = (v.attributes ?? {}) as Record<string, string>;
    return {
      externalVariantId: v.externalVariantId,
      size: attrs.Size ?? attrs.size ?? "",
      color: attrs.Color ?? attrs.color ?? "",
      priceTHB: Number(v.priceTHB),
      sku: v.sku ?? "",
      inventory: v.inventory ?? null,
      imageUrl: v.imageUrl ?? "",
    };
  });

  const defaultValues: ProductFormValues = {
    title: product.title,
    titleTh: product.titleTh ?? "",
    description: product.description ?? "",
    descriptionTh: product.descriptionTh ?? "",
    priceTHB: Number(product.priceTHB),
    compareAtPriceTHB: product.compareAtPriceTHB
      ? Number(product.compareAtPriceTHB)
      : null,
    imageUrl: product.imageUrl ?? "",
    galleryUrls,
    categoryName: product.categoryName ?? "",
    active: product.active,
    hasVariants: product.hasVariants,
    variants,
  };

  // Slug suffix to preserve the active-store selection across nav
  // links (back button + "ดูในหน้าร้าน" doesn't need it because
  // it points to the public storefront, but the back link does).
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
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="line-clamp-1 text-2xl font-semibold">
              {product.titleTh ?? product.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              แก้ไขข้อมูลสินค้า รูป ราคา และ variants
            </p>
          </div>
          <a
            href={`/stores/${store.slug}/products/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent"
          >
            ดูในหน้าร้าน
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        defaultValues={defaultValues}
      />
    </div>
  );
}
