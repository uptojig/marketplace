/**
 * POST /api/store/digital-assets/upload
 *
 * Store-owner equivalent of /api/admin/digital-assets/upload. Lets a
 * vendor attach a downloadable file to their OWN digital product (or an
 * admin to any). Same Spaces-private upload semantics: the storageKey
 * never serves the file directly — buyers go through
 * /api/digital/download/[unlockId]/[assetId] which checks the unlock
 * then 302's to a short-lived presigned URL.
 *
 * Request: multipart/form-data
 *   productId   string  — product to attach to (must be DIGITAL + owned)
 *   file        File    — binary, ≤ 100 MB
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

/** Authorize the session user against the product's store: ADMIN may
 *  touch any product, otherwise the user must own the product's store.
 *  Returns the product (with type) on success, or a NextResponse error. */
async function authorizeProduct(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, productType: true, store: { select: { ownerId: true } } },
  });
  if (!product || !product.store) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  if (user.role !== "ADMIN" && product.store.ownerId !== user.id) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { product };
}

export async function POST(req: Request) {
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

  const auth = await authorizeProduct(productId);
  if ("error" in auth) return auth.error;

  if (auth.product.productType !== "DIGITAL") {
    return NextResponse.json(
      { error: "Product must be type=DIGITAL to attach assets" },
      { status: 422 },
    );
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
      isPreview: true,
    },
  });

  return NextResponse.json({ asset });
}
