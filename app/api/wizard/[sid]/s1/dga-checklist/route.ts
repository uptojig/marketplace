import { NextResponse } from "next/server";
import {
  buildChecklist,
  listImages,
} from "@/lib/kyc/dga-image-processor";
import { readyToFinalize } from "@/lib/kyc/dga-fields";
import { jsonError, requireWizardSession } from "@/lib/kyc/wizard-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// S1 v2 — poll endpoint for the wizard UI. Returns the current checklist
// (per-field state + value) and the list of uploaded images so the UI can
// re-render the thumbnail grid + ⬜/✅/⚠️ icons after a page reload.
//
// Read-only — no state changes. State must be S1_DGA_CAPTURE; if the
// session has already advanced (rare race), the response includes the
// current state so the client can redirect.

export async function GET(_req: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await requireWizardSession(params.sid);

    const [checklist, images] = await Promise.all([
      buildChecklist(params.sid),
      listImages(params.sid),
    ]);

    return NextResponse.json({
      ok: true,
      state: session.state,
      checklist,
      images,
      ready_to_finalize: readyToFinalize(checklist),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
