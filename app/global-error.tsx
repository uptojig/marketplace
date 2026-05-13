"use client";

// app/global-error.tsx — only renders when the root layout itself
// throws, so app/error.tsx never gets a chance to catch the error.
// Must declare its own <html> + <body> for that reason (the failed
// root layout isn't around to wrap them in).

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="th">
      <body
        style={{
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          textAlign: "center",
          background: "#fff",
          color: "#0a0a0a",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", margin: 0, fontWeight: 600 }}>
          เกิดข้อผิดพลาดร้ายแรง
        </h1>
        <p
          style={{
            marginTop: "0.75rem",
            maxWidth: "28rem",
            fontSize: "0.875rem",
            color: "#52525b",
          }}
        >
          ระบบไม่สามารถโหลดหน้าได้ ลองรีโหลดอีกครั้งหรือกลับมาทีหลัง
          ถ้ายังเจอปัญหาเดิม ติดต่อทีมงานพร้อมรหัสด้านล่าง
        </p>
        {error.digest && (
          <p
            style={{
              marginTop: "0.5rem",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: "0.75rem",
              color: "#71717a",
            }}
          >
            error id: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.375rem",
            border: "1px solid #18181b",
            background: "#18181b",
            color: "#fff",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          ลองอีกครั้ง
        </button>
      </body>
    </html>
  );
}
