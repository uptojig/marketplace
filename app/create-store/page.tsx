import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Wizard } from "./_components/wizard";
import { createStoreAndRedirect } from "./actions";

export const metadata = {
  title: "สร้างร้านค้า · Basketplace",
};

export default async function CreateStorePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/create-store");
  }

  // Defend against stale JWTs whose userId no longer maps to a User row
  // (post-migration leftover). Without this guard, the existing-store
  // lookup below succeeds with `null`, the wizard loads, and we explode
  // with a Store_ownerId_fkey FK violation on submit.
  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!owner) {
    redirect("/api/auth/signout?callbackUrl=/signin?callbackUrl=/create-store");
  }

  const existing = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { slug: true, name: true },
  });
  if (existing) {
    // Vendors (1 user = 1 store) just go back to their dashboard.
    // Admins managing the platform have a separate flow at /admin/stores/new
    // that creates a fresh emailless owner per store — surface that path
    // instead of bouncing them silently.
    if (owner.role === "ADMIN") {
      return (
        <div className="mx-auto max-w-md space-y-4 py-12 text-center">
          <h1 className="text-2xl font-semibold">มีร้านของคุณอยู่แล้ว</h1>
          <p className="text-sm text-muted-foreground">
            ร้าน <strong>{existing.name}</strong> ผูกกับบัญชีนี้ —
            แต่ละ user สร้างได้ 1 ร้าน. ในฐานะ Admin
            คุณสามารถสร้างร้านเพิ่มได้ผ่านเมนู Admin → สร้างร้านใหม่.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={`/dashboard?store=${existing.slug}`}
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              ไปที่ร้านของฉัน
            </Link>
            <Link
              href="/admin/stores/new"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              สร้างร้านใหม่ (Admin)
            </Link>
          </div>
        </div>
      );
    }
    redirect(`/dashboard?store=${existing.slug}`);
  }

  return <Wizard onSubmit={createStoreAndRedirect} />;
}
