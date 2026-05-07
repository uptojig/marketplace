"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { generateStorefront } from "./actions";
import { COMPONENT_REGISTRY } from "@/components/BlockRegistry";
import type { PageData, BlockType } from "@/lib/landing-schema";


export default function CreateStorePage() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [running, setRunning] = useState(false);
  const [schema, setSchema] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || running) return;

    setRunning(true);
    setSchema(null);
    setError(null);

    try {
      const data = await generateStorefront(prompt.trim());
      setSchema(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างหน้าร้าน");
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
        <button type="submit" disabled={running || !prompt.trim()} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้าง (อาจใช้เวลา 20-30 วินาที)...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> สร้างหน้าร้าน
            </>
          )}
        </button>
      </form>

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
                {schema.title} • family: <code>{schema.designFamily ?? "?"}</code> • {schema.blocks.length} blocks
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-zinc-50 overflow-hidden shadow-sm" style={schema.themeColor ? { "--primary": schema.themeColor } as React.CSSProperties : {}}>
            {schema.blocks.map((block, index) => {
              const Component = COMPONENT_REGISTRY[block.type as BlockType];
              if (!Component) return null;
              return <Component key={index} {...block.props} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
