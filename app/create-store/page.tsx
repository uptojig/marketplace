"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { BlockRenderer } from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import type { AgentEvent, GeneratedPageSchema } from "@/lib/agent-service";

interface ProgressLine {
  label: string;
  detail?: string;
}

function eventToProgress(event: AgentEvent): ProgressLine | null {
  switch (event.type) {
    case "_session":
      return { label: "เริ่ม session", detail: (event as { id: string }).id };
    case "_schema":
      return { label: "ได้ schema สำเร็จ ✓" };
    case "_done":
      return { label: "เสร็จสิ้น" };
    case "_error":
      return {
        label: "เกิดข้อผิดพลาด",
        detail: (event as { message?: string }).message,
      };
    case "agent.message_text":
      return { label: "agent กำลังคิด..." };
    case "agent.custom_tool_use":
      return {
        label: `เรียก tool: ${(event as { tool_name?: string; name?: string }).tool_name ?? (event as { name?: string }).name ?? "?"}`,
      };
    default:
      return null;
  }
}

export default function CreateStorePage() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ProgressLine[]>([]);
  const [schema, setSchema] = useState<GeneratedPageSchema | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || running) return;

    setRunning(true);
    setProgress([]);
    setSchema(null);
    setError(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ...(title.trim() ? { title: title.trim() } : {}),
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        setError(text || `HTTP ${res.status}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let evt: AgentEvent;
          try {
            evt = JSON.parse(trimmed) as AgentEvent;
          } catch {
            continue;
          }
          if (evt.type === "_schema") {
            setSchema((evt as { schema: GeneratedPageSchema }).schema);
          } else if (evt.type === "_error") {
            setError((evt as { message?: string }).message ?? "stream error");
          }
          const p = eventToProgress(evt);
          if (p) setProgress((prev) => [...prev, p]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">สร้างหน้าร้านด้วย AI</h1>
        <p className="text-sm text-muted-foreground">
          พิมพ์ prompt อธิบายร้านที่อยากได้ — agent จะ generate landing page ให้ทันที
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">ชื่อร้าน (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pet Love Store"
            className="w-full rounded-md border px-3 py-2 text-sm"
            maxLength={200}
            disabled={running}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Prompt <span className="text-xs text-gray-400">({prompt.length}/8000)</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="ทำหน้าร้านขายของน้องหมา น้องแมว สไตล์น่ารัก โทนสีชมพู..."
            rows={4}
            maxLength={8000}
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
            disabled={running}
          />
        </div>
        <Button type="submit" disabled={running || !prompt.trim()}>
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้าง...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> สร้าง
            </>
          )}
        </Button>
      </form>

      {progress.length > 0 && (
        <div className="rounded-lg border bg-white p-4 text-xs">
          <p className="mb-2 font-semibold">ความคืบหน้า</p>
          <ul className="space-y-1 text-gray-700">
            {progress.map((p, i) => (
              <li key={i} className="font-mono">
                <span className="text-gray-500">{i + 1}.</span> {p.label}
                {p.detail && <span className="text-gray-400"> — {p.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {schema && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Preview</h2>
              <p className="text-xs text-muted-foreground">
                {schema.title} • family: <code>{schema.designFamily ?? schema.themeVariant ?? "?"}</code> • {schema.blocks.length} blocks
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <BlockRenderer schema={schema} />
          </div>
          {schema.reasoning && (
            <details className="rounded-md border bg-gray-50 p-3 text-xs">
              <summary className="cursor-pointer font-medium">เหตุผลของ agent</summary>
              <p className="mt-2 whitespace-pre-line text-gray-700">{schema.reasoning}</p>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
