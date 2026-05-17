"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VerificationResult } from "@/lib/kyc/run-verification";
import {
  LiveSelfieCapture,
  type CapturedSelfie,
} from "./live-selfie-capture";

const MAX_ID_BYTES = 10 * 1024 * 1024;
const MAX_SELFIE_BYTES = 2 * 1024 * 1024;
const MIN_SELFIE_WIDTH = 600;
const MIN_SELFIE_HEIGHT = 400;
const THAI_ID_ASPECT = 85.6 / 53.98;
const HELD_ID_CROP_WIDTH_RATIO = 0.68;
const HELD_ID_CROP_CENTER_Y_RATIO = 0.735;
const HELD_ID_CROP_OUTPUT_WIDTH = 1200;
const HELD_ID_CROP_JPEG_QUALITY = 0.94;
const DEFAULT_MAX_SELFIE_ATTEMPTS = 3;
const COST_PER_IC_THB = 1.25;

const FAILED_CHECK_LABELS: Record<string, string> = {
  checksum_invalid: "เลขบัตรประชาชนไม่ถูกต้อง (checksum)",
  id_expired: "บัตรประชาชนหมดอายุ",
  spoof_detected: "ตรวจพบการปลอมแปลง (spoof)",
  face_mismatch: "ใบหน้าไม่ตรงกับบัตร",
  face_mismatch_retry: "ใบหน้าไม่ตรงกับบัตร — ลองอัปโหลดใหม่",
  face_mismatch_with_document_evidence: "ใบหน้าไม่ตรงกับบัตร (มีหลักฐานเอกสาร)",
  retake_selfie_required: "กรุณาถ่าย selfie ใหม่ให้ชัด",
  liveness_failed_after_retries: "ตรวจสอบความมีชีวิตไม่ผ่านหลายครั้ง",
  held_id_unreadable: "ระบบมองไม่เห็นบัตรประชาชนใน selfie — ต้องถือบัตรคู่กับใบหน้า",
  held_id_unreadable_after_retries: "ไม่เห็นบัตรใน selfie หลังจากพยายามหลายครั้ง",
  held_id_number_mismatch: "เลขบัตรใน selfie ไม่ตรงกับบัตรที่อัปโหลด",
  held_id_name_mismatch: "ชื่อในบัตรที่ถือไม่ตรงกับบัตรที่อัปโหลด",
};

function labelFailed(check: string): string {
  return FAILED_CHECK_LABELS[check] ?? check;
}

// iApp returns business-logic errors in the response body, e.g.
//   "iApp /v3/store/ekyc/thai-national-id-card/front failed 420:
//    {"detection_score":0.0,"error_message":"NO_ID_CARD_FOUND",...}"
// Pull out the error_message and map known codes to friendly Thai.
const IAPP_ERROR_LABELS: Record<string, string> = {
  NO_ID_CARD_FOUND: "ไม่พบบัตรประชาชนในรูป selfie",
  NO_FACE_FOUND: "ไม่พบใบหน้าในรูป",
  IMAGE_ERROR_UNSUPPORTED_FORMAT: "รูปแบบไฟล์ไม่รองรับ",
  INVALID_IMAGE_SIZE: "ขนาดรูปไม่ถูกต้อง",
  FILE_TOO_LARGE: "ไฟล์ใหญ่เกินกำหนด",
  NO_FILE_ATTACHED: "ไม่ได้แนบไฟล์",
  SERVER_BUSY: "เซิร์ฟเวอร์ iApp กำลังหนาแน่น",
  LONG_TIME_TO_PROCESS: "ประมวลผลนานเกินกำหนด",
};

function parseIappError(rawError: string): string {
  const match = rawError.match(/"error_message"\s*:\s*"([^"]+)"/);
  const httpMatch = rawError.match(/failed (\d{3})/);
  if (match) {
    const code = match[1];
    const friendly = IAPP_ERROR_LABELS[code];
    return friendly ? `${friendly} (${code})` : code;
  }
  if (httpMatch) return `iApp HTTP ${httpMatch[1]}`;
  return rawError.length > 80 ? rawError.slice(0, 80) + "…" : rawError;
}

type Tone = "normal" | "info" | "success" | "warn" | "error";

interface SelfieMeta {
  image_width: number;
  image_height: number;
  file_size: number;
  captured_at: string;
}

