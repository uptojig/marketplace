"use client";

// Vendor-facing toggle on the contact-message detail page.
//
// One control: "Mark as read" / "Mark as unread" — flips ContactMessage.readAt
// via the server actions in lib/admin/contact-messages.ts. The parent
// server component decides which state the button starts in based on
// the row's current readAt; on submit we router.refresh() so the
// parent re-renders with the new state and the sidebar badge updates.
//
// We don't deliver any user-visible affordances beyond this — replying
// happens externally via the mailto: / tel: links in the parent card,
// not via the dashboard. The vendor uses the read flag purely for
// internal triage.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  markMessageRead,
  markMessageUnread,
} from "@/lib/admin/contact-messages";

interface MarkReadToggleProps {
  messageId: string;
  // Whether the row is currently read. Determines starting button
  // copy + which server action to invoke.
  isRead: boolean;
}

export function MarkReadToggle({ messageId, isRead }: MarkReadToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const action = isRead ? markMessageUnread : markMessageRead;
      const result = await action(messageId);
      if (!result.ok) {
        setError(translateError(result.error));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        variant={isRead ? "outline" : "default"}
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : isRead ? (
          <Mail className="mr-1.5 h-4 w-4" />
        ) : (
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
        )}
        {isRead ? "ทำเครื่องหมายเป็นยังไม่อ่าน" : "ทำเครื่องหมายว่าอ่านแล้ว"}
      </Button>
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function translateError(code: string | undefined): string {
  switch (code) {
    case "unauthorized":
      return "กรุณาเข้าสู่ระบบอีกครั้ง";
    case "forbidden":
      return "ไม่พบข้อความ";
    default:
      return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
}
