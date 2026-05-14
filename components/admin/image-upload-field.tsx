"use client";

/**
 * <ImageUploadField /> — paste-URL OR pick-from-disk input.
 *
 * Drop-in replacement for the bare URL `<input>`s in the admin /
 * dashboard store edit forms. Two side-by-side controls:
 *   - Text input  : paste a URL directly (pre-existing CDN asset,
 *                   placeholder image, etc.)
 *   - "อัพโหลด"   : opens the native file picker → POST to
 *                   /api/admin/upload?kind=<kind> → writes the
 *                   returned blob URL back into the same field.
 *
 * Live preview renders below at the configured aspect ratio. Errors
 * (size limit, content-type, SPACES_* env not configured) surface
 * inline so the operator knows which step failed.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

interface Props {
  value: string;
  onChange: (next: string) => void;
  /** Used in the blob URL prefix (`logo/...`, `banner/...`) so the
   *  operator can debug which form an asset came from. */
  kind?: string;
  placeholder?: string;
  /** Preview box dimensions. Defaults to 240×80 for a horizontal
   *  wordmark logo. Pass {width: 720, height: 240} for a banner. */
  previewWidth?: number;
  previewHeight?: number;
  /** When true the preview uses object-cover (good for banners that
   *  fill an aspect ratio); default false → object-contain (good for
   *  wordmark logos that need their full extents visible). */
  cover?: boolean;
}

function isImg(s: string) {
  if (!s) return false;
  return /\.(?:png|jpe?g|webp|gif|svg)(?:\?|$)/i.test(s) ||
    s.startsWith("data:image") ||
    s.startsWith("https://");
}

export function ImageUploadField({
  value,
  onChange,
  kind = "misc",
  placeholder = "https://...",
  previewWidth = 240,
  previewHeight = 80,
  cover = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/upload?kind=${encodeURIComponent(kind)}`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as
        | { ok: true; url: string }
        | { ok: false; error: string; detail?: string };
      if (!res.ok || !("ok" in data) || !data.ok) {
        const msg =
          "error" in data
            ? data.error +
              ("detail" in data && data.detail ? `: ${data.detail}` : "")
            : `HTTP ${res.status}`;
        setErr(msg);
        return;
      }
      onChange(data.url);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "upload failed");
    } finally {
      setUploading(false);
      // Reset the input so picking the same file again still fires onChange
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border px-3 py-2 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "กำลังอัพโหลด..." : "อัพโหลด"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={handlePick}
          className="hidden"
        />
      </div>

      {err && (
        <p className="text-xs text-destructive break-words">{err}</p>
      )}

      {isImg(value) && (
        <Image
          src={value}
          alt="Preview"
          width={previewWidth}
          height={previewHeight}
          className={`rounded border bg-base-200 p-2 ${
            cover ? "object-cover" : "object-contain"
          }`}
          unoptimized
        />
      )}
    </div>
  );
}