interface StepState {
  ocr: "pending" | "running" | "done";
  liveness: "pending" | "running" | "done";
  verify: "pending" | "running" | "done";
  held_ocr: "pending" | "running" | "done";
}

interface ApiResponse {
  ok: boolean;
  result?: VerificationResult;
  error?: string;
}

function loadImageDimensionsFromFile(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const dims = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ไม่สามารถอ่านขนาดรูป selfie ได้"));
    };
    image.src = url;
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ไม่สามารถอ่านรูปเพื่อ crop บัตรได้"));
    };
    image.src = url;
  });
}

async function createHeldIdCropFromSelfie(file: File): Promise<File> {
  const image = await loadImageFromFile(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const cropWidth = Math.min(sourceWidth, Math.round(sourceWidth * HELD_ID_CROP_WIDTH_RATIO));
  const cropHeight = Math.min(sourceHeight, Math.round(cropWidth / THAI_ID_ASPECT));
  const cropX = Math.max(0, Math.min(sourceWidth - cropWidth, Math.round((sourceWidth - cropWidth) / 2)));
  const targetCenterY = Math.round(sourceHeight * HELD_ID_CROP_CENTER_Y_RATIO);
  const cropY = Math.max(0, Math.min(sourceHeight - cropHeight, targetCenterY - Math.round(cropHeight / 2)));
  const outputWidth = Math.max(HELD_ID_CROP_OUTPUT_WIDTH, cropWidth);
  const outputHeight = Math.round(outputWidth / THAI_ID_ASPECT);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", HELD_ID_CROP_JPEG_QUALITY);
  });
  if (!blob) throw new Error("สร้างรูป crop บัตรจาก selfie ไม่สำเร็จ");
  return new File([blob], `selfie-held-id-crop-${Date.now()}.jpg`, { type: "image/jpeg" });
}

