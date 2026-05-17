"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FacingMode = "user" | "environment";

interface CameraState {
  stream: MediaStream | null;
  status: "idle" | "requesting" | "ready" | "error";
  errorCode: "denied" | "notfound" | "unavailable" | "other" | null;
  errorMessage: string | null;
}

interface UseCameraResult extends CameraState {
  start: (facing: FacingMode) => Promise<void>;
  stop: () => void;
  switchFacing: () => Promise<void>;
  facing: FacingMode;
}

// getUserMedia stream from front camera is RAW (not mirrored).
// Browsers leave mirroring as a CSS/canvas concern — see WebRTC spec.
// We use `ideal` (not `exact`) so desktops without rear cameras still work.
function buildConstraints(facing: FacingMode): MediaStreamConstraints {
  return {
    audio: false,
    video: {
      facingMode: { ideal: facing },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  };
}

function classifyError(err: unknown): {
  code: CameraState["errorCode"];
  message: string;
} {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      return {
        code: "denied",
        message: "ไม่ได้รับสิทธิ์เข้าถึงกล้อง โปรดอนุญาตในตั้งค่าเบราว์เซอร์",
      };
    }
    if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
      return { code: "notfound", message: "ไม่พบกล้องที่ใช้งานได้" };
    }
    if (err.name === "NotReadableError") {
      return {
        code: "unavailable",
        message: "กล้องถูกใช้งานโดยแอปอื่น โปรดปิดแล้วลองใหม่",
      };
    }
  }
  const message = err instanceof Error ? err.message : String(err);
  return { code: "other", message };
}

export function useCamera(): UseCameraResult {
  const [facing, setFacing] = useState<FacingMode>("user");
  const [state, setState] = useState<CameraState>({
    stream: null,
    status: "idle",
    errorCode: null,
    errorMessage: null,
  });

  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      streamRef.current = null;
    }
    setState({ stream: null, status: "idle", errorCode: null, errorMessage: null });
  }, []);

  const start = useCallback(async (next: FacingMode) => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState({
        stream: null,
        status: "error",
        errorCode: "unavailable",
        errorMessage: "เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้อง",
      });
      return;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }

    setState((prev) => ({ ...prev, status: "requesting", errorCode: null, errorMessage: null }));
    setFacing(next);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(buildConstraints(next));
      streamRef.current = stream;
      setState({ stream, status: "ready", errorCode: null, errorMessage: null });
    } catch (err) {
      const { code, message } = classifyError(err);
      setState({ stream: null, status: "error", errorCode: code, errorMessage: message });
    }
  }, []);

  const switchFacing = useCallback(async () => {
    await start(facing === "user" ? "environment" : "user");
  }, [facing, start]);

  // iOS Safari: when device rotates, stream tracks can stop reporting frames.
  // Restart on orientationchange to recover. We re-acquire with the current facing.
  useEffect(() => {
    function handleOrientation() {
      if (state.status === "ready") {
        start(facing).catch(() => {
          /* re-acquire failure handled by start() state update */
        });
      }
    }
    window.addEventListener("orientationchange", handleOrientation);
    return () => window.removeEventListener("orientationchange", handleOrientation);
  }, [facing, start, state.status]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = null;
      }
    };
  }, []);

  return { ...state, facing, start, stop, switchFacing };
}
