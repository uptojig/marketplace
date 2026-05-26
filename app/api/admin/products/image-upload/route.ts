/**
 * POST /api/admin/products/image-upload
 *
 * Admin-only endpoint to upload a product cover image to Spaces and
 * receive back a public URL the edit form can stick into the
 * `imageUrl` column.
 *
 * Public-ACL upload — unlike digital-asset uploads, the image is meant
 * to be served directly to anonymous storefront visitors via <img src>.
 *
 * Request: multipart/form-data
 *   productId?  string  — optional; used to namespace the Spaces prefix
 *   file        File    — image binary, ≤ 10 MB, MIME must start image/
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBuffer, isSpacesConfigured } from "@/lib/storage/spaces";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isSpacesConfigured()) {
    return NextResponse.json(
      { error: "Object storage not configured" },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const productId = String(form.get("productId") ?? "").trim();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `ไฟล์ใหญ่เกินไป (สูงสุด ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "อนุญาตเฉพาะภาพ JPG / PNG / WebP / GIF / AVIF" },
      { status: 415 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const fileName = file.name || "image.jpg";

  const { publicUrl } = await uploadBuffer({
    prefix: productId ? `product-images/${productId}` : "product-images/_misc",
    filename: fileName,
    contentType: file.type,
    body,
    // Default (private: false) sets public-read ACL — that's what we
    // want for storefront imagery.
  });

  return NextResponse.json({ url: publicUrl });
}
