/**
 * /admin/stores/[id]/products/new — admin tabbed "Add Product" page.
 *
 * Mirrors the owner-side /dashboard/store/products/new but operates
 * on a specific store the admin chose, regardless of who owns it.
 * Manual-form tab is hidden — /api/store/products POST is owner-only;
 * the catalog browse + URL paste tabs are sufficient for the
 * admin-curates-on-behalf-of-vendor workflow we need today.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddProductTabs } from "@/components/dashboard/add-product-tabs";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export default async function AdminAddProductPage({
  params,
}: {
  params: { id: string };
}) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect(`/signin?next=/admin/stores/${params.id}/products/new`);
  }

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, name: true },
  });
  if (!store) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href={`/admin/stores/${store.id}/products`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> สินค้าของ {store.name}
        </Link>
        <div className="mt-2">
          <h1 className="text-2xl font-bold">เพิ่มสินค้าเข้าร้าน {store.name}</h1>
          <p className="text-sm text-muted-foreground">
            เลือกจาก catalog ของ supplier — หรือวาง URL หลายอันพร้อมกัน
          </p>
        </div>
      </div>

      <AddProductTabs
        storeIdOverride={store.id}
        hideManualTab
        redirectTo={`/admin/stores/${store.id}/products`}
      />
    </div>
  );
}
