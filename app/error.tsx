"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in dev consoles + whatever Vercel/Sentry pipes
    // pick up. `digest` lets ops correlate this client view with the
    // server-side log entry.
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-500" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        เกิดข้อผิดพลาด
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        ระบบเกิดข้อผิดพลาดชั่วคราว ลองอีกครั้งหรือกลับไปหน้าแรก
        ถ้ายังเจอปัญหาเดิม ติดต่อทีมงานพร้อมรหัสด้านล่าง
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          error id: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          ลองอีกครั้ง
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </Button>
      </div>
    </div>
  );
}
