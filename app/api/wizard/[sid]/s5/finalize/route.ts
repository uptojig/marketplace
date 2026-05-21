import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireWizardSession } from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S5_SUMMARY") {
      return jsonError(`Expected S5_SUMMARY, got ${session.state}`, 409);
    }

    const meta =
      session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
        ? (session.metadata as Record<string, unknown>)
        : {};

    const pendingDecision = (meta.pendingDecision as string) || "MANUAL_REVIEW";
    if (!["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED"].includes(pendingDecision)) {
      return jsonError(`Invalid pending decision: ${pendingDecision}`, 400);
    }

    // Retrieve DGA fields to get user details
    const dgaFields = await prisma.wizardDgaField.findMany({
      where: { sessionId: params.sid },
    });

    const getVal = (key: string) => dgaFields.find((f) => f.fieldKey === key)?.value || null;

    const firstName = getVal("firstName");
    const lastName = getVal("lastName");
    const citizenIdRaw = getVal("citizenId");
    const mobilePhoneRaw = getVal("mobilePhone");
    const phoneRaw = getVal("phone");
    const emailRaw = getVal("email");

    const citizenId = citizenIdRaw ? citizenIdRaw.replace(/\D+/g, "") : null;
    const rawPhoneVal = mobilePhoneRaw || phoneRaw;
    const phone = rawPhoneVal ? rawPhoneVal.replace(/\D+/g, "") : null;
    const email = emailRaw ? emailRaw.trim().toLowerCase() : null;
    const name = [firstName, lastName].filter(Boolean).join(" ");

    // Build dgaData object from all DGA fields for permanent storage on User
    const dgaData: Record<string, string> = {};
    for (const f of dgaFields) {
      dgaData[f.fieldKey] = f.value;
    }

    // Check unique constraints and perform updates within a transaction
    const { finalState, tempPassword } = await prisma.$transaction(async (tx) => {
      // Check if phone unique constraint violation
      if (phone) {
        const existingPhoneUser = await tx.user.findFirst({
          where: { phone, id: session.userId ? { not: session.userId } : undefined },
        });
        if (existingPhoneUser) {
          throw new Error("PHONE_EXISTS");
        }
      }

      // Check email uniqueness if email exists
      if (email) {
        const existingEmailUser = await tx.user.findFirst({
          where: { email, id: session.userId ? { not: session.userId } : undefined },
        });
        if (existingEmailUser) {
          throw new Error("EMAIL_EXISTS");
        }
      }

      let activeUserId = session.userId;
      let tempPasswordVal: string | undefined = undefined;

      if (!activeUserId && ["AUTO_APPROVED", "MANUAL_REVIEW"].includes(pendingDecision)) {
        if (!phone || !citizenId) {
          throw new Error("MISSING_PHONE_OR_CITIZEN_ID");
        }

        // Use the last 6 digits of the citizen ID as the temporary password
        tempPasswordVal = citizenId.slice(-6);
        const passwordHash = await bcrypt.hash(tempPasswordVal, 12);

        // H3: isVerified should only be true if AUTO_APPROVED, not MANUAL_REVIEW!
        const isVerified = pendingDecision === "AUTO_APPROVED";

        // Create new user for anonymous session
        const newUser = await tx.user.create({
          data: {
            name: name || "ผู้สมัครเปิดร้านค้า",
            email,
            phone,
            role: "VENDOR",
            agentId: session.agentId,
            passwordHash,
            isVerified,
            dgaData,
          },
        });

        activeUserId = newUser.id;

        // Update session's userId to point to the newly created user
        await tx.wizardSession.update({
          where: { id: params.sid },
          data: { userId: newUser.id },
        });
      }

      // Perform final transition
      const updated = await transitionWizardSession({
        sessionId: params.sid,
        toState: pendingDecision as "AUTO_APPROVED" | "MANUAL_REVIEW" | "REJECTED",
        actor: "system",
        event: "s5.summary.finalized",
        payload: {
          finalDecision: pendingDecision,
        },
      }, tx);
      const finalStateVal = updated.state;

      // Update user profile role, agentId, and dgaData if user was already bound or logged in
      if (activeUserId && ["AUTO_APPROVED", "MANUAL_REVIEW"].includes(pendingDecision)) {
        const isVerified = pendingDecision === "AUTO_APPROVED";
        await tx.user.update({
          where: { id: activeUserId },
          data: {
            role: "VENDOR",
            dgaData,
            ...(session.agentId ? { agentId: session.agentId } : {}),
            ...(isVerified ? { isVerified: true } : {}),
          },
        });
      }

      return { finalState: finalStateVal, tempPassword: tempPasswordVal };
    });

    // Get Agent referral code to return
    let refCode = "";
    if (session.agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: session.agentId },
        select: { linkCode: true },
      });
      refCode = agent?.linkCode || "";
    } else if (meta.agentLinkCode) {
      refCode = String(meta.agentLinkCode);
    }

    return NextResponse.json({
      ok: true,
      state: finalState,
      phone: phone || undefined,
      refCode: refCode || undefined,
      tempPassword,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "PHONE_EXISTS") {
      return jsonError("เบอร์โทรศัพท์มือถือนี้ลงทะเบียนในระบบแล้วโดยผู้ใช้อื่น กรุณาใช้เบอร์โทรอื่น", 400);
    }
    if (message === "EMAIL_EXISTS") {
      return jsonError("อีเมลนี้ถูกใช้งานแล้วในระบบโดยผู้ใช้อื่น กรุณาใช้อีเมลอื่น", 400);
    }
    if (message === "MISSING_PHONE_OR_CITIZEN_ID") {
      return jsonError("ไม่พบข้อมูลเบอร์โทรศัพท์หรือเลขบัตรประชาชนจากข้อมูล DGA เพื่อใช้สร้างบัญชีร้านค้า", 400);
    }

    if (process.env.NODE_ENV === "production") {
      return jsonError("เกิดข้อผิดพลาดในการประมวลผลข้อมูลของท่าน กรุณาลองใหม่อีกครั้ง", 500);
    }
    return jsonError(message, 500);
  }
}
