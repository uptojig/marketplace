"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin?callbackUrl=/admin/kyc");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}

export async function approveKycSession(formData: FormData) {
  const admin = await requireAdmin();
  const sid = String(formData.get("sid") ?? "");
  if (!sid) throw new Error("Missing session id");

  await transitionWizardSession({
    sessionId: sid,
    toState: "AUTO_APPROVED",
    actor: "system",
    event: "admin.approve",
    payload: { adminId: admin.id },
  });

  revalidatePath("/admin/kyc");
  revalidatePath(`/admin/kyc/${sid}`);
}

export async function rejectKycSession(formData: FormData) {
  const admin = await requireAdmin();
  const sid = String(formData.get("sid") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!sid) throw new Error("Missing session id");
  if (!reason) throw new Error("Reason required");

  await transitionWizardSession({
    sessionId: sid,
    toState: "REJECTED",
    actor: "system",
    event: "admin.reject",
    payload: { adminId: admin.id, reason },
  });

  revalidatePath("/admin/kyc");
  revalidatePath(`/admin/kyc/${sid}`);
}
