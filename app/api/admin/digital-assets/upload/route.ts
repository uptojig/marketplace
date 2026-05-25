/**
 * POST /api/admin/digital-assets/upload
 *
 * Admin-only endpoint to attach a downloadable file to a digital product.
 * The file is uploaded to DO Spaces as PRIVATE (no public-read ACL) — the
 * storageKey alone never serves it; buyers must hit
 * /api/digital/download/[unlockId]/[assetId] which checks the unlock then
 * 302's to a short-lived presigned URL.
 *
 * Request: multipart/form-data
 *   productId   string  — product to attach to (must be DIGITAL)
 *   file        File    — binary, ≤ 100 MB (cap below)
 *   isPreview?  "true" | "false" — public sample vs locked asset
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBuffer, isSpacesConfigured } from "@/lib/storage/spaces";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

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
      {
        error:
          "Object storage not configured — set SPACES_ENDPOINT / SPACES_BUCKET / SPACES_KEY / SPACES_SECRET in env",
      },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const productId = String(form.get("productId") ?? "");
  const file = form.get("file");
  const isPreview = String(form.get("isPreview") ?? "false") === "true";

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, productType: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.productType !== "DIGITAL") {
    return NextResponse.json(
      { error: "Product must be type=DIGITAL to attach assets" },
      { status: 422 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const fileName = file.name || "file.bin";
  const fileFormat = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  const fileSizeMB = +(file.size / 1024 / 1024).toFixed(2);

  const { key } = await uploadBuffer({
    prefix: `digital-assets/${productId}`,
    filename: fileName,
    contentType: file.type || "application/octet-stream",
    body,
    private: true,
  });

  const asset = await prisma.digitalAsset.create({
    data: {
      productId,
      fileName,
      fileFormat,
      fileSizeMB,
      storageKey: key,
      isPreview,
    },
    select: {
      id: true,
      fileName: true,
      fileFormat: true,
      fileSizeMB: true,
      storageKey: true,
      isPreview: true,
    },
  });

  return NextResponse.json({ asset });
}
