// POST /api/stores/[slug]/contact — guest-friendly contact form.
//
// Accepts a name + message (email/phone optional) and emails the
// store's `contactEmail` via Resend. No auth required — the contact
// page is public. Light input validation + sendEmail's never-throw
// semantics keep this from failing buyer-facing flows.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/transactional-email/send";
import StoreContactEmail from "@/lib/transactional-email/templates/store-contact";

const bodySchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(120),
  email: z
    .string()
    .trim()
    .max(160)
    .email("อีเมลไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1, "กรุณากรอกข้อความ").max(4000),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true, name: true, contactEmail: true },
  });
  if (!store) {
    return NextResponse.json({ error: "store_not_found" }, { status: 404 });
  }

  // Without a contactEmail there's no inbox to deliver to. Accept the
  // submission anyway (don't reject the buyer's UX) but log so the
  // operator notices.
  if (!store.contactEmail) {
    console.warn(
      `[contact] store ${slug} has no contactEmail — submission accepted but not delivered`,
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  const result = await sendEmail({
    to: store.contactEmail,
    replyTo: parsed.data.email || undefined,
    subject: `[${store.name}] ข้อความใหม่จากหน้าติดต่อ`,
    react: StoreContactEmail({
      storeName: store.name,
      visitorName: parsed.data.name,
      visitorEmail: parsed.data.email || null,
      visitorPhone: parsed.data.phone || null,
      message: parsed.data.message,
    }),
  });

  if (!result.ok) {
    console.error(
      `[contact] sendEmail failed for store ${slug}: ${result.reason}`,
    );
    // Still return ok=true to the client — we don't want to expose
    // email-provider problems to the buyer. Operator sees the log.
  }

  return NextResponse.json({ ok: true, delivered: result.ok });
}
