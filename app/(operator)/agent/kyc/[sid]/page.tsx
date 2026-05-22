import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KycWizard from "@/app/(marketplace)/apply/_components/kyc-wizard";
import { Button, OperatorPageHeader } from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

export default async function AgentKycSessionPage({
  params,
}: {
  params: { sid: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/signin?next=${encodeURIComponent(`/agent/kyc/${params.sid}`)}`);
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });
  if (!agent || agent.status !== "ACTIVE") {
    redirect("/agent/dashboard");
  }

  const kycSession = await prisma.wizardSession.findUnique({
    where: { id: params.sid },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, agentId: true } },
    },
  });

  const belongsToAgent = kycSession?.agentId === agent.id || kycSession?.user?.agentId === agent.id;
  if (!kycSession || !belongsToAgent) {
    redirect("/agent/dashboard");
  }

  const targetName =
    kycSession.user?.name ??
    (kycSession.metadata as { targetProfile?: { name?: string | null } } | null)?.targetProfile?.name ??
    "Prospective vendor";

  return (
    <div className="flex flex-col gap-6">
      <OperatorPageHeader
        title={`KYC Upload: ${targetName}`}
        description="Agent-assisted upload mode. Evidence and audit logs will record the agent as the submitter."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/agent/dashboard">Back to dashboard</Link>
          </Button>
        }
      />

      <KycWizard
        initialSessionId={params.sid}
        apiBasePath="/api/agents/me/kyc/sessions"
        terminalRedirectPath={null}
        autoRedirectOnApproved={false}
        credentialSuccessCtaHref="/agent/dashboard"
        credentialSuccessCtaLabel="กลับไปหน้า Agent Dashboard"
        credentialSuccessDescription="บัญชี Vendor ถูกสร้างแล้ว ส่งเบอร์โทรและรหัสผ่านชั่วคราวนี้ให้ Vendor อย่างปลอดภัยเพื่อเข้าใช้งานครั้งแรก"
      />
    </div>
  );
}
