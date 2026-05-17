import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createWizardSession } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Auth requirement relaxed for now — sessions can be anonymous (userId is
// nullable). When the vendor is signed in we bind the session to their
// user.id so /apply can show their status; otherwise it's a one-off test
// session that the admin queue surfaces as "anonymous".
export async function POST(req: Request) {
  try {
    const auth = await getServerSession(authOptions);

    const body = req.headers.get("content-type")?.includes("application/json")
      ? ((await req.json()) as Record<string, unknown>)
      : {};

    const metadata: Record<string, unknown> = {
      userAgent: req.headers.get("user-agent") ?? null,
      ...(body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, unknown>)
        : {}),
    };

    const session = await createWizardSession({
      userId: auth?.user?.id ?? null,
      metadata,
    });

    return NextResponse.json({
      ok: true,
      session_id: session.id,
      state: session.state,
      resume_token: session.id,
      expires_at: session.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
