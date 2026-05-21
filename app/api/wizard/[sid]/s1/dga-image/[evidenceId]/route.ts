import { NextResponse } from "next/server";
import {
  buildChecklist,
  listImages,
  removeImage,
} from "@/lib/kyc/dga-image-processor";
import { readyToFinalize } from "@/lib/kyc/dga-fields";
import { jsonError, requireWizardSession } from "@/lib/kyc/wizard-api";
import { transitionWizardSession, invalidateWizardSteps } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// S1 v2 — remove one uploaded image. The DB foreign key cascade strips
// the dga_fields rows that image contributed; rows from OTHER images stay.
// The frontend should call this when the user clicks "ลบ" on a thumbnail.

export async function DELETE(
  _req: Request,
  { params }: { params: { sid: string; evidenceId: string } },
) {
  try {
    const session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = [
      "S1_DGA_CAPTURE",
      "S1_DGA_REVIEW",
      "S2_ID_SELFIE",
      "S3_PHONE_RESPONSE",
      "S4_BANKBOOK_UPLOAD",
      "S5_SUMMARY",
    ];
    if (!ACTIVE_FLOW_STATES.includes(session.state)) {
      return jsonError(`Expected active wizard session, got ${session.state}`, 409);
    }

    if (session.state !== "S1_DGA_CAPTURE") {
      await transitionWizardSession({
        sessionId: params.sid,
        toState: "S1_DGA_CAPTURE",
        actor: "vendor",
        event: "s1.dga.screenshot_deleted",
        payload: { priorState: session.state },
      });
      await invalidateWizardSteps(params.sid, "S1_DGA_REVIEW");
    }

    await removeImage({ sessionId: params.sid, evidenceId: params.evidenceId });

    const [checklist, images] = await Promise.all([
      buildChecklist(params.sid),
      listImages(params.sid),
    ]);

    return NextResponse.json({
      ok: true,
      checklist,
      images,
      ready_to_finalize: readyToFinalize(checklist),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("not found") ? 404 : 500;
    return jsonError(message, status);
  }
}
