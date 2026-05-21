"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const map: Record<string, { label: string; cls: string }> = {
    AUTO_APPROVED:  { label: "KYC ผ่านอัตโนมัติ", cls: "bg-green-50 text-green-700 border-green-200" },
    MANUAL_REVIEW:  { label: "ผ่าน (ตรวจด้วยมือ)", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    REJECTED:       { label: "ปฏิเสธเอกสาร", cls: "bg-red-50 text-red-700 border-red-200" },
    NOT_STARTED:    { label: "ยังไม่ส่งเอกสาร", cls: "bg-gray-50 text-gray-700 border-gray-200" },
  };
  const meta = map[status] ?? { label: "กำลังตรวจเอกสาร", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

// ── Mask citizen ID ──

function maskCitizenId(id: string) {
  if (id.length !== 13) return id;
  return `${id.slice(0, 1)}-${id.slice(1, 5)}-***${id.slice(8, 10)}-${id.slice(10, 12)}-${id.slice(12)}`;
}

// ── Main Page ──

export default function VendorDocumentsPage() {
  const params = useParams();
  const router = useRouter();
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
    return (
      <div className="min-h-screen bg-mp-cream flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-mp-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mp-ink-muted text-sm font-medium">กำลังโหลดเอกสาร...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-mp-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center shadow-sm">
          <h2 className="text-xl font-bold text-mp-ink mb-2">ไม่สามารถโหลดเอกสารได้</h2>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-mp-coral text-sm font-semibold text-white hover:bg-mp-coral-dark transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const { vendor, kycStatus, evidence } = data;
  const dgaData = vendor.dgaData;

  return (
    <>
      {/* Screen layout */}
      <div className="min-h-screen bg-mp-cream-alt pb-16 print:hidden">
        {/* Header */}
        <header className="bg-white border-b border-mp-border sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/agent/dashboard"
                className="text-mp-ink-muted hover:text-mp-ink p-2 rounded-lg hover:bg-mp-cream transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-base font-bold text-mp-ink">
                  {vendor.name || "ไม่ระบุชื่อ"}
                </h1>
                <p className="text-[11px] text-mp-ink-muted">เอกสาร KYC ของผู้สมัคร</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <KycBadge status={kycStatus} />
              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-mp-border bg-white text-xs font-semibold text-mp-ink hover:bg-mp-cream transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Export PDF
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
          {/* DGA Data Card */}
          {dgaData && Object.keys(dgaData).length > 0 && (
            <section className="bg-white rounded-2xl border border-mp-border p-6 shadow-sm">
              <h2 className="text-sm font-bold text-mp-ink mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-mp-forest" />
                ข้อมูลส่วนตัวจากเอกสาร (DGA OCR)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(dgaData).map(([key, value]) => {
                  const meta = DGA_LABELS[key];
                  const Icon = meta?.icon ?? FileText;
                  const label = meta?.label ?? key;
                  const displayValue = key === "citizenId" ? maskCitizenId(value) : value;
                  return (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-xl bg-mp-cream/50 border border-mp-border/50">
                      <div className="p-2 rounded-lg bg-mp-forest/10 text-mp-forest shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-mp-ink-muted uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-medium text-mp-ink mt-0.5 break-all">{displayValue}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Evidence Grid */}
          <section className="bg-white rounded-2xl border border-mp-border p-6 shadow-sm">
            <h2 className="text-sm font-bold text-mp-ink mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-mp-coral" />
              เอกสารที่อัปโหลด ({evidence.length} รายการ)
            </h2>

            {evidence.length === 0 ? (
              <div className="py-12 text-center text-mp-ink-muted">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">ไม่พบเอกสารที่อัปโหลด</p>
                <p className="text-xs opacity-80 mt-1">อาจเป็นเพราะ Session หมดอายุแล้ว หรือ Vendor ยังทำไม่จบทุกขั้นตอน</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {evidence.map((e, idx) => (
                  <button
                    key={e.id}
                    onClick={() => setLightboxIdx(idx)}
                    className="group relative block overflow-hidden rounded-xl border border-mp-border bg-mp-cream/30 hover:border-mp-coral hover:shadow-md transition-all text-left"
                  >
                    {e.mime.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.url}
                        alt={e.label}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center bg-gray-100 text-xs text-mp-ink-muted">
                        {e.mime}
                      </div>
                    )}
                    <div className="p-2.5 border-t border-mp-border/50">
                      <p className="text-xs font-semibold text-mp-ink truncate">{e.label}</p>
                      <p className="text-[10px] text-mp-ink-muted mt-0.5">
                        {Math.round(e.bytes / 1024)} KB
                        {e.width && e.height ? ` · ${e.width}×${e.height}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
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
              download={`${evidence[lightboxIdx].step}.jpg`}
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

          {/* Image */}
          <div className="max-w-4xl max-h-[85vh] p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={evidence[lightboxIdx].url}
              alt={evidence[lightboxIdx].label}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
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
          <p className="text-sm text-gray-500 mb-6">
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
                      <tr key={key} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-semibold text-gray-600 w-40">{label}</td>
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
              <span className="text-xs text-gray-500">
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
              <div className="text-center py-20 text-gray-400">
                ไฟล์ {e.mime} — ไม่สามารถแสดงภาพตัวอย่างได้
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2 text-center">
              {vendor.name} · {e.step} · {Math.round(e.bytes / 1024)} KB
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
