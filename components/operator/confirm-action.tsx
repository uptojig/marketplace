"use client";

/**
 * <ConfirmAction>
 *
 * Phase A primitive — a shadcn <Dialog> wrapper that gates destructive
 * operator actions behind an explicit type-to-confirm flow. Used by the
 * danger-zone section (delete store), bulk teardown actions, etc.
 *
 *   <ConfirmAction
 *     trigger={<Button variant="destructive">ลบร้านนี้</Button>}
 *     title="ลบร้าน X ถาวร?"
 *     description="…"
 *     confirmPhrase="DELETE"
 *     confirmLabel="ลบถาวร"
 *     onConfirm={async () => fetch(`/api/admin/stores/${id}`, { method: 'DELETE' })}
 *   />
 *
 * Type-to-confirm is the safer default for destructive ops. Skip it by
 * leaving `confirmPhrase` undefined and the button enables immediately.
 */

import * as React from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type ConfirmActionProps = {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  // Type-to-confirm phrase. When set, the confirm button stays disabled
  // until the operator types it verbatim. Omit for a single-tap confirm.
  confirmPhrase?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  // Returns void → close dialog; throws → show error & keep open.
  onConfirm: () => Promise<void> | void;
};

export function ConfirmAction({
  trigger,
  title,
  description,
  confirmPhrase,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  variant = "destructive",
  onConfirm,
}: ConfirmActionProps) {
  const [open, setOpen] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Reset state whenever the dialog opens fresh so prior errors / typed
  // phrases don't leak across invocations.
  React.useEffect(() => {
    if (open) {
      setTyped("");
      setErr(null);
      setBusy(false);
    }
  }, [open]);

  const phraseOk = !confirmPhrase || typed.trim() === confirmPhrase;

  async function handleConfirm() {
    setBusy(true);
    setErr(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {confirmPhrase && (
          <div className="space-y-1.5">
            <Label htmlFor="confirm-phrase" className="text-xs font-medium">
              พิมพ์ <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{confirmPhrase}</code> เพื่อยืนยัน
            </Label>
            <Input
              id="confirm-phrase"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmPhrase}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={busy}
            />
          </div>
        )}

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {err}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            disabled={busy || !phraseOk}
            onClick={handleConfirm}
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {busy ? "กำลังดำเนินการ..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
