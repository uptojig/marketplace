"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Printer,
} from "lucide-react";
import {
  Button,
  OperatorCard,
  OperatorEmptyState,
  OperatorError,
  OperatorLoading,
  OperatorPageHeader,
  OperatorStatusBadge,
} from "@/components/operator/operator-primitives";

// ── Types ──

interface DgaData {
  [key: string]: string;
}

interface EvidenceItem {
  id: string;
  step: string;
  label: string;
  order: number;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  url: string;
  capturedAt: string;
}

interface VendorDocData {
  vendor: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    dgaData: DgaData | null;
    createdAt: string;
  };
  kycStatus: string;
  kycSessionId: string | null;
  kycFinalizedAt: string | null;
  evidence: EvidenceItem[];
}

// ── DGA Field Labels ──

const DGA_LABELS: Record<string, { label: string; icon: typeof User }> = {
  firstName:   { label: "ชื่อ", icon: User },
  lastName:    { label: "นามสกุล", icon: User },
  citizenId:   { label: "เลขบัตรประชาชน", icon: CreditCard },
  mobilePhone: { label: "เบอร์โทรศัพท์", icon: Phone },
  phone:       { label: "เบอร์โทรศัพท์", icon: Phone },
  email:       { label: "อีเมล", icon: Mail },
  address:     { label: "ที่อยู่", icon: MapPin },
  dob:         { label: "วันเกิด", icon: Calendar },
  province:    { label: "จังหวัด", icon: MapPin },
  district:    { label: "เขต/อำเภอ", icon: MapPin },
  subDistrict: { label: "แขวง/ตำบล", icon: MapPin },
  postalCode:  { label: "รหัสไปรษณีย์", icon: MapPin },
};

// ── KYC Status Badge ──

function KycBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: "neutral" | "success" | "warning" | "danger" | "info" }> = {
    AUTO_APPROVED:  { label: "KYC ผ่านอัตโนมัติ", tone: "success" },
    MANUAL_REVIEW:  { label: "ผ่าน (ตรวจด้วยมือ)", tone: "info" },
    REJECTED:       { label: "ปฏิเสธเอกสาร", tone: "danger" },
    NOT_STARTED:    { label: "ยังไม่ส่งเอกสาร", tone: "neutral" },
  };
  const meta = map[status] ?? { label: "กำลังตรวจเอกสาร", tone: "warning" };
  return <OperatorStatusBadge tone={meta.tone}>{meta.label}</OperatorStatusBadge>;
}

// ── Mask citizen ID ──

function maskCitizenId(id: string) {
  if (id.length !== 13) return id;
  return `${id.slice(0, 1)}-${id.slice(1, 5)}-***${id.slice(8, 10)}-${id.slice(10, 12)}-${id.slice(12)}`;
}

// ── Main Page ──

