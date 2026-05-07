import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddProductTabs } from "@/components/dashboard/add-product-tabs";

export const dynamic = "force-dynamic";

/**
 * /dashboard/store/products/new — unified "add to catalog" page.
 *
 * Server component handles auth gating + ownership lookup; the
 * tabbed UI (catalog browse / URL paste / manual form) is the
 * <AddProductTabs /> client component below. Kept as a single
 * entry point so the products-list "เพิ่มสินค้า" CTA always lands
 * here regardless of which path the operator wants to use.
 */
export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    redirect("/signin?next=/dashboard/store/products/new");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });
  if (!user?.store) redirect("/");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/dashboard/store/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับ
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">เพิ่มสินค้าใหม่</h1>
        <p className="text-sm text-muted-foreground">
          เลือกจากซัพพลายเออร์ — วาง URL — หรือกรอกเอง
        </p>
      </div>

      <AddProductTabs />
    </div>
  );
}
