import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminAgentsClient } from "./agents-client";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!me || me.role !== "ADMIN") redirect("/");

  // Fetch all agents
  const agents = await prisma.agent.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          vendors: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch candidate users for agent nomination (role !== ADMIN and no existing Agent record)
  const candidateUsers = await prisma.user.findMany({
    where: {
      agentProfile: null,
      role: { not: "ADMIN" },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { email: "asc" },
    take: 100, // Limit to recent 100 eligible candidates
  });

  // Map to client-serializable format
  const initialAgents = agents.map((a) => ({
    id: a.id,
    displayName: a.displayName,
    linkCode: a.linkCode,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    owner: {
      id: a.userId,
      name: a.user.name,
      email: a.user.email,
      createdAt: a.user.createdAt.toISOString(),
    },
    vendorCount: a._count.vendors,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <AdminAgentsClient
        initialAgents={initialAgents}
        candidateUsers={candidateUsers}
      />
    </div>
  );
}
