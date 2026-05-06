import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    redirect("/signin?next=/dashboard/store/products/new");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });
  if (!user?.store) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
          กรอกข้อมูลเอง หรือเริ่มจากลิงก์ supplier ก็ได้
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
