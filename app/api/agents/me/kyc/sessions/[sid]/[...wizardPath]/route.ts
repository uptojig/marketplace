import { NextResponse } from "next/server";
import { GET as getDgaChecklist } from "@/app/api/wizard/[sid]/s1/dga-checklist/route";
import { GET as getResult } from "@/app/api/wizard/[sid]/result/route";
import { POST as postIdCardRef } from "@/app/api/wizard/[sid]/s1/id-card-ref/route";
import { POST as postIdCardConfirm } from "@/app/api/wizard/[sid]/s1/id-card-ref/confirm/route";
import { POST as postIdCardRetake } from "@/app/api/wizard/[sid]/s1/id-card-ref/retake/route";
import { POST as postEmailRequest } from "@/app/api/wizard/[sid]/s2/email-request/route";
import { POST as postFetchOtp } from "@/app/api/wizard/[sid]/s3/fetch-otp/route";
import { POST as postConfirmOtp } from "@/app/api/wizard/[sid]/s3/confirm/route";
import { POST as postSkipEmail } from "@/app/api/wizard/[sid]/s2/skip-email/route";
import { POST as postDgaAddImage } from "@/app/api/wizard/[sid]/s1/dga-add-image/route";
import { POST as postDgaFinalize } from "@/app/api/wizard/[sid]/s1/dga-finalize/route";
import { POST as postDgaReviewConfirm } from "@/app/api/wizard/[sid]/s1/dga-review-confirm/route";
import { POST as postDgaReviewBack } from "@/app/api/wizard/[sid]/s1/dga-review-back/route";
import { PATCH as patchDgaReviewField } from "@/app/api/wizard/[sid]/s1/dga-review/[fieldKey]/route";
import { DELETE as deleteDgaImage } from "@/app/api/wizard/[sid]/s1/dga-image/[evidenceId]/route";
import { POST as postIdCardSelfie } from "@/app/api/wizard/[sid]/s1/id-card/route";
import { POST as postPhoneResponse } from "@/app/api/wizard/[sid]/s4/ussd/route";
import { POST as postBankbook } from "@/app/api/wizard/[sid]/s6/bankbook/route";
import { POST as postFinalize } from "@/app/api/wizard/[sid]/s5/finalize/route";
import {
  agentAccessErrorResponse,
  agentActor,
  requireActiveAgent,
  requireAgentKycSession,
} from "@/lib/agents/kyc-access";
import { runWithKycActor } from "@/lib/kyc/actor-context";
import { extendWizardSession } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: { sid: string; wizardPath: string[] } };
type Handler = (req: Request, ctx: any) => Response | Promise<Response>;

function pathKey(parts: string[]) {
  return parts.join("/");
}

function jsonNotFound(path: string) {
  return NextResponse.json(
    { ok: false, error: "agent_kyc_route_not_found", path },
    { status: 404 },
  );
}

async function runAgentWizardRoute(
  req: Request,
  params: Params["params"],
  resolve: (key: string) => { handler: Handler; ctx: any } | null,
) {
  try {
    const { agent } = await requireActiveAgent();
    const session = await requireAgentKycSession(agent.id, params.sid);

    // Sliding expiry: any agent write (upload / confirm / patch / delete) is
    // real activity, so push the deadline forward before running the step.
    // This keeps an actively-worked session alive without the agent having to
    // hit "ต่อเวลา". Read-only GETs don't count, and an already-expired or
    // terminal session is left to its handler to reject.
    if (
      req.method !== "GET" &&
      !session.terminalAt &&
      session.expiresAt > new Date()
    ) {
      await extendWizardSession(params.sid);
    }

    const key = pathKey(params.wizardPath);
    const target = resolve(key);
    if (!target) return jsonNotFound(key);

    return await runWithKycActor(
      { actor: agentActor(agent.id), evidenceSource: "agent_upload" },
      () => target.handler(req, target.ctx),
    );
  } catch (error) {
    return agentAccessErrorResponse(error);
  }
}

export async function GET(req: Request, { params }: Params) {
  return runAgentWizardRoute(req, params, (key) => {
    if (key === "s1/dga-checklist") {
      return { handler: getDgaChecklist as Handler, ctx: { params: { sid: params.sid } } };
    }
    if (key === "result") {
      return { handler: getResult as Handler, ctx: { params: { sid: params.sid } } };
    }
    return null;
  });
}

export async function POST(req: Request, { params }: Params) {
  return runAgentWizardRoute(req, params, (key) => {
    const baseCtx = { params: { sid: params.sid } };
    const routes: Partial<Record<string, Handler>> = {
      "s1/id-card-ref": postIdCardRef as Handler,
      "s1/id-card-ref/confirm": postIdCardConfirm as Handler,
      "s1/id-card-ref/retake": postIdCardRetake as Handler,
      "s2/email-request": postEmailRequest as Handler,
      "s3/fetch-otp": postFetchOtp as Handler,
      "s3/confirm": postConfirmOtp as Handler,
      "s2/skip-email": postSkipEmail as Handler,
      "s1/dga-add-image": postDgaAddImage as Handler,
      "s1/dga-finalize": postDgaFinalize as Handler,
      "s1/dga-review-confirm": postDgaReviewConfirm as Handler,
      "s1/dga-review-back": postDgaReviewBack as Handler,
      "s1/id-card": postIdCardSelfie as Handler,
      "s4/ussd": postPhoneResponse as Handler,
      "s6/bankbook": postBankbook as Handler,
      "s5/finalize": postFinalize as Handler,
      finalize: postFinalize as Handler,
    };
    const handler = routes[key];
    return handler ? { handler, ctx: baseCtx } : null;
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return runAgentWizardRoute(req, params, (key) => {
    const match = key.match(/^s1\/dga-review\/([^/]+)$/);
    if (!match) return null;
    return {
      handler: patchDgaReviewField as Handler,
      ctx: { params: { sid: params.sid, fieldKey: match[1] } },
    };
  });
}

export async function DELETE(req: Request, { params }: Params) {
  return runAgentWizardRoute(req, params, (key) => {
    const match = key.match(/^s1\/dga-image\/([^/]+)$/);
    if (!match) return null;
    return {
      handler: deleteDgaImage as Handler,
      ctx: { params: { sid: params.sid, evidenceId: match[1] } },
    };
  });
}
