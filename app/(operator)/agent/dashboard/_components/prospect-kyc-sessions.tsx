"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, FileImage, Images, Loader2, Play, X } from "lucide-react";
import {
  Button,
  OperatorEmptyState,
  OperatorStatusBadge,
  OperatorTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/operator/operator-primitives";

interface ProspectSession {
  id: string;
  state: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  evidenceCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  terminalAt: string | null;
}

interface EvidenceImage {
  id: string;
  step: string;
  mime: string;
  url: string;
  capturedAt: string;
}

// Internal wizard states → human label (agent-facing). Keep in sync with the
// stepper in kyc-wizard.tsx; unknown states fall back to the raw value.
const STATE_LABEL: Record<string, string> = {
  INIT: "เริ่มต้น",
  S1_ID_CARD_REF: "บัตรประชาชน",
  S1_ID_CARD_REVIEW: "ตรวจบัตรประชาชน",
  S2_EMAIL_PENDING: "อีเมล",
  S3_OTP_VERIFIED: "ยืนยัน OTP",
  S1_DGA_CAPTURE: "อัปโหลด DGA",
  S1_DGA_REVIEW: "ตรวจข้อมูล DGA",
  S2_ID_SELFIE: "เซลฟี่",
  S3_PHONE_RESPONSE: "ยืนยันเบอร์โทร",
  S4_BANKBOOK_UPLOAD: "สมุดบัญชี",
  S5_SUMMARY: "ตรวจสอบ/สรุป",
  AUTO_APPROVED: "อนุมัติอัตโนมัติ",
  MANUAL_REVIEW: "รอตรวจสอบ",
  REJECTED: "ปฏิเสธ",
};

const TERMINAL_STATES = new Set(["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED"]);

function stepLabel(state: string) {
  return STATE_LABEL[state] ?? state;
}

function deriveStatus(s: ProspectSession): {
  label: string;
  tone: "success" | "warning" | "info" | "danger" | "neutral";
} {
  if (s.state === "AUTO_APPROVED") return { label: "อนุมัติแล้ว", tone: "success" };
  if (s.state === "MANUAL_REVIEW") return { label: "รอตรวจสอบ", tone: "info" };
  if (s.state === "REJECTED") return { label: "ปฏิเสธ", tone: "danger" };
  if (s.terminalAt) return { label: "สิ้นสุด", tone: "neutral" };
  if (new Date(s.expiresAt).getTime() < Date.now()) return { label: "หมดอายุ", tone: "danger" };
  return { label: "กำลังดำเนินการ", tone: "warning" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProspectKycSessions() {
  const [sessions, setSessions] = useState<ProspectSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image-viewer modal state
  const [viewing, setViewing] = useState<ProspectSession | null>(null);
  const [images, setImages] = useState<EvidenceImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agents/me/kyc/sessions");
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.detail || data.error || "ไม่สามารถโหลดรายการ session ได้");
        }
        if (!cancelled) setSessions(data.sessions);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openImages(s: ProspectSession) {
    setViewing(s);
    setImages([]);
    setImagesError(null);
    setImagesLoading(true);
    try {
      const res = await fetch(`/api/agents/me/kyc/sessions/${s.id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "ไม่สามารถโหลดรูปได้");
      }
      setImages(Array.isArray(data.evidence) ? data.evidence : []);
    } catch (err) {
      setImagesError(err instanceof Error ? err.message : String(err));
    } finally {
      setImagesLoading(false);
    }
  }

  return (
    <OperatorTable
      title={`KYC ที่สร้างเอง (${sessions.length} รายการ)`}
      description="session ที่คุณสร้างเพื่ออัปโหลดเอกสารแทน Vendor — ติดตามได้ว่าทำถึงขั้นตอนไหนและดูรูปที่อัปไปแล้ว"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" /> กำลังโหลด...
        </div>
      ) : error ? (
        <p className="py-4 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : sessions.length === 0 ? (
        <OperatorEmptyState
          icon={FileImage}
          title="ยังไม่มี session ที่สร้างเอง"
          description='ใช้แบบฟอร์ม "Agent-assisted KYC" ด้านบนเพื่อสร้าง session แรกของคุณ'
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor / ติดต่อ</TableHead>
              <TableHead>ขั้นตอนปัจจุบัน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>รูป</TableHead>
              <TableHead>อัปเดตล่าสุด</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => {
              const status = deriveStatus(s);
              const isExpired =
                !s.terminalAt &&
                !TERMINAL_STATES.has(s.state) &&
                new Date(s.expiresAt).getTime() <= Date.now();
              const isTerminal = s.terminalAt !== null || TERMINAL_STATES.has(s.state);
              const canResume = !isExpired && !isTerminal;
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-semibold text-foreground">{s.name || "ยังไม่ระบุชื่อ"}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.phone || s.email || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{stepLabel(s.state)}</span>
                  </TableCell>
                  <TableCell>
                    <OperatorStatusBadge tone={status.tone}>{status.label}</OperatorStatusBadge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => openImages(s)}
                      disabled={s.evidenceCount === 0}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                    >
                      <Images className="size-4" />
                      {s.evidenceCount > 0 ? `ดูรูป (${s.evidenceCount})` : "ไม่มีรูป"}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDate(s.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {canResume ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/agent/kyc/${s.id}`}>
                          <Play className="size-4" />
                          ทำต่อ
                        </Link>
                      </Button>
                    ) : (
                      // Not resumable (expired / terminal): no wizard entry —
                      // it would just dead-end on a "session expired" screen.
                      // Inspection is still possible via the "ดูรูป" column.
                      <span
                        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium text-muted-foreground"
                        title="session นี้ดำเนินการต่อไม่ได้แล้ว — ใช้ &quot;ดูรูป&quot; เพื่อดูเอกสารที่อัปไว้"
                      >
                        {isExpired ? "หมดอายุ" : "สิ้นสุด"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="รูปที่อัปโหลด"
          onClick={() => setViewing(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="font-heading text-base font-medium text-card-foreground">
                  รูปที่อัปโหลด — {viewing.name || "Vendor"}
                </h3>
                <p className="text-xs text-muted-foreground">ขั้นตอนล่าสุด: {stepLabel(viewing.state)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewing(null)} aria-label="ปิด">
                <X />
              </Button>
            </div>
            <div className="overflow-y-auto p-5">
              {imagesLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" /> กำลังโหลดรูป...
                </div>
              ) : imagesError ? (
                <p className="py-6 text-sm font-medium text-destructive" role="alert">
                  {imagesError}
                </p>
              ) : images.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">ไม่มีรูปในขั้นตอนนี้</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-1.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`${stepLabel(img.step)} (${img.id})`}
                        className="aspect-[3/4] w-full rounded-lg border object-cover transition-opacity group-hover:opacity-80"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {stepLabel(img.step)} · {formatDate(img.capturedAt)}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </OperatorTable>
  );
}
