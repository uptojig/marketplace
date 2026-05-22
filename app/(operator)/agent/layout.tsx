import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OperatorShell } from "@/components/operator/operator-shell";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const NAV = [
  {
    href: "/agent/dashboard",
    label: "Overview",
    icon: "LayoutDashboard",
    group: "Agent Workspace",
    exact: true,
  },
  {
    href: "/agent/dashboard#agent-assisted-kyc",
    label: "Agent-assisted KYC",
    icon: "ShieldCheck",
    group: "Agent Workspace",
  },
];

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
    select: {
      role: true,
      name: true,
      email: true,
      agentProfile: { select: { id: true } },
    },
  });

  // Agent accounts are provisioned by admins only; non-agents are bounced.
  if (!user || (!user.agentProfile && user.role !== "ADMIN")) {
    redirect("/");
  }

  return (
    <OperatorShell
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role as "ADMIN" | "VENDOR" | "AGENT",
      }}
      navigation={NAV}
      topbarActions={
        user.role === "ADMIN" ? (
          <Badge variant="outline">Viewing Agent Console</Badge>
        ) : null
      }
      brandTitle="Basketplace"
      brandSubtitle="Agent Console"
    >
      {children}
    </OperatorShell>
  );
}
