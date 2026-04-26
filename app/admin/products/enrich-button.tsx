"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function EnrichButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("ดึงข้อมูลใหม่จาก CJ ทุกสินค้า (≤50 รายการ)? ใช้เวลาประมาณ 1 นาที")) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/products/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 50 }),
    });
    const data = await res.json();
    if (!res.ok) {
      setResult(`Error: ${data.error ?? "failed"}`);
    } else {
      setResult(`สำเร็จ ${data.succeeded}/${data.total} รายการ${data.failed ? ` (failed ${data.failed})` : ""}`);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "กำลังดึง..." : "ดึงข้อมูลจาก CJ"}
      </button>
    </div>
  );
}
