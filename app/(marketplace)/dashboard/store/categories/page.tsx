import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/dashboard/categories-manager";

export const dynamic = "force-dynamic";

export default async function StoreCategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/signin?next=/dashboard/store/categories");
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });
  if (!user?.store) redirect("/");

  const [categoryRows, productRows] = await Promise.all([
    prisma.category.findMany({
      where: { storeId: user.store.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { storeId: user.store.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        titleTh: true,
        imageUrl: true,
        priceTHB: true,
        active: true,
        categoryId: true,
        categoryName: true,
      },
    }),
  ]);

  const categories = categoryRows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    bannerUrl: c.bannerUrl ?? "",
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }));

  const products = productRows.map((p) => ({
    id: p.id,
    title: p.titleTh ?? p.title,
    imageUrl: p.imageUrl ?? null,
    priceTHB: Number(p.priceTHB),
    active: p.active,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
  }));

  return (
    <CategoriesManager
      storeSlug={user.store.slug}
      categories={categories}
      products={products}
    />
  );
}
