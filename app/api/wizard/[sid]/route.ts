import { NextResponse } from "next/server";
import { getWizardSnapshot } from "@/lib/kyc/wizard-state";
import { prisma } from "@/lib/prisma";
import { validateThaiIdChecksum } from "@/lib/kyc/thai-id-validator";
import { evidenceWithPresignedUrls } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatCitizenIdWithDashes(digits: string | null | undefined): string | null {
  if (!digits) return null;
  const d = digits.replace(/\D/g, "");
  if (d.length !== 13) return d || null;
  return `${d[0]}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10, 12)}-${d[12]}`;
}

export async function GET(_req: Request, { params }: { params: { sid: string } }) {
  const snapshot = await getWizardSnapshot(params.sid);
  if (!snapshot) {
    return NextResponse.json({ ok: false, error: "Wizard session not found" }, { status: 404 });
  }

  // Fetch pre-signed URLs for all evidence files
  const presignedEvidence = await evidenceWithPresignedUrls(params.sid).catch(() => []);

  // If in review state, fetch reference OCR for frontend display
  let identity: any = null;
  if (snapshot.state === "S1_ID_CARD_REVIEW") {
    // Latest reference OCR: re-uploads create new rows (saveOcrResult uses
    // create, not upsert), so without an explicit order findFirst returns a
    // non-deterministic row — which made the review screen flicker between the
    // correct read and a stale "อ่านไม่ออก" one.
    const ocr = await prisma.wizardOcrResult.findFirst({
      where: { sessionId: params.sid, provider: "iapp_id_ref" },
      orderBy: { createdAt: "desc" },
    });
    if (ocr && ocr.extracted && typeof ocr.extracted === "object") {
      const extracted = ocr.extracted as any;
      const raw = ocr.rawResponse as any;
      const checksumValid = extracted.citizenId
        ? validateThaiIdChecksum(extracted.citizenId)
        : false;
      const expiryDate = raw?.en_expire ? new Date(raw.en_expire) : null;
      const expired = expiryDate ? expiryDate.getTime() < Date.now() : false;

      identity = {
        firstName: extracted.thName?.first ?? null,
        lastName: extracted.thName?.last ?? null,
        fullName: extracted.thName?.full ?? extracted.enName?.full ?? null,
        citizenId: extracted.citizenId ?? null,
        citizenIdFormatted: formatCitizenIdWithDashes(extracted.citizenId),
        checksumValid,
        dob: extracted.dob ?? null,
        dobThai: raw?.th_dob ?? null,
        expiry: raw?.en_expire ?? null,
        expiryThai: raw?.th_expire ?? null,
        expired,
      };
    }
  }

  return NextResponse.json({
    ok: true,
    ...snapshot,
    evidence: presignedEvidence,
    identity,
  });
}