export default function VendorDocumentsPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [data, setData] = useState<VendorDocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/agents/me/vendors/${vendorId}/documents`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Unknown error");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [vendorId]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIdx === null || !data) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight" && data && lightboxIdx !== null && lightboxIdx < data.evidence.length - 1) {
        setLightboxIdx(lightboxIdx + 1);
      }
      if (e.key === "ArrowLeft" && lightboxIdx !== null && lightboxIdx > 0) {
        setLightboxIdx(lightboxIdx - 1);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIdx, data]);

  // Print/PDF handler
  const printRef = useRef<HTMLDivElement>(null);
  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return <OperatorLoading label="กำลังโหลดเอกสาร..." />;
  }

  if (error || !data) {
    return (
      <OperatorError
        title="ไม่สามารถโหลดเอกสารได้"
        description={error}
        action={
          <Button asChild>
            <Link href="/agent/dashboard">
              <ArrowLeft />
              กลับไปหน้าหลัก
            </Link>
          </Button>
        }
      />
    );
  }

  const { vendor, kycStatus, evidence } = data;
  const dgaData = vendor.dgaData;

  return (
    <>
      {/* Screen layout */}
      <div className="flex flex-col gap-6 print:hidden">
        <OperatorPageHeader
          title={vendor.name || "ไม่ระบุชื่อ"}
          description="เอกสาร KYC ของผู้สมัคร"
          actions={
            <>
              <KycBadge status={kycStatus} />
              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                <Printer />
                Export PDF
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/agent/dashboard">
                  <ArrowLeft />
                  กลับ
                </Link>
              </Button>
            </>
          }
        />

        {/* DGA Data Card */}
        {dgaData && Object.keys(dgaData).length > 0 && (
          <OperatorCard title="ข้อมูลส่วนตัวจากเอกสาร (DGA OCR)">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dgaData).map(([key, value]) => {
                const meta = DGA_LABELS[key];
                const Icon = meta?.icon ?? FileText;
                const label = meta?.label ?? key;
                const displayValue = key === "citizenId" ? maskCitizenId(value) : value;
                return (
                  <div key={key} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
                      <Icon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="mt-0.5 break-all text-sm font-medium text-foreground">{displayValue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </OperatorCard>
        )}

        {/* Evidence Grid */}
        <OperatorCard title={`เอกสารที่อัปโหลด (${evidence.length} รายการ)`}>
          {evidence.length === 0 ? (
            <OperatorEmptyState
              icon={ImageIcon}
              title="ไม่พบเอกสารที่อัปโหลด"
              description="อาจเป็นเพราะ Session หมดอายุแล้ว หรือ Vendor ยังทำไม่จบทุกขั้นตอน"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {evidence.map((e, idx) => (
                <button
                  key={e.id}
                  onClick={() => setLightboxIdx(idx)}
                  className="group relative block overflow-hidden rounded-lg border bg-muted/30 text-left transition-all hover:border-primary hover:shadow-md"
                >
                  {e.mime.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.url}
                      alt={e.label}
                      className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                      {e.mime}
                    </div>
                  )}
                  <div className="border-t p-2.5">
                    <p className="truncate text-xs font-semibold text-foreground">{e.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {Math.round(e.bytes / 1024)} KB
                      {e.width && e.height ? ` · ${e.width}×${e.height}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </OperatorCard>
      </div>

      {/* Lightbox Modal */}
      {lightboxIdx !== null && evidence[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center print:hidden"
          onClick={() => setLightboxIdx(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <a
              href={evidence[lightboxIdx].url}
              download={`${evidence[lightboxIdx].step}.${evidence[lightboxIdx].mime.split("/")[1] === "jpeg" ? "jpg" : evidence[lightboxIdx].mime.split("/")[1] || "jpg"}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
              title="ดาวน์โหลด"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => setLightboxIdx(null)}
              className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prev/Next */}
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {lightboxIdx < evidence.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image / File Viewer */}
          <div className="max-w-4xl max-h-[85vh] p-4 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {evidence[lightboxIdx].mime.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={evidence[lightboxIdx].url}
                alt={evidence[lightboxIdx].label}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-200"
              />
            ) : (
              <div className="w-[320px] sm:w-[480px] h-[300px] flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <FileText className="w-16 h-16 text-white/60 mb-4 animate-bounce" />
                <p className="text-base font-bold text-white text-center">{evidence[lightboxIdx].label}</p>
                <p className="text-xs text-white/50 mt-1 text-center font-mono">ประเภท: {evidence[lightboxIdx].mime}</p>
                <a
                  href={evidence[lightboxIdx].url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-primary-foreground transition-all"
                >
                  เปิดไฟล์ในแท็บใหม่
                </a>
              </div>
            )}
            <div className="text-center mt-3">
              <p className="text-white text-sm font-semibold">{evidence[lightboxIdx].label}</p>
              <p className="text-white/60 text-xs mt-0.5">
                {lightboxIdx + 1} / {evidence.length} · {Math.round(evidence[lightboxIdx].bytes / 1024)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Print Layout — 1 step = 1 page */}
      <div className="hidden print:block" ref={printRef}>
        <style jsx>{`
          @media print {
            @page { margin: 1.5cm; size: A4; }
          }
        `}</style>

        {/* Cover page */}
        <div className="break-after-page">
          <h1 className="text-2xl font-bold mb-2">เอกสาร KYC — {vendor.name || "ไม่ระบุชื่อ"}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            สถานะ: {kycStatus} · วันที่สมัคร:{" "}
            {new Date(vendor.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {dgaData && Object.keys(dgaData).length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 border-b pb-2">ข้อมูลส่วนตัว</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {Object.entries(dgaData).map(([key, value]) => {
                    const label = DGA_LABELS[key]?.label ?? key;
                    const displayValue = key === "citizenId" ? maskCitizenId(value) : value;
                    return (
                      <tr key={key} className="border-b border-border">
                        <td className="py-2 pr-4 font-semibold text-muted-foreground w-40">{label}</td>
                        <td className="py-2">{displayValue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* One page per evidence step */}
        {evidence.map((e, idx) => (
          <div key={e.id} className={idx < evidence.length - 1 ? "break-after-page" : ""}>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-bold">
                ขั้นตอนที่ {e.order} — {e.label}
              </h2>
              <span className="text-xs text-muted-foreground">
                {new Date(e.capturedAt).toLocaleString("th-TH")}
              </span>
            </div>
            {e.mime.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.url}
                alt={e.label}
                className="max-w-full max-h-[75vh] object-contain mx-auto"
              />
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                ไฟล์ {e.mime} — ไม่สามารถแสดงภาพตัวอย่างได้
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {vendor.name} · {e.step} · {Math.round(e.bytes / 1024)} KB
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
