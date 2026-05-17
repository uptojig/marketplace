// POST /api/kyc/verify
//
// Runs the iApp Thai-ID + face-verify + liveness pipeline on an uploaded
// ID card image and selfie, and returns the scoring/decision payload.
//
// Expected multipart/form-data fields:
//   - id          : File  (front of Thai national ID card)
//   - selfie      : File  (selfie, optionally holding the ID)
//   - selfie_held_id_crop? : File (cropped ID card area from selfie for held-OCR)
//   - scenario?   : string (telemetry tag, defaults to "web")
//   - attempt_index?, max_attempts?, image_width?, image_height?,
//     file_size?, captured_at?  : optional capture metadata

import { NextResponse } from "next/server";
import { runVerification } from "@/lib/kyc/run-verification";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// iApp official: 10MB max per image. 2MB is the practical optimal beyond which
// the API may return FILE_IS_TOO_LARGE. We cap ID at the hard limit and keep
// selfie at the optimal limit since selfies don't need the extra fidelity.
const MAX_ID_BYTES = 10 * 1024 * 1024;
const MAX_SELFIE_BYTES = 2 * 1024 * 1024;
const MIN_SELFIE_WIDTH = 600;
const MIN_SELFIE_HEIGHT = 400;

function readTextField(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function readOptionalIntField(value: FormDataEntryValue | null): number | undefined {
  const text = readTextField(value);
  if (!text) return undefined;
  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(req: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  console.log(`[${reqId}] /api/kyc/verify start`);

  try {
    const form = await req.formData();
    const idEntry = form.get("id");
    const selfieEntry = form.get("selfie");
    const selfieHeldIdCropEntry = form.get("selfie_held_id_crop");
    const scenarioName = readTextField(form.get("scenario")) || "web";
    const attemptIndex = Math.max(1, readOptionalIntField(form.get("attempt_index")) ?? 1);
    const maxAttempts = Math.max(1, readOptionalIntField(form.get("max_attempts")) ?? 3);
    const imageWidth = readOptionalIntField(form.get("image_width"));
    const imageHeight = readOptionalIntField(form.get("image_height"));
    const declaredFileSize = readOptionalIntField(form.get("file_size"));
    const capturedAt = readTextField(form.get("captured_at"));

    if (
      !idEntry ||
      !selfieEntry ||
      typeof idEntry === "string" ||
      typeof selfieEntry === "string"
    ) {
      return NextResponse.json(
        { ok: false, error: 'Both "id" and "selfie" files are required' },
        { status: 400 },
      );
    }

    const idFile = idEntry as File;
    const selfieFile = selfieEntry as File;
    const selfieHeldIdCropFile =
      selfieHeldIdCropEntry && typeof selfieHeldIdCropEntry !== "string"
        ? (selfieHeldIdCropEntry as File)
        : null;

    if (idFile.size > MAX_ID_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `ID card image is too large (${idFile.size} bytes). Max allowed is ${MAX_ID_BYTES} bytes (10 MB).`,
        },
        { status: 400 },
      );
    }

    if (selfieFile.size > MAX_SELFIE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `Selfie image is too large (${selfieFile.size} bytes). Max allowed is ${MAX_SELFIE_BYTES} bytes.`,
        },
        { status: 400 },
      );
    }

    if (selfieHeldIdCropFile && selfieHeldIdCropFile.size > MAX_ID_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `Selfie ID-card crop is too large (${selfieHeldIdCropFile.size} bytes). Max allowed is ${MAX_ID_BYTES} bytes (10 MB).`,
        },
        { status: 400 },
      );
    }

    if (
      imageWidth !== undefined &&
      imageHeight !== undefined &&
      (imageWidth < MIN_SELFIE_WIDTH || imageHeight < MIN_SELFIE_HEIGHT)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: `Selfie resolution is too small (${imageWidth}x${imageHeight}). Minimum is ${MIN_SELFIE_WIDTH}x${MIN_SELFIE_HEIGHT}.`,
        },
        { status: 400 },
      );
    }

    const idBuffer = Buffer.from(await idFile.arrayBuffer());
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    const heldIdOcrBuffer = selfieHeldIdCropFile
      ? Buffer.from(await selfieHeldIdCropFile.arrayBuffer())
      : undefined;
    console.log(
      `[${reqId}] buffers: id=${idBuffer.length}B selfie=${selfieBuffer.length}B heldCrop=${heldIdOcrBuffer?.length ?? 0}B attempt=${attemptIndex}/${maxAttempts}`,
    );

    const result = await runVerification(scenarioName, idBuffer, selfieBuffer, {
      returnFaceImage: true,
      heldIdOcrBuffer,
      capture: {
        mode: "upload",
        attemptIndex,
        maxAttempts,
        capturedAt: capturedAt || undefined,
        imageWidth,
        imageHeight,
        fileSize: declaredFileSize ?? selfieFile.size,
      },
      onStep: (step, state) => console.log(`[${reqId}] step ${step}: ${state}`),
      onCall: (entry) => {
        console.log(
          `[${reqId}] iapp ${entry.endpoint} ic=${entry.ic} ms=${entry.ms}`,
        );
      },
    });

    console.log(`[${reqId}] /api/kyc/verify ok → ${result.decision}`);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${reqId}] /api/kyc/verify FAILED:`, msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
