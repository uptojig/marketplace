import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evidenceWithPresignedUrls } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";

// Step ordering for display
const STEP_ORDER: Record<string, { order: number; label: string }> = {
  S1_ID_CARD_REF:        { order: 1, label: "บัตรประชาชน (ด้านหน้า)" },
  S1_DGA_CAPTURE:        { order: 2, label: "ข้อมูล DGA (ภาพจาก DBD)" },
  S2_SELFIE:             { order: 3, label: "รูปเซลฟี่ถือบัตร" },
  S2_ID_SELFIE:          { order: 3, label: "รูปเซลฟี่ถือบัตร" },
  S2_SELFIE_HELD_ID_CROP:{ order: 4, label: "Crop บัตรจากเซลฟี่" },
  S3_PHONE_RESPONSE:     { order: 5, label: "หน้าจอเบอร์โทรศัพท์" },
  S4_BANKBOOK:           { order: 6, label: "หน้าสมุดบัญชีธนาคาร" },
};

export async function GET(
  _req: Request,
  { params }: { params: { vendorId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    // Verify the caller is an Agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!agent) {
      return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 403 });
    }

    // Verify the vendor belongs to this agent
    const vendor = await prisma.user.findFirst({
      where: { id: params.vendorId, agentId: agent.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        dgaData: true,
        createdAt: true,
      },
    });
    if (!vendor) {
      return NextResponse.json(
        { ok: false, error: "vendor_not_found_or_not_yours" },
        { status: 404 },
      );
    }

    // Get the latest KYC session for this vendor
    const kycSession = await prisma.wizardSession.findFirst({
      where: { userId: params.vendorId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        state: true,
        createdAt: true,
        terminalAt: true,
        finalDecision: true,
      },
    });

    // Get evidence with presigned URLs if session exists
    let evidence: {
      id: string;
      step: string;
      label: string;
      order: number;
      mime: string;
      bytes: number;
      width: number | null;
      height: number | null;
      url: string;
      capturedAt: Date;
    }[] = [];

    if (kycSession) {
      const rawEvidence = await evidenceWithPresignedUrls(kycSession.id);
      evidence = rawEvidence
        .map((e) => ({
          id: e.id,
          step: e.step,
          label: STEP_ORDER[e.step]?.label ?? e.step,
          order: STEP_ORDER[e.step]?.order ?? 99,
          mime: e.mime,
          bytes: e.bytes,
          width: e.width,
          height: e.height,
          url: e.url,
          capturedAt: e.capturedAt,
        }))
        .sort((a, b) => a.order - b.order || a.capturedAt.getTime() - b.capturedAt.getTime());
    }

    return NextResponse.json({
      ok: true,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        role: vendor.role,
        dgaData: vendor.dgaData,
        createdAt: vendor.createdAt,
      },
      kycStatus: kycSession?.state ?? "NOT_STARTED",
      kycSessionId: kycSession?.id ?? null,
      kycFinalizedAt: kycSession?.terminalAt ?? null,
      evidence,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
