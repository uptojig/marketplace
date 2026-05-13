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
    select: { id: true },
  });
  if (!owner) {
    redirect("/api/auth/signout?callbackUrl=/signin?callbackUrl=/create-store");
  }

  const existing = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { slug: true, name: true },
  });
  if (existing) {
    redirect(`/dashboard?store=${existing.slug}`);
  }

  return <Wizard onSubmit={createStoreAndRedirect} />;
}
