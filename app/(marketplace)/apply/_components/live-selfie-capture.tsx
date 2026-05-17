"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera, type FacingMode } from "@/lib/kyc/client/use-camera";
import { CardOverlay } from "./card-overlay";

const MAX_SELFIE_BYTES = 2 * 1024 * 1024;
const CAPTURE_JPEG_QUALITY = 0.92;

export interface CapturedSelfie {
  file: File;
  width: number;
  height: number;
}

interface LiveSelfieCaptureProps {
  onCapture: (selfie: CapturedSelfie) => void;
  disabled?: boolean;
}

export function LiveSelfieCapture({ onCapture, disabled }: LiveSelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const camera = useCamera();
  const [capturing, setCapturing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (camera.stream) {
      video.srcObject = camera.stream;
      video.play().catch(() => {
        /* autoplay may require user gesture; user can tap video */
      });
    } else {
      video.srcObject = null;
    }
  }, [camera.stream]);

  async function handleStart(facing: FacingMode) {
    setHint(null);
    await camera.start(facing);
  }

  async function handleCapture() {
    const video = videoRef.current;
    if (!video || !camera.stream || capturing) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setHint("กล้องยังไม่พร้อม รอสักครู่แล้วลองอีกครั้ง");
      return;
    }

    setCapturing(true);
    try {
      // Draw RAW video frame (no horizontal flip). The CSS mirror on the
      // preview is for the user's comfort only; the canvas reads the raw
      // sensor frame so text on the held ID card reads correctly.
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", CAPTURE_JPEG_QUALITY);
      });
      if (!blob) throw new Error("สร้างรูปจากกล้องไม่สำเร็จ");

      if (blob.size > MAX_SELFIE_BYTES) {
        setHint(
          `รูปใหญ่เกิน 2 MB (${(blob.size / 1024 / 1024).toFixed(2)} MB) — ลองถ่ายในที่แสงน้อยลงหรือเลื่อนออกจากกล้อง`,
        );
        return;
      }

      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture({ file, width: canvas.width, height: canvas.height });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setHint(`ถ่ายไม่สำเร็จ: ${msg}`);
    } finally {
      setCapturing(false);
    }
  }

  const isIdle = camera.status === "idle";
  const isError = camera.status === "error";
  const isReady = camera.status === "ready";
  const isRequesting = camera.status === "requesting";
  const mirrored = camera.facing === "user";

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4">
      <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[28px] bg-slate-900">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`h-full w-full object-cover ${
            mirrored ? "[transform:scaleX(-1)]" : ""
          }`}
        />

        {isReady && <CardOverlay />}

        {isReady && (
          <div className="absolute inset-x-0 bottom-5 flex items-center justify-center px-7 text-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || capturing}
              aria-label="เปิดแฟลช"
              className="absolute left-7 rounded-full bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Zap data-icon="inline-start" />
            </Button>

            <Button
              type="button"
              disabled={disabled || capturing}
              onClick={handleCapture}
              aria-label="ถ่าย selfie"
              className="size-16 rounded-full border-[7px] border-white/35 bg-white/75 p-0 text-slate-700 shadow-lg hover:bg-white"
            >
              <Camera data-icon="inline-start" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || capturing}
              onClick={() => camera.switchFacing()}
              aria-label={camera.facing === "user" ? "สลับเป็นกล้องหลัง" : "สลับเป็นกล้องหน้า"}
              className="absolute right-7 rounded-full border border-white/70 bg-black/10 text-white hover:bg-white/10 hover:text-white"
            >
              <Camera data-icon="inline-start" />
            </Button>
          </div>
        )}

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-slate-200">
            {isIdle && (
              <>
                <div className="text-4xl">📷</div>
                <div>กดเริ่มเพื่อเปิดกล้อง</div>
              </>
            )}
            {isRequesting && (
              <>
                <div className="text-4xl">⏳</div>
                <div>กำลังเปิดกล้อง...</div>
              </>
            )}
            {isError && (
              <div className="max-w-xs px-4 text-center text-red-200">
                <div className="mb-2 text-3xl">⚠</div>
                <div>{camera.errorMessage}</div>
                {camera.errorCode === "denied" && (
                  <div className="mt-2 text-xs text-slate-300">
                    เปิดสิทธิ์กล้องในแถบที่อยู่หรือตั้งค่าเบราว์เซอร์ แล้วกดเริ่มอีกครั้ง
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isReady ? (
          <Button
            disabled={disabled || isRequesting}
            onClick={() => handleStart(camera.facing)}
          >
            {isRequesting ? "กำลังเปิด..." : isError ? "ลองอีกครั้ง" : "เริ่มเปิดกล้อง"}
          </Button>
        ) : null}
      </div>

      {hint && <p className="mt-2 text-xs text-amber-700">{hint}</p>}
      {isReady && !hint && (
        <p className="mt-2 text-xs text-muted-foreground">
          กล้อง: {camera.facing === "user" ? "หน้า" : "หลัง"} —
          ภาพที่ส่งจะเป็นภาพจริงจากเซ็นเซอร์ (ตัวอักษรบนบัตรจะไม่กลับด้าน)
        </p>
      )}
    </div>
  );
}
