import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { downloadBuffer, presignDownload, uploadBuffer } from "@/lib/storage/spaces";

interface ImageSize {
  width?: number;
  height?: number;
}

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function extensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "application/pdf": "pdf",
  };
  return map[mime.toLowerCase()] ?? "bin";
}

function readPngSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 24) return null;
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;
    if (marker >= 0xc0 && marker <= 0xc3 && offset + 8 < buffer.length) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function imageSize(buffer: Buffer, mime: string): ImageSize {
  if (mime.includes("png")) return readPngSize(buffer) ?? {};
  if (mime.includes("jpeg") || mime.includes("jpg")) return readJpegSize(buffer) ?? {};
  return {};
}

export async function uploadWizardEvidence(args: {
  sessionId: string;
  step: string;
  buffer: Buffer;
  mime: string;
  filename?: string;
  source?: "vendor_upload" | "system_generated";
  width?: number;
  height?: number;
}) {
  const detectedSize = imageSize(args.buffer, args.mime);
  const filename = args.filename ?? `${args.step}.${extensionFromMime(args.mime)}`;
  const uploaded = await uploadBuffer({
    prefix: `kyc/${args.sessionId}/${args.step}`,
    filename,
    contentType: args.mime,
    body: args.buffer,
  });

  return prisma.wizardEvidence.create({
    data: {
      sessionId: args.sessionId,
      step: args.step,
      storageKey: uploaded.key,
      sha256: sha256(args.buffer),
      bytes: args.buffer.length,
      mime: args.mime,
      width: args.width ?? detectedSize.width,
      height: args.height ?? detectedSize.height,
      source: args.source ?? "vendor_upload",
    },
  });
}

// Returns the most-recently-captured evidence for a session+step plus
// its raw image buffer. Used when a downstream wizard step needs to
// re-process an upload from an earlier step (e.g. Step 5 face match
// against the Step 1 ID-card image we already collected).
export async function getLatestEvidenceWithBuffer(
  sessionId: string,
  step: string,
): Promise<{ id: string; mime: string; buffer: Buffer } | null> {
  const evidence = await prisma.wizardEvidence.findFirst({
    where: { sessionId, step },
    orderBy: { capturedAt: "desc" },
  });
  if (!evidence) return null;
  const buffer = await downloadBuffer(evidence.storageKey);
  return { id: evidence.id, mime: evidence.mime, buffer };
}

export async function evidenceWithPresignedUrls(sessionId: string) {
  const evidence = await prisma.wizardEvidence.findMany({
    where: { sessionId },
    orderBy: { capturedAt: "asc" },
  });

  return Promise.all(
    evidence.map(async (item) => ({
      id: item.id,
      step: item.step,
      bytes: item.bytes,
      mime: item.mime,
      width: item.width,
      height: item.height,
      capturedAt: item.capturedAt,
      url: await presignDownload({ key: item.storageKey }),
    })),
  );
}
