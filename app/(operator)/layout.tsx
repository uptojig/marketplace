import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { OperatorThemeBody } from "@/components/operator/operator-theme-body";

export const dynamic = "force-dynamic";

export default async function OperatorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getCurrentUser is React.cache-memoized, so this lookup is shared with the
  // child layout (e.g. admin) within the same request — no double query.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="theme-operator min-h-screen w-full bg-background text-foreground font-sans antialiased">
      <OperatorThemeBody />
      {children}
    </div>
  );
}
