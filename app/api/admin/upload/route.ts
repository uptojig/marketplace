/**
 * Image upload endpoint for admin / dashboard forms.
 *
 * Operator picks a file in the browser → multipart upload here → we
 * PUT it to DigitalOcean Spaces (S3-compatible) → return the public
 * URL → the form writes that URL into store.logoUrl / store.bannerUrl.
 *
 * Required env (set in `.env` next to docker-compose.yml, then
 * `docker compose up -d` to restart): SPACES_ENDPOINT, SPACES_REGION,
 * SPACES_BUCKET, SPACES_KEY, SPACES_SECRET. Without them we 503 with
 * a helpful message so the form renders an inline error rather than
 * uploading silently into the void.
 *
 * Auth: requires ADMIN role OR the caller to be a store owner. The
 * uploaded URL is public regardless of who uploaded it (Spaces ACL
 * is public-read — the URL itself is the capability).
 *
 * Validation:
 *   - Content-Type: image/* (png, jpg, webp, gif, svg)
 *   - Max size: 5MB (configurable via UPLOAD_MAX_BYTES)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isSpacesConfigured,
  uploadBuffer,
  SpacesNotConfiguredError,
} from "@/lib/storage/spaces";

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
  if (me.role !== "ADMIN" && !me.store) {
    return { ok: false, status: 403, error: "ไม่มีสิทธิ์อัพโหลด" };
  }
  return { ok: true };
}

export async function POST(req: Request) {
  if (!isSpacesConfigured()) {
    return NextResponse.json(
      {
        error: "spaces_not_configured",
        detail:
          "SPACES_ENDPOINT / SPACES_BUCKET / SPACES_KEY / SPACES_SECRET are not set. Add them to .env (next to docker-compose.yml) then `docker compose up -d` to restart.",
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

  // Folder per content kind so the URL is self-describing in admin
  // debugging (logo/..., banner/..., product/...). Default "misc" if
  // absent. The Spaces helper randomizes the leaf filename so name
  // collisions are impossible regardless of caller-supplied input.
  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") ?? "misc").replace(/[^a-z0-9-]/gi, "");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { publicUrl } = await uploadBuffer({
      prefix: kind || "misc",
      filename: file.name,
      contentType: file.type,
      body: buffer,
    });
    return NextResponse.json({
      ok: true,
      url: publicUrl,
      size: file.size,
    });
  } catch (err) {
    if (err instanceof SpacesNotConfiguredError) {
      return NextResponse.json(
        { error: "spaces_not_configured" },
        { status: 503 },
      );
    }
    console.error("[upload] spaces put failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message.slice(0, 500) : "upload_failed",
      },
      { status: 500 },
    );
  }
}
