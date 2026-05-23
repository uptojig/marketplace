"use client"

import * as React from "react"
import { AlertTriangleIcon, Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// ── Public API ──────────────────────────────────────────────────────────────
export type ConfirmActionTone = "default" | "destructive"

export interface ConfirmActionResult {
  ok: boolean
  message?: string
  /** When provided, the dialog swaps to a result phase showing this node. */
  result?: React.ReactNode
}

export interface OperatorConfirmActionProps {
  /** The button / menu-item that opens the dialog. */
  trigger: React.ReactNode
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmActionTone
  /**
   * Called when the user clicks confirm. Resolve with `{ result: <node> }` to
   * swap the dialog into "result phase". Throw / reject to surface an error
   * inline (the dialog stays open so the user can retry).
   */
  onConfirm: () => Promise<ConfirmActionResult | void>
  /** Title used in the result phase. Receives the resolved value. */
  resultTitle?: (result: ConfirmActionResult) => string
  /** Label for the OK button in the result phase. */
  resultCloseLabel?: string
  /** Controlled-open hook (optional — defaults to uncontrolled). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type Phase =
  | { kind: "confirm" }
  | { kind: "submitting" }
  | { kind: "result"; payload: ConfirmActionResult }
  | { kind: "error"; message: string }

const INITIAL_PHASE: Phase = { kind: "confirm" }

export function OperatorConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  tone = "default",
  onConfirm,
  resultTitle,
  resultCloseLabel = "ตกลง",
  open: controlledOpen,
  onOpenChange,
}: OperatorConfirmActionProps) {
  const isControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = isControlled ? !!controlledOpen : uncontrolledOpen

  const [phase, setPhase] = React.useState<Phase>(INITIAL_PHASE)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
      if (!next) {
        // Reset phase whenever we close so the next open starts fresh.
        // Use a microtask so the close animation isn't visually disrupted.
        queueMicrotask(() => setPhase(INITIAL_PHASE))
      }
    },
    [isControlled, onOpenChange]
  )

  const handleConfirm = React.useCallback(async () => {
    setPhase({ kind: "submitting" })
    try {
      const ret = await onConfirm()
      if (ret && ret.result !== undefined) {
        setPhase({ kind: "result", payload: ret })
        return
      }
      if (ret && ret.ok === false) {
        setPhase({
          kind: "error",
          message: ret.message ?? "การดำเนินการล้มเหลว",
        })
        return
      }
      // Success without a result-phase payload → just close.
      setOpen(false)
    } catch (err) {
      setPhase({
        kind: "error",
        message:
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
      })
    }
  }, [onConfirm, setOpen])

  const isSubmitting = phase.kind === "submitting"
  const isResult = phase.kind === "result"
  const isError = phase.kind === "error"

  const computedTitle =
    isResult && resultTitle ? resultTitle(phase.payload) : title

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-2",
              tone === "destructive" && !isResult && "text-destructive"
            )}
          >
            {tone === "destructive" && !isResult && (
              <AlertTriangleIcon
                aria-hidden="true"
                className="size-4 shrink-0"
              />
            )}
            {computedTitle}
          </DialogTitle>
          {description && !isResult && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {isResult && (
          <div
            data-slot="operator-confirm-result"
            className="text-sm text-foreground"
          >
            {phase.payload.result}
            {phase.payload.message && !phase.payload.result && (
              <p>{phase.payload.message}</p>
            )}
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {phase.message}
          </div>
        )}

        <DialogFooter>
          {isResult ? (
            <DialogClose asChild>
              <Button variant="default">{resultCloseLabel}</Button>
            </DialogClose>
          ) : (
            <>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting}
                >
                  {cancelLabel}
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant={tone === "destructive" ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2Icon
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
