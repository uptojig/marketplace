/**
 * Image upload endpoint for admin / dashboard forms.
 *
 * Operator picks a file in the browser → multipart upload to here
 * → we put it on Vercel Blob and return the public URL → the form
 * writes that URL into store.logoUrl / store.bannerUrl.
 *
 * Requires `BLOB_READ_WRITE_TOKEN` in the environment (auto-injected
 * by Vercel when you provision a Blob store; copy it to .env.local
 * for local dev). Without the token we 503 with a helpful message
 * so the form can render an inline error rather than uploading
 * silently into the void.
 *
 * Auth: requires ADMIN role OR the caller to be a store owner. The
 * uploaded URL is public regardless of who uploaded it (Blob URLs
 * are unguessable but unauthenticated by design — the URL itself
 * is the capability).
 *
 * Validation:
 *   - Content-Type: image/* (png, jpg, webp, gif, svg)
 *   - Max size: 5MB (configurable via UPLOAD_MAX_BYTES)
 *   - Filename sanitized to stop path traversal even though Blob
 *     SDK doesn't use the value as a path.
 */

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_BYTES = parseInt(
  process.env.UPLOAD_MAX_BYTES ?? String(5 * 1024 * 1024),
  10,
);

async function authorize(): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, status: 401, error: "ต้อง login ก่อน" };
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, store: { select: { id: true } } },
  });
  if (!me) return { ok: false, status: 401, error: "ไม่พบ user" };
  // ADMIN can upload for any store; store owners can upload for theirs.
  // Both end up on the same blob — auth here is just rate-limit / spam
  // prevention, not access control on the resulting URL.
  if (me.role !== "ADMIN" && !me.store) {
    return { ok: false, status: 403, error: "ไม่มีสิทธิ์อัพโหลด" };
  }
  return { ok: true };
}

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "blob_not_configured",
        detail:
          "BLOB_READ_WRITE_TOKEN is not set. Add a Vercel Blob store via the dashboard, then copy the env var to your project (and to .env.local for local dev).",
      },
      { status: 503 },
    );
  }

  const auth = await authorize();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `รูปแบบไฟล์ไม่รองรับ (${file.type})` },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `ไฟล์ใหญ่เกินไป (${Math.round(file.size / 1024)}KB > ${Math.round(MAX_BYTES / 1024)}KB)`,
      },
      { status: 413 },
    );
  }

  // Folder per content kind (operator passes ?kind=logo|banner|product
  // so the blob URL is self-describing in admin debugging). Default
  // "misc" if absent. Sanitize filename to letters/digits/dots/dashes
  // — Blob doesn't use the path as a filesystem path, but we still
  // don't want surprise unicode in URLs.
  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") ?? "misc").replace(/[^a-z0-9-]/gi, "");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const blobPath = `${kind}/${Date.now()}-${safeName}`;

  try {
    const blob = await put(blobPath, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });
    return NextResponse.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
    });
  } catch (err) {
    console.error("[upload] blob put failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message.slice(0, 500) : "upload_failed",
      },
      { status: 500 },
    );
  }
}
