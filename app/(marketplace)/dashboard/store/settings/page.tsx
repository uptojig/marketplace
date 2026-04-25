import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });

  if (!user?.store) redirect("/onboarding");

  const { store } = user;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ตั้งค่าร้าน</h1>
        <p className="text-sm text-muted-foreground">
          แก้ไข logo, banner, สี และข้อมูลร้านของคุณ
        </p>
      </div>

      <StoreSettingsForm
        defaultValues={{
          name: store.name,
          slug: store.slug,
          description: store.description ?? "",
          tagline: store.tagline ?? "",
          logoUrl: store.logoUrl ?? "",
          bannerUrl: store.bannerUrl ?? "",
          primaryColor: store.primaryColor ?? "#2563eb",
          customDomain: store.customDomain ?? "",
        }}
      />
    </div>
  );
}
