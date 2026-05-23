"use client"

import * as React from "react"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react"
import type { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form } from "@/components/ui/form"

// ── Public API ──────────────────────────────────────────────────────────────
export interface OperatorFormSectionResult {
  ok: boolean
  message?: string
}

export interface OperatorFormSectionProps<TSchema extends z.ZodTypeAny> {
  title: string
  description?: string
  schema: TSchema
  defaultValues: z.infer<TSchema>
  onSubmit: (values: z.infer<TSchema>) => Promise<OperatorFormSectionResult>
  children: (form: UseFormReturn<z.infer<TSchema>>) => React.ReactNode
  /** When true, renders a sticky save bar at the bottom while the form is dirty. */
  stickySave?: boolean
  /** Sticky bar labels — overridable for Thai/EN copy variants. */
  saveLabel?: string
  resetLabel?: string
  /** Class overrides for the wrapper Card. */
  className?: string
}

type FeedbackPhase =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }

// ── Component ──────────────────────────────────────────────────────────────
export function OperatorFormSection<TSchema extends z.ZodTypeAny>({
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  children,
  stickySave = false,
  saveLabel = "บันทึก",
  resetLabel = "ยกเลิก",
  className,
}: OperatorFormSectionProps<TSchema>) {
  type Values = z.infer<TSchema>

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const [feedback, setFeedback] = React.useState<FeedbackPhase>({
    kind: "idle",
  })

  // Reset feedback whenever the user starts editing again so success/error
  // banners don't linger past the moment they're useful.
  React.useEffect(() => {
    const sub = form.watch(() => {
      setFeedback((prev) => (prev.kind === "idle" ? prev : { kind: "idle" }))
    })
    return () => sub.unsubscribe()
  }, [form])

  // Keep defaultValues in sync with parent when the parent re-fetches.
  // RHF only consumes the initial defaultValues; this `reset` keeps the
  // form mirroring server state across re-renders.
  const initialRef = React.useRef(defaultValues)
  React.useEffect(() => {
    if (initialRef.current !== defaultValues) {
      initialRef.current = defaultValues
      form.reset(defaultValues as Values)
    }
  }, [defaultValues, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    setFeedback({ kind: "idle" })
    try {
      const result = await onSubmit(values)
      if (result.ok) {
        setFeedback({
          kind: "success",
          message: result.message ?? "บันทึกสำเร็จ",
        })
        // Mark the form as pristine against the just-saved values so the
        // sticky save bar disappears.
        form.reset(values)
      } else {
        setFeedback({
          kind: "error",
          message: result.message ?? "บันทึกไม่สำเร็จ",
        })
      }
    } catch (err) {
      setFeedback({
        kind: "error",
        message:
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
      })
    }
  })

  const isSubmitting = form.formState.isSubmitting
  const isDirty = form.formState.isDirty

  return (
    <Card className={cn("relative", className)}>
      <Form {...form}>
        <form
          onSubmit={handleSubmit}
          // `noValidate` so RHF/Zod errors are the source of truth — the
          // browser's native bubble is jarring next to inline FormMessage.
          noValidate
          aria-busy={isSubmitting}
          className="contents"
        >
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent className="grid gap-4">
            {children(form)}

            {feedback.kind === "success" && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2Icon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
                {feedback.message}
              </div>
            )}
            {feedback.kind === "error" && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <XCircleIcon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
                {feedback.message}
              </div>
            )}

            {/* Inline (non-sticky) save row */}
            {!stickySave && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={!isDirty || isSubmitting}
                >
                  {resetLabel}
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2Icon
                      className="size-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {saveLabel}
                </Button>
              </div>
            )}
          </CardContent>

          {/* Sticky save bar — appears only while dirty */}
          {stickySave && isDirty && (
            <div
              role="region"
              aria-label="บันทึกการเปลี่ยนแปลง"
              className="sticky bottom-4 z-20 mx-4 mb-4 flex items-center justify-between gap-3 rounded-xl bg-popover px-4 py-3 text-sm shadow-lg ring-1 ring-foreground/10"
            >
              <span className="text-muted-foreground">
                มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  {resetLabel}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2Icon
                      className="size-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {saveLabel}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </Card>
  )
}
