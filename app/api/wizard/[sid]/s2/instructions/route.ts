import { NextResponse } from "next/server";
import { leaseOutlookCredential, OutlookPoolEmptyError } from "@/lib/kyc/outlook-credentials";
import { jsonError, latestExtractedIdentity, requireWizardSession } from "@/lib/kyc/wizard-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S2_DGA_INSTRUCTIONS") {
      return jsonError(`Expected S2_DGA_INSTRUCTIONS, got ${session.state}`, 409);
    }

    const idIdentity = await latestExtractedIdentity(params.sid, "iapp_id_front");
    const citizenId = idIdentity?.citizenId ?? session.citizenId ?? "";
    let outlook: Awaited<ReturnType<typeof leaseOutlookCredential>> | null = null;

    try {
      outlook = await leaseOutlookCredential(params.sid);
    } catch (error) {
      if (!(error instanceof OutlookPoolEmptyError)) throw error;
    }

    return NextResponse.json({
      ok: true,
      dga_login_url: "https://connect.egov.go.th/Account/Login",
      dga_profile_url: "https://connect.egov.go.th/Account/Profile",
      dga_telephone_url: "https://connect.egov.go.th/Account/Edit?Type=Telephone",
      prefill_address: idIdentity?.address?.full ?? "",
      system_email: outlook?.email ?? null,
      system_password: outlook?.passwordEncrypted ?? null,
      email_mode: outlook ? "pool" : "pending",
      ussd_code: citizenId ? `*179*${citizenId}#` : "",
      help: {
        thaid_button: "เข้าสู่ระบบด้วย ThaID",
        required_fields: ["ที่อยู่ติดต่อ", "เบอร์โทรศัพท์มือถือ", "อีเมล"],
        minimum_green_checks: 6,
        email_note: outlook
          ? "ใช้ email/password จากระบบด้านล่างไปกรอกใน DGA"
          : "ส่วน email ของระบบยังไม่พร้อมใน environment นี้ ให้ดำเนิน flow ทดสอบส่วน address, phone, DGA capture, USSD และ OCR ต่อได้ก่อน",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
