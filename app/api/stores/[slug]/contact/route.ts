// POST /api/stores/[slug]/contact — guest-friendly contact form.
//
// Accepts a name + message (email/phone optional). Two side-effects,
// in this order:
//   1. Persist a ContactMessage row — DB is the canonical inbox so
//      the vendor can find every submission via /dashboard/store/messages
//      regardless of whether email delivery worked.
//   2. Best-effort email to the store's contactEmail via Resend. We
//      DON'T fail the request when email fails — the row already
//      landed in step 1, which is what the vendor will check.
//
// No auth required — the contact page is public. Light input
// validation + sendEmail's never-throw semantics keep this from
// failing buyer-facing flows.

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

  // 1. Persist FIRST. Treat the DB row as the source of truth — even
  //    if Resend is misconfigured or the store hasn't set contactEmail,
  //    the vendor can still find this submission in the dashboard
  //    inbox at /dashboard/store/messages.
  //
  //    Empty strings from the form get coerced to null so the column
  //    semantics ("no email/phone provided") are unambiguous.
  await prisma.contactMessage.create({
    data: {
      storeId: store.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    },
  });

  // 2. Best-effort email notification. Without a contactEmail there's
  //    nowhere to deliver — log + return delivered=false so the
  //    client UI can adjust the success message if it wants to.
  //    With contactEmail set, sendEmail() never throws (returns ok:
  //    false on provider failures), so we just log the reason.
  if (!store.contactEmail) {
    console.warn(
      `[contact] store ${slug} has no contactEmail — submission saved but not emailed`,
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
    // Still return ok=true to the client — DB row is durable, and we
    // don't want to expose email-provider problems to the buyer.
  }

  return NextResponse.json({ ok: true, delivered: result.ok });
}
