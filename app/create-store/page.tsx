import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasApprovedKyc } from "@/lib/kyc/wizard-state";
import { Wizard } from "./_components/wizard";
import { createStoreAndRedirect } from "./actions";

export const metadata = {
  title: "สร้างร้านค้า · Basketplace",
};

export default async function CreateStorePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/create-store");
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
    redirect("/signout");
  }

  // Vendors are 1:1 with stores — if they already have one, send them home.
  // Admins can run the wizard repeatedly; each extra store gets attached to a
  // fresh emailless User inside the action (Postgres treats NULL emails as
  // distinct, so Store.ownerId @unique still holds).
  if (owner.role !== "ADMIN") {
    const existing = await prisma.store.findUnique({
      where: { ownerId: session.user.id },
      select: { slug: true },
    });
    if (existing) redirect(`/dashboard?storeSlug=${existing.slug}`);

    const approved = await hasApprovedKyc(session.user.id);
    if (!approved) {
      redirect("/apply");
    }
  }

  return <Wizard onSubmit={createStoreAndRedirect} />;
}
