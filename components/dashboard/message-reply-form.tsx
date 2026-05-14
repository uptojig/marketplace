"use client";

// Vendor reply composer on the contact-message detail page.
//
// Renders one of three states based on the row's current data:
//   1. No customer email → shows a disabled note pointing the vendor at
//      the phone number (when available). Replying isn't possible.
//   2. No prior reply (repliedAt = null) → empty composer with "ส่ง
//      คำตอบ" button.
//   3. Already replied → read-only transcript (replyBody + sent-at +
//      delivery hint) with an "ตอบกลับเพิ่ม" button that flips the
//      composer back open so the vendor can send a follow-up.
//
// The server action persists the reply BEFORE Resend sends, so a
// network failure still records the attempt and lets the vendor retry
// without retyping. We surface that branch via the action's
// emailDelivered flag — UI shows "ส่งคำตอบไม่สำเร็จ — กดส่งอีกครั้ง"
// and keeps the body in the textarea.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { replyToMessage } from "@/lib/admin/contact-messages";

interface Props {
  messageId: string;
  /** Customer email — null when not provided; disables the form. */
  customerEmail: string | null;
  /** Customer name — shown in the disabled-state hint. */
  customerName: string;
  /** Customer phone — shown in the disabled-state hint when present. */
  customerPhone: string | null;
  /**
   * Existing reply if there is one. Drives the read-only transcript
   * pane that renders before the composer.
   */
  existingReply: {
    body: string;
    repliedAt: Date;
  } | null;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 4000;

export function MessageReplyForm({
  messageId,
  customerEmail,
  customerName,
  customerPhone,
  existingReply,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  // After a successful send we flip to a confirmation panel that
  // shows the just-sent reply + a "ส่งใหม่" button — keeps the
  // vendor from accidentally double-sending the same body.
  const [justSent, setJustSent] = useState<{
    body: string;
    at: Date;
    deliveryFailed: boolean;
  } | null>(null);
  // Composer-open flag for the "already replied" branch — defaults to
  // CLOSED (transcript only) and only opens when the vendor clicks
  // "ตอบกลับเพิ่ม". Avoids the empty textarea distracting from the
  // transcript on first view.
  const [composerOpen, setComposerOpen] = useState(false);

  // Branch 1: no email column → can't reply. Show contact hint.
  if (!customerEmail) {
    return (
      <Card className="p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4" /> ตอบกลับลูกค้า
        </h3>
        <p className="text-sm text-muted-foreground">
          ลูกค้า ({customerName}) ไม่ได้ระบุอีเมล — ตอบกลับผ่านโทรศัพท์แทน
        </p>
        {customerPhone && (
          <a
            href={`tel:${customerPhone.replace(/\s+/g, "")}`}
            className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            <Phone className="h-3.5 w-3.5" />
            {customerPhone}
          </a>
        )}
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const snapshot = body;
    startTransition(async () => {
      const result = await replyToMessage(messageId, snapshot);
      if (!result.ok) {
        setError(translateError(result.error));
        return;
      }
      // Success — show the confirmation panel + clear the textarea.
      // Even when emailDelivered=false the DB row landed; we pass
      // the flag through to the panel so it can offer "send again".
      setJustSent({
        body: snapshot,
        at: new Date(),
        deliveryFailed: result.emailDelivered === false,
      });
      setBody("");
      setComposerOpen(false);
      // Refresh the parent — the detail page reads repliedAt /
      // replyBody from the DB on the next render and will show the
      // updated transcript on subsequent navigation.
      router.refresh();
    });
  }

  function openFreshComposer() {
    setJustSent(null);
    setBody("");
    setError(null);
    setComposerOpen(true);
  }

  // Branch 2/3: render the transcript (existing reply OR just-sent)
  // followed by either the open composer or a "ตอบกลับเพิ่ม" trigger.

  const transcript =
    justSent ??
    (existingReply
      ? {
          body: existingReply.body,
          at: existingReply.repliedAt,
          deliveryFailed: false,
        }
      : null);

  return (
    <Card className="p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Mail className="h-4 w-4" /> ตอบกลับลูกค้า
        <span className="text-xs font-normal text-muted-foreground">
          → {customerEmail}
        </span>
      </h3>

      {transcript && (
        <div
          className={
            transcript.deliveryFailed
              ? "mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3"
              : "mb-3 rounded-md border border-green-200 bg-green-50/60 p-3"
          }
        >
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span
              className={
                transcript.deliveryFailed
                  ? "font-semibold text-destructive"
                  : "flex items-center gap-1 font-semibold text-green-700"
              }
            >
              {transcript.deliveryFailed ? (
                "อีเมลส่งไม่สำเร็จ — ระบบบันทึกคำตอบไว้แล้ว ลองส่งใหม่ได้"
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  ส่งคำตอบแล้ว · {customerEmail} · เมื่อ{" "}
                  {transcript.at.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </span>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">
            {transcript.body}
          </p>
        </div>
      )}

      {composerOpen || !transcript ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            required
            minLength={MIN_LENGTH}
            maxLength={MAX_LENGTH}
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={pending}
            placeholder={
              transcript
                ? "พิมพ์ข้อความเพิ่มเติม..."
                : "พิมพ์คำตอบของคุณ — ลูกค้าจะได้รับอีเมลฉบับนี้"
            }
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {body.trim().length}/{MAX_LENGTH} อักขระ (อย่างน้อย {MIN_LENGTH})
            </span>
            <div className="flex items-center gap-2">
              {transcript && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setComposerOpen(false);
                    setBody("");
                    setError(null);
                  }}
                  disabled={pending}
                >
                  ยกเลิก
                </Button>
              )}
              <Button
                type="submit"
                disabled={pending || body.trim().length < MIN_LENGTH}
                size="sm"
              >
                {pending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-4 w-4" />
                )}
                {transcript ? "ส่งคำตอบเพิ่ม" : "ส่งคำตอบ"}
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFreshComposer}
        >
          <Mail className="mr-1.5 h-4 w-4" />
          ตอบกลับเพิ่ม
        </Button>
      )}
    </Card>
  );
}

function translateError(code: string | undefined): string {
  switch (code) {
    case "unauthorized":
      return "กรุณาเข้าสู่ระบบอีกครั้ง";
    case "forbidden":
      return "ไม่พบข้อความ";
    case "no_reply_email":
      return "ลูกค้าไม่ได้ระบุอีเมล — ไม่สามารถตอบกลับได้";
    case "body_too_short":
      return `ข้อความต้องมีอย่างน้อย ${MIN_LENGTH} อักขระ`;
    case "body_too_long":
      return `ข้อความต้องไม่เกิน ${MAX_LENGTH} อักขระ`;
    default:
      return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
}