function formatThaiBuddhistDateFromEnglish(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function decisionStyle(decision: VerificationResult["decision"] | undefined) {
  switch (decision) {
    case "AUTO_APPROVED":
      return {
        wrap: "border-green-400 bg-green-50",
        text: "text-green-800",
        icon: "✅",
        label: "AUTO APPROVED",
      };
    case "RETRY_SELFIE":
      return {
        wrap: "border-yellow-400 bg-yellow-50",
        text: "text-yellow-800",
        icon: "⚠",
        label: "RETRY UPLOAD",
      };
    case "REJECTED":
      return {
        wrap: "border-red-400 bg-red-50",
        text: "text-red-800",
        icon: "❌",
        label: "REJECTED",
      };
    default:
      return {
        wrap: "border-slate-300 bg-slate-50",
        text: "text-slate-800",
        icon: "•",
        label: decision ?? "",
      };
  }
}

function ScoreBar({
  label,
  value,
  threshold = 0.85,
}: {
  label: string;
  value: number;
  threshold?: number;
}) {
  const pct = Math.round(value * 100);
  const passed = value >= threshold;
  const color = passed ? "bg-green-500" : value >= 0.5 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">
          {value.toFixed(3)} {passed ? "✓" : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const TONE_CLASS: Record<Tone, string> = {
  normal: "text-muted-foreground",
  info: "text-blue-600",
  success: "text-emerald-700",
  warn: "text-amber-700",
  error: "text-red-700",
};

export default function KycTestForm() {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfieMeta, setSelfieMeta] = useState<SelfieMeta | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [selfieHeldIdCropFile, setSelfieHeldIdCropFile] = useState<File | null>(null);
  const [selfieHeldIdCropPreviewUrl, setSelfieHeldIdCropPreviewUrl] = useState<string | null>(null);
  const [selfieHeldIdCropStatus, setSelfieHeldIdCropStatus] = useState({
    message: "หลังอัปโหลด selfie ระบบจะ crop เฉพาะบัตรเพื่อส่ง OCR แยกจากรูปหน้า",
    tone: "info" as Tone,
  });
  const [selfieAttempt, setSelfieAttempt] = useState(1);
  const [maxSelfieAttempts] = useState(DEFAULT_MAX_SELFIE_ATTEMPTS);
  const [selfieStatus, setSelfieStatus] = useState({
    message: "อัปโหลด selfie ที่ถือบัตรประชาชนคู่กับใบหน้า (บังคับ — ทั้ง 4 มุมของบัตรต้องเห็นชัด)",
    tone: "info" as Tone,
  });

  const [scenario, setScenario] = useState("web-test");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<StepState | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement | null>(null);
  const selfieInputRef = useRef<HTMLInputElement | null>(null);
  const selfieHeldIdCropInputRef = useRef<HTMLInputElement | null>(null);

  function revokePreview(url: string | null) {
    if (url) URL.revokeObjectURL(url);
  }

  const [idError, setIdError] = useState<string | null>(null);

  function handleIdFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setIdError("รองรับเฉพาะไฟล์รูปภาพสำหรับบัตรประชาชน");
      return;
    }
    if (file.size > MAX_ID_BYTES) {
      setIdError(
        `รูปบัตรประชาชนใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(2)} MB) — สูงสุด 10 MB`,
      );
      return;
    }
    setIdError(null);
    revokePreview(idPreviewUrl);
    setIdFile(file);
    setIdPreviewUrl(URL.createObjectURL(file));
  }

  const [flipping, setFlipping] = useState(false);

  async function flipSelfieHorizontal() {
    if (!selfieFile) return;
    setFlipping(true);
    const objectUrl = URL.createObjectURL(selfieFile);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("ไม่สามารถโหลดรูป selfie ได้"));
        i.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);

      const mimeType = selfieFile.type || "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), mimeType, 0.95);
      });
      if (!blob) throw new Error("สร้างไฟล์พลิกไม่สำเร็จ");

      if (blob.size > MAX_SELFIE_BYTES) {
        setSelfieStatus({
          message: `รูปหลังพลิกใหญ่เกิน 2 MB (${(blob.size / 1024 / 1024).toFixed(2)} MB) — ลองใช้รูปเล็กลง`,
          tone: "error",
        });
        return;
      }

      const flippedFile = new File([blob], selfieFile.name, { type: mimeType });
      revokePreview(selfiePreviewUrl);
      setSelfieFile(flippedFile);
      setSelfiePreviewUrl(URL.createObjectURL(flippedFile));
      setSelfieMeta((prev) =>
        prev ? { ...prev, file_size: flippedFile.size } : prev,
      );
      setSelfieStatus({
        message: `พลิกซ้าย-ขวาแล้ว (${(flippedFile.size / 1024).toFixed(1)} KB) — ตรวจว่าข้อความบนบัตรอ่านออกหรือยัง`,
        tone: "success",
      });
      await prepareHeldIdCrop(flippedFile, "auto");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSelfieStatus({ message: `พลิกไม่สำเร็จ: ${msg}`, tone: "error" });
    } finally {
      URL.revokeObjectURL(objectUrl);
      setFlipping(false);
    }
  }

  function commitSelfieFile(
    file: File,
    width: number,
    height: number,
    source: "upload" | "live",
  ) {
    revokePreview(selfiePreviewUrl);
    setSelfieFile(file);
    setSelfiePreviewUrl(URL.createObjectURL(file));
    setSelfieMeta({
      image_width: width,
      image_height: height,
      file_size: file.size,
      captured_at: new Date().toISOString(),
    });
    setSelfieStatus({
      message:
        source === "live"
          ? `ถ่ายจากกล้องสำเร็จ (${width}x${height}, ${(file.size / 1024).toFixed(1)} KB) — ตัวอักษรบนบัตรเป็น raw จากกล้อง ไม่ต้อง flip`
          : `อัปโหลด selfie สำเร็จ (${width}x${height}, ${(file.size / 1024).toFixed(1)} KB)`,
      tone: "success",
    });
  }

  async function prepareHeldIdCrop(file: File, source: "auto" | "manual") {
    try {
      setSelfieHeldIdCropStatus({
        message: source === "auto" ? "กำลัง crop เฉพาะบัตรจาก selfie..." : "กำลังอ่านรูป crop บัตร...",
        tone: "info",
      });
      const cropFile = source === "auto" ? await createHeldIdCropFromSelfie(file) : file;
      if (cropFile.size > MAX_ID_BYTES) {
        setSelfieHeldIdCropStatus({
          message: `รูป crop บัตรใหญ่เกินไป (${(cropFile.size / 1024 / 1024).toFixed(2)} MB) — สูงสุด 10 MB`,
          tone: "error",
        });
        return;
      }
      revokePreview(selfieHeldIdCropPreviewUrl);
      setSelfieHeldIdCropFile(cropFile);
      setSelfieHeldIdCropPreviewUrl(URL.createObjectURL(cropFile));
      setSelfieHeldIdCropStatus({
        message:
          source === "auto"
            ? `crop บัตรจาก selfie แล้ว (${(cropFile.size / 1024).toFixed(1)} KB) — ตรวจ preview ว่าเห็นบัตรเต็มใบก่อนทดสอบ`
            : `ใช้รูป crop บัตรที่เลือกแล้ว (${(cropFile.size / 1024).toFixed(1)} KB)`,
        tone: "success",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSelfieHeldIdCropFile(null);
      revokePreview(selfieHeldIdCropPreviewUrl);
      setSelfieHeldIdCropPreviewUrl(null);
      setSelfieHeldIdCropStatus({
        message: `สร้าง crop บัตรไม่สำเร็จ: ${msg}`,
        tone: "error",
      });
    }
  }

  async function handleManualHeldIdCropFile(file: File | null | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      setSelfieHeldIdCropStatus({ message: "รองรับเฉพาะไฟล์รูปภาพสำหรับ crop บัตร", tone: "warn" });
      return;
    }
    await prepareHeldIdCrop(file, "manual");
  }

  async function handleSelfieFile(file: File | null | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      setSelfieStatus({ message: "รองรับเฉพาะไฟล์รูปภาพสำหรับ selfie", tone: "warn" });
      return;
    }
    if (file.size > MAX_SELFIE_BYTES) {
      setSelfieStatus({
        message: `รูป selfie ใหญ่เกินไป (${file.size} bytes) สูงสุด ${MAX_SELFIE_BYTES} bytes`,
        tone: "error",
      });
      return;
    }
    try {
      const { width, height } = await loadImageDimensionsFromFile(file);
      if (width < MIN_SELFIE_WIDTH || height < MIN_SELFIE_HEIGHT) {
        setSelfieStatus({
          message: `รูป selfie เล็กเกินไป (${width}x${height}) ต้องอย่างน้อย ${MIN_SELFIE_WIDTH}x${MIN_SELFIE_HEIGHT}`,
          tone: "error",
        });
        return;
      }
      commitSelfieFile(file, width, height, "upload");
      await prepareHeldIdCrop(file, "auto");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSelfieStatus({ message: `อัปโหลดรูปไม่สำเร็จ: ${msg}`, tone: "error" });
    }
  }

  function handleLiveCapture(captured: CapturedSelfie) {
    commitSelfieFile(captured.file, captured.width, captured.height, "live");
  }

  function clearSelfie(resetAttempt = false) {
    revokePreview(selfiePreviewUrl);
    revokePreview(selfieHeldIdCropPreviewUrl);
    setSelfieFile(null);
    setSelfieMeta(null);
    setSelfiePreviewUrl(null);
    setSelfieHeldIdCropFile(null);
    setSelfieHeldIdCropPreviewUrl(null);
    setSelfieHeldIdCropStatus({
      message: "หลังอัปโหลด selfie ระบบจะ crop เฉพาะบัตรเพื่อส่ง OCR แยกจากรูปหน้า",
      tone: "info",
    });
    if (selfieInputRef.current) selfieInputRef.current.value = "";
    if (selfieHeldIdCropInputRef.current) selfieHeldIdCropInputRef.current.value = "";
    if (resetAttempt) setSelfieAttempt(1);
  }

  function clearAll() {
    revokePreview(idPreviewUrl);
    setIdFile(null);
    setIdPreviewUrl(null);
    setIdError(null);
    if (idInputRef.current) idInputRef.current.value = "";
    clearSelfie(true);
    setResult(null);
    setSteps(null);
    setServerError(null);
    setSelfieStatus({
      message: "อัปโหลด selfie ที่ถือบัตรประชาชนคู่กับใบหน้า (บังคับ — ทั้ง 4 มุมของบัตรต้องเห็นชัด)",
      tone: "info",
    });
  }

  function startRetry() {
    setResult(null);
    setSteps(null);
    setSelfieAttempt((n) => Math.min(maxSelfieAttempts, n + 1));
    clearSelfie();
    setSelfieStatus({
      message: `กรุณาอัปโหลดรูปใหม่ (${Math.min(maxSelfieAttempts, selfieAttempt + 1)}/${maxSelfieAttempts}) ให้เห็นหน้าและบัตรชัด`,
      tone: "warn",
    });
    selfieInputRef.current?.click();
  }

  async function runVerify() {
    if (!idFile || !selfieFile) return;
    setBusy(true);
    setResult(null);
    setServerError(null);
    setSteps({ ocr: "running", liveness: "pending", verify: "pending", held_ocr: "pending" });

    const form = new FormData();
    form.append("id", idFile);
    form.append("selfie", selfieFile);
    if (selfieHeldIdCropFile) form.append("selfie_held_id_crop", selfieHeldIdCropFile);
    form.append("scenario", scenario || "web-test");
    form.append("attempt_index", String(selfieAttempt));
    form.append("max_attempts", String(maxSelfieAttempts));
    if (selfieMeta) {
      form.append("image_width", String(selfieMeta.image_width));
      form.append("image_height", String(selfieMeta.image_height));
      form.append("file_size", String(selfieMeta.file_size));
      form.append("captured_at", selfieMeta.captured_at);
    }

    try {
      const res = await fetch("/api/kyc/verify", { method: "POST", body: form });
      const data: ApiResponse = await res.json();
      if (!data.ok || !data.result) {
        setServerError(data.error ?? "Unknown error");
        setSteps(null);
      } else {
        setSteps({ ocr: "done", liveness: "done", verify: "done", held_ocr: "done" });
        setResult(data.result);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setServerError(msg);
      setSteps(null);
    } finally {
      setBusy(false);
    }
  }

  const canVerify = idFile && selfieFile && !busy;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            บัตรประชาชน (ด้านหน้า, ชัดๆ)
          </label>
          <div
            className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-blue-400"
            onClick={() => idInputRef.current?.click()}
            onDragOver={(e: DragEvent) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
            }}
            onDragLeave={(e: DragEvent) => {
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
            }}
            onDrop={(e: DragEvent) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
              handleIdFile(e.dataTransfer.files?.[0]);
            }}
          >
            {idPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={idPreviewUrl}
                alt="id-preview"
                className="mx-auto max-h-64 rounded-lg"
              />
            ) : (
              <>
                <div className="mb-2 text-4xl">📤</div>
                <div className="text-sm text-muted-foreground">
                  คลิกหรือลากรูปบัตรประชาชนมาวาง
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  JPG, PNG, WEBP, HEIC — ไม่เกิน 10 MB
                </div>
              </>
            )}
            <input
              ref={idInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleIdFile(e.target.files?.[0])
              }
            />
          </div>
          {idError && (
            <p className="mt-2 text-xs text-red-700">{idError}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Selfie + <span className="text-red-600">ถือบัตรประชาชน (บังคับ)</span>
          </label>
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="mb-2 w-full">
              <TabsTrigger value="live">📷 ถ่ายสดจากกล้อง</TabsTrigger>
              <TabsTrigger value="upload">📤 อัปโหลดรูป</TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              <LiveSelfieCapture onCapture={handleLiveCapture} disabled={busy} />
              {selfiePreviewUrl && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    ภาพที่จะส่ง (raw จากเซ็นเซอร์ — ไม่ flip)
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selfiePreviewUrl}
                    alt="captured-selfie"
                    className="mx-auto max-h-48 rounded"
                  />
                  <p className={`mt-2 text-xs ${TONE_CLASS[selfieStatus.tone]}`}>
                    {selfieStatus.message}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload">
          <div className="rounded-xl border border-slate-300 bg-white p-4">
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              <div className="font-semibold">เงื่อนไขรูป selfie</div>
              <ul className="ml-4 mt-1 list-disc space-y-0.5">
                <li>ให้ใบหน้าอยู่ตรงกลางภาพ และถือบัตรใต้คางระดับหน้าอก</li>
                <li>ให้ขอบบน-ล่างของบัตรขนานกับกรอบ เห็นครบทั้ง 4 มุม และไม่บังหน้า</li>
                <li>อ่านเลขบัตรและชื่อบนบัตรในรูปได้</li>
                <li>ไม่บังใบหน้า / ไม่ใส่แว่นกันแดด / แสงพอ</li>
                <li>ขั้นต่ำ 600×400, สูงสุด 2 MB</li>
                <li>
                  ถ่ายด้วยกล้องหน้าโทรศัพท์ → ข้อความบนบัตรอาจกลับด้าน
                  ใช้ปุ่ม <strong>↔ พลิกซ้าย-ขวา</strong> ก่อนกดทดสอบ
                </li>
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-slate-900">
              {selfiePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selfiePreviewUrl}
                  alt="selfie-preview"
                  className="h-72 w-full object-cover"
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center text-sm text-slate-300">
                  ยังไม่ได้เลือกรูป selfie
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                variant="default"
                onClick={() => selfieInputRef.current?.click()}
              >
                เลือกรูป selfie
              </Button>
              <Button
                variant="outline"
                disabled={!selfieFile || flipping}
                onClick={flipSelfieHorizontal}
                title="พลิกซ้าย-ขวา (สำหรับกล้องหน้าที่ mirror ข้อความบนบัตร)"
              >
                {flipping ? "กำลังพลิก…" : "↔ พลิกซ้าย-ขวา"}
              </Button>
              <Button
                variant="secondary"
                disabled={!selfieFile}
                onClick={() => {
                  clearSelfie();
                  setSelfieStatus({
                    message: "ล้างรูปแล้ว สามารถเลือกรูป selfie ใหม่ได้",
                    tone: "info",
                  });
                }}
              >
                ล้างรูป
              </Button>
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleSelfieFile(e.target.files?.[0])
                }
              />
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    รูป crop บัตรจาก selfie ที่จะส่งให้ held-OCR
                  </div>
                  <p className={`mt-1 text-xs ${TONE_CLASS[selfieHeldIdCropStatus.tone]}`}>
                    {selfieHeldIdCropStatus.message}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!selfieFile}
                  onClick={() => selfieHeldIdCropInputRef.current?.click()}
                >
                  เลือก crop เอง
                </Button>
              </div>
              {selfieHeldIdCropPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selfieHeldIdCropPreviewUrl}
                  alt="selfie-held-id-crop-preview"
                  className="mx-auto max-h-40 rounded border bg-white object-contain"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
                  ยังไม่มี crop บัตรจาก selfie
                </div>
              )}
              <input
                ref={selfieHeldIdCropInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleManualHeldIdCropFile(e.target.files?.[0])
                }
              />
            </div>
            <p className={`mt-2 text-xs ${TONE_CLASS[selfieStatus.tone]}`}>
              {selfieStatus.message}
            </p>
          </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="scenario (เช่น web-test)"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <Button disabled={!canVerify} onClick={runVerify}>
          {busy ? "กำลังทดสอบ..." : "ทดสอบ KYC"}
        </Button>
        <Button variant="secondary" onClick={clearAll}>
          เคลียร์
        </Button>
      </section>

      {steps && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(
            [
              { key: "ocr", label: "1. OCR บัตรประชาชน" },
              { key: "liveness", label: "2. Liveness Check" },
              { key: "verify", label: "3. Face Verification" },
              { key: "held_ocr", label: "4. OCR บัตรใน Selfie" },
            ] as const
          ).map((s) => {
            const st = steps[s.key];
            const colors =
              st === "running"
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : st === "done"
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-slate-200 bg-white text-slate-400";
            const icon = st === "done" ? "✓" : st === "running" ? "•" : "·";
            return (
              <div
                key={s.key}
                className={`rounded-lg border-2 p-3 text-sm font-medium ${colors}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span>{s.label}</span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {serverError && (
        <section className="rounded-xl border-2 border-red-400 bg-red-50 p-6">
          <div className="mb-2 text-2xl font-bold text-red-800">Server Error</div>
          <pre className="font-mono text-sm whitespace-pre-wrap text-red-900">
            {serverError}
          </pre>
        </section>
      )}

      {result && <ResultPanel result={result} onRetry={startRetry} />}
    </div>
  );
}

function ResultPanel({
  result,
  onRetry,
}: {
  result: VerificationResult;
  onRetry: () => void;
}) {
  const r = result;
  const s = decisionStyle(r.decision);
  const b = r.breakdown;
  const held = b.held_id_from_selfie;
  const expiryDisplay =
    b.expiryTh ||
    formatThaiBuddhistDateFromEnglish(b.expiryRaw || b.expiryEn) ||
    b.expiryRaw ||
    b.expiryEn ||
    "-";

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border-2 p-6 ${s.wrap}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 text-4xl">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.text}`}>{s.label}</div>
            <div className={`mt-1 text-sm ${s.text}`}>
              Overall score: <span className="font-mono">{r.overall}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              attempt={r.capture.attempt_index}/{r.capture.max_attempts}
            </div>
            {r.failedChecks.length > 0 && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">
                  {r.decision === "RETRY_SELFIE" ? "Next step:" : "Failed checks:"}
                </span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.failedChecks.map((f) => (
                    <span
                      key={f}
                      className={`inline-block rounded px-2 py-0.5 text-xs ${
                        r.decision === "RETRY_SELFIE"
                          ? "bg-yellow-200 text-yellow-900"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {labelFailed(f)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {r.decision === "RETRY_SELFIE" && (
              <Button className="mt-4" variant="default" onClick={onRetry}>
                อัปโหลดใหม่
              </Button>
            )}
          </div>
          {r.face_from_card_base64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${r.face_from_card_base64}`}
              alt="face-from-card"
              className="h-32 w-32 rounded-lg border object-cover"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-4 font-semibold">Scores</h3>
          <ScoreBar label="OCR Confidence" value={b.ocr_confidence} threshold={0.9} />
          <ScoreBar
            label={`Liveness REAL (${b.liveness.predict})`}
            value={b.liveness.real_probability}
            threshold={0.9}
          />
          <ScoreBar
            label={`Face Match (${b.face_match.matched ? "MATCHED" : "NO MATCH"}, raw=${b.face_match.score.toFixed(1)}/thr=${b.face_match.threshold})`}
            value={b.face_match.normalized_score}
            threshold={0.5}
          />
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-4 font-semibold">
            OCR From Selfie{" "}
            <span
              className={`ml-2 rounded px-2 py-1 text-xs ${
                held.status === "ok"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {held.status === "ok" ? "readable" : "unreadable"}
            </span>
          </h3>
          <dl className="space-y-2 text-sm">
            <KvRow label="เลขบัตร" value={held.id_number ?? "-"} mono />
            <KvRow label="ชื่อ (ไทย)" value={held.th_name ?? "-"} />
            <KvRow label="Name (EN)" value={held.en_name ?? "-"} />
            <KvRow
              label="OCR Source"
              value={held.source === "selfie_card_crop" ? "crop บัตรจาก selfie" : "selfie ทั้งรูป"}
            />
            <KvRow label="ID Match" value={held.id_number_status} />
            <KvRow label="Name Match" value={held.name_status} />
            <KvRow
              label="OCR Confidence"
              value={held.ocr_confidence != null ? held.ocr_confidence.toFixed(3) : "-"}
            />
            {held.error && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                <div className="font-semibold">iApp held-OCR error</div>
                <div className="mt-0.5">{parseIappError(held.error)}</div>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-4 font-semibold">Extracted Data</h3>
          <dl className="space-y-2 text-sm">
            <KvRow label="เลขบัตร" value={b.id_number} mono />
            <KvRow label="ชื่อ (ไทย)" value={b.th_name ?? "-"} />
            <KvRow label="Name (EN)" value={b.en_name ?? "-"} />
            <KvRow
              label="วันหมดอายุ"
              value={`${expiryDisplay} ${b.notExpired ? "✓" : "EXPIRED"}`}
            />
            <KvRow label="Checksum" value={b.checksumValid ? "Valid" : "Invalid"} />
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold">Performance & Cost</h3>
          <div className="space-y-1.5 text-sm">
            <PerfRow label="OCR (ID)" ms={r.timings_ms.ocr} />
            <PerfRow label="Liveness" ms={r.timings_ms.liveness} />
            <PerfRow label="Face Verify" ms={r.timings_ms.verify} />
            <PerfRow label="OCR (Selfie)" ms={r.timings_ms.held_ocr} />
            <div className="mt-1.5 flex justify-between border-t pt-1.5 font-semibold">
              <span>Total</span>
              <span className="font-mono">{r.timings_ms.total} ms</span>
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold">
            {r.cost_ic}{" "}
            <span className="text-sm font-normal text-muted-foreground">IC</span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            ≈ {(parseFloat(r.cost_ic) * COST_PER_IC_THB).toFixed(2)} ฿
          </div>
        </div>
      </div>

      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          ดู raw JSON
        </summary>
        <pre className="mt-2 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
          {JSON.stringify(r, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function KvRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`col-span-2 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function PerfRow({ label, ms }: { label: string; ms: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{ms} ms</span>
    </div>
  );
}
