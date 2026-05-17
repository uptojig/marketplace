import { NextResponse } from "next/server";
import { compareIdentities } from "@/lib/kyc/identity-match";
import {
  DGA_PROVIDER,
  jsonError,
  latestExtractedIdentity,
  replaceMatchResults,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ID_VS_DGA_MATCH_TYPES: Record<string, string> = {
  citizenId: "id_vs_dga_cid",
  name: "id_vs_dga_name",
  address: "id_vs_dga_address",
  dob: "id_vs_dga_dob",
};

const USSD_VS_DGA_MATCH_TYPES: Record<string, string> = {
  citizenId: "ussd_vs_dga_cid",
  phoneLast4: "ussd_phone_last4",
};

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S5_CROSS_MATCH") return jsonError(`Expected S5_CROSS_MATCH, got ${session.state}`, 409);

    const idCard = await latestExtractedIdentity(params.sid, "iapp_id_front");
    const dga = await latestExtractedIdentity(params.sid, DGA_PROVIDER);
    const ussd = await latestExtractedIdentity(params.sid, "typhoon_ussd");
    if (!idCard || !dga || !ussd) return jsonError("Missing OCR identities for cross-match", 409);

    const idMatches = compareIdentities(idCard, dga, ["citizenId", "name", "address", "dob"], {
      leftSource: "id_card_front",
      rightSource: "dga_golden",
    }).map((item) => ({ ...item, matchType: ID_VS_DGA_MATCH_TYPES[item.matchType] ?? item.matchType }));

    const ussdMatches = compareIdentities(ussd, dga, ["citizenId", "phoneLast4"], {
      leftSource: "ussd",
      rightSource: "dga_golden",
    }).map((item) => ({ ...item, matchType: USSD_VS_DGA_MATCH_TYPES[item.matchType] ?? item.matchType }));

    const matches = await replaceMatchResults(params.sid, [...idMatches, ...ussdMatches]);
    const allPassed = matches.every((match) => match.matched);
    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: allPassed ? "S6_BANKBOOK_UPLOAD" : "MANUAL_REVIEW",
      actor: "system",
      event: "s5.cross_match",
      payload: {
        allPassed,
        failed: matches.filter((match) => !match.matched).map((match) => match.matchType),
      },
    });

    return NextResponse.json({
      ok: true,
      state: updated.state,
      matches,
      all_passed: allPassed,
      manual_review_needed: !allPassed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
