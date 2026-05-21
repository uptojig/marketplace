import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/signin?next=${encodeURIComponent("/agent/dashboard")}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, agentProfile: { select: { id: true } } },
  });

  if (!user || (!user.agentProfile && user.role !== "ADMIN")) {
    redirect("/agent/register");
  }

  return <>{children}</>;
}
