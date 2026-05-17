import { NextResponse } from "next/server";
import { recordIappCost } from "@/lib/kyc/cost-tracker";
import { fromTyphoonDga } from "@/lib/kyc/identity-extract";
import { iapp } from "@/lib/kyc/iapp-client";
import { redactDgaSensitiveRegions } from "@/lib/kyc/image-redaction";
import type { Identity } from "@/types/identity";
import type { OcrDocumentLayoutResult, OcrDocumentResult } from "@/lib/kyc/types";
import { validateThaiIdChecksum } from "@/lib/kyc/thai-id-validator";
import {
  assertFileSize,
  createStopwatch,
  DGA_PROVIDER,
  fileToBuffer,
  getFileField,
  jsonError,
  MAX_SCREENSHOT_BYTES,
  requireWizardSession,
  saveOcrResult,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function hasValue(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

const MIN_DGA_CONTRACT_CONFIDENCE = 0.85;

type DgaValidationCode = "label_missing" | "value_missing" | "invalid_value" | "low_confidence" | "privacy_redaction_failed";

interface DgaValidationIssue {
  field: string;
  label: string;
  code: DgaValidationCode;
  message: string;
}

interface DgaFieldRule {
  field: string;
  label: string;
  labelPattern: RegExp;
  value: (identity: Identity) => string | undefined | null;
  valid?: (value: string) => boolean;
}

function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

function validIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validThaiPhone(value: string): boolean {
  const digits = digitsOnly(value);
  return /^0\d{8,9}$/.test(digits);
}

function validThaiMobile(value: string): boolean {
  const digits = digitsOnly(value);
  return /^0[689]\d{8}$/.test(digits);
}

function validThaiAddress(value: string): boolean {
  return /บ้านเลขที่|หมู่(?:ที่)?|ซอย|ซ\.|ถนน|แขวง|เขต|ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.|\b\d{5}\b/.test(value);
}

const DGA_FIELD_RULES: DgaFieldRule[] = [
  { field: "firstName", label: "ชื่อจริง", labelPattern: /ชื่อจริง/, value: (identity) => identity.thName?.first },
  { field: "lastName", label: "นามสกุล", labelPattern: /นามสกุล/, value: (identity) => identity.thName?.last },
  { field: "dob", label: "วันเดือนปีเกิด", labelPattern: /วันเดือนปีเกิด/, value: (identity) => identity.dob, valid: validIsoDate },
  {
    field: "citizenId",
    label: "เลขบัตรประจำตัวประชาชน 13 หลัก",
    labelPattern: /เลข\s*ประจ[ํำ]าตัว|ประชาชน\s*13\s*หลัก/,
    value: (identity) => identity.citizenId,
    valid: (value) => validateThaiIdChecksum(value),
  },
  {
    field: "registeredAddress",
    label: "ที่อยู่ตามบัตรประจำตัวประชาชน",
    labelPattern: /ที่อยู่ตามบัตร/,
    value: (identity) => identity.address?.full,
    valid: validThaiAddress,
  },
  {
    field: "contactAddress",
    label: "ที่อยู่ที่ติดต่อได้",
    labelPattern: /ที่อยู่ที่ติดต่อได้/,
    value: (identity) => identity.contactAddress?.full,
    valid: validThaiAddress,
  },
  { field: "phone", label: "เบอร์โทรศัพท์", labelPattern: /เบอร์โทรศัพท์(?!มือ)/, value: (identity) => identity.phone, valid: validThaiPhone },
  {
    field: "mobilePhone",
    label: "เบอร์โทรศัพท์มือถือ",
    labelPattern: /เบอร์โทรศัพท์มือ|มือถือ/,
    value: (identity) => identity.mobilePhone,
    valid: validThaiMobile,
  },
  { field: "email", label: "อีเมล", labelPattern: /อีเมล/, value: (identity) => identity.email, valid: validEmail },
];

function collectDgaDocumentText(payload: OcrDocumentResult, layout?: OcrDocumentLayoutResult): string {
  const text = payload.text ?? [];
  const layoutText = (layout?.pages ?? [])
    .flatMap((page) => page.components ?? [])
    .map((component) => component.text ?? "");
  return [...text, ...layoutText].join("\n");
}

// Heuristic confidence for a DGA OCR page based on signals visible in
// the extracted text — Thai labels found + a 13-digit citizen-id pattern.
function confidenceForDgaContract(identity: Identity, payload: OcrDocumentResult, layout?: OcrDocumentLayoutResult): number {
  const blob = collectDgaDocumentText(payload, layout);
  if (!blob) return 0;
  const checks = DGA_FIELD_RULES.flatMap((rule) => [
    rule.labelPattern.test(blob),
    hasValue(rule.value(identity)),
  ]);
  return checks.filter(Boolean).length / checks.length;
}

function validateDgaContract(args: {
  identity: Identity;
  ocr: OcrDocumentResult;
  layout: OcrDocumentLayoutResult;
  confidence: number;
}): DgaValidationIssue[] {
  const blob = collectDgaDocumentText(args.ocr, args.layout);
  const issues: DgaValidationIssue[] = [];

  for (const rule of DGA_FIELD_RULES) {
    const labelFound = rule.labelPattern.test(blob);
    const value = rule.value(args.identity)?.trim();

    if (!labelFound) {
      issues.push({
        field: rule.field,
        label: rule.label,
        code: "label_missing",
        message: `ไม่พบ label ${rule.label} ในภาพ DGA`,
      });
      continue;
    }

    if (!value) {
      issues.push({
        field: rule.field,
        label: rule.label,
        code: "value_missing",
        message: `พบ label ${rule.label} แต่ OCR อ่านค่าไม่ได้`,
      });
      continue;
    }

    if (rule.valid && !rule.valid(value)) {
      issues.push({
        field: rule.field,
        label: rule.label,
        code: "invalid_value",
        message: `ค่า ${rule.label} ไม่ผ่านรูปแบบข้อมูลที่กำหนด`,
      });
    }
  }

  if (args.confidence < MIN_DGA_CONTRACT_CONFIDENCE) {
    issues.push({
      field: "document",
      label: "DGA_IMAGE1",
      code: "low_confidence",
      message: `ความมั่นใจ OCR ต่ำกว่า ${MIN_DGA_CONTRACT_CONFIDENCE}`,
    });
  }

  return issues;
}

// Image 1 (primary): full Document OCR → extracted identity → canonical
// DGA row read by every downstream cross-match step.
async function ocrPrimaryImage(args: {
  sessionId: string;
  image: File;
}): Promise<{ identity: Identity; confidence: number; evidenceId: string; ocr: OcrDocumentResult; layout: OcrDocumentLayoutResult }> {
  assertFileSize(args.image, MAX_SCREENSHOT_BYTES, "DGA screenshot 1");
  const buffer = await fileToBuffer(args.image);

  const evidence = await uploadWizardEvidence({
    sessionId: args.sessionId,
    step: "S1_DGA_CAPTURE",
    buffer,
    mime: args.image.type || "image/png",
    filename: args.image.name,
  });

  const [ocr, layout] = await Promise.all([
    iapp.ocrDocument(buffer),
    iapp.ocrDocumentLayout(buffer),
  ]);
  await Promise.all([
    recordIappCost({
      sessionId: args.sessionId,
      endpoint: "document-ocr",
      ic: ocr.ic,
      ms: ocr.ms,
    }),
    recordIappCost({
      sessionId: args.sessionId,
      endpoint: "document-layout-dga-image-1",
      ic: layout.ic,
      ms: layout.ms,
    }),
  ]);

  const rawResponse = { ...ocr.data, layout: layout.data } as unknown as Record<string, unknown>;
  const extracted = fromTyphoonDga(rawResponse);
  const confidence = confidenceForDgaContract(extracted, ocr.data, layout.data);
  await saveOcrResult({
    sessionId: args.sessionId,
    evidenceId: evidence.id,
    provider: `${DGA_PROVIDER}_image_1`,
    rawResponse,
    extracted,
    confidence,
  });
  return { identity: extracted, confidence, evidenceId: evidence.id, ocr: ocr.data, layout: layout.data };
}

// Image 2 (secondary): NOT OCR'd for identity — vendor's DGA login-info
// page contains sensitive username PII that we must redact before storing.
// We run iApp Layout OCR purely to locate the username bbox, blur it with
// sharp, then upload the redacted buffer as evidence.
async function redactAndStoreSecondaryImage(args: {
  sessionId: string;
  image: File;
}): Promise<{ evidenceId?: string; redactedCount: number; anchorCount: number; candidateCount: number; blurredChanged: boolean; issue?: DgaValidationIssue }> {
  assertFileSize(args.image, MAX_SCREENSHOT_BYTES, "DGA screenshot 2");
  const originalBuffer = await fileToBuffer(args.image);

  const redaction = await redactDgaSensitiveRegions(originalBuffer);
  await recordIappCost({
    sessionId: args.sessionId,
    endpoint: "document-layout",
    ic: redaction.ic,
    ms: redaction.ms,
  });

  const redactionIssue = redaction.anchorCount === 0
    ? {
        field: "image2Username",
        label: "DGA_IMAGE2 Username",
        code: "privacy_redaction_failed" as const,
        message: "ไม่พบ label Username/บัญชีผู้ใช้งาน สำหรับระบุตำแหน่ง blur",
      }
    : redaction.regions.length === 0
      ? {
          field: "image2Username",
          label: "DGA_IMAGE2 Username",
          code: "privacy_redaction_failed" as const,
          message: "พบ label Username แต่หา value สำหรับ blur ไม่ได้",
        }
      : !redaction.blurredChanged
        ? {
            field: "image2Username",
            label: "DGA_IMAGE2 Username",
            code: "privacy_redaction_failed" as const,
            message: "ระบบหา username ได้ แต่ไม่สามารถสร้างไฟล์ที่ blur แล้วได้",
          }
        : undefined;

  if (redactionIssue) {
    return {
      redactedCount: redaction.regions.length,
      anchorCount: redaction.anchorCount,
      candidateCount: redaction.candidateCount,
      blurredChanged: redaction.blurredChanged,
      issue: redactionIssue,
    };
  }

  const evidence = await uploadWizardEvidence({
    sessionId: args.sessionId,
    step: "S1_DGA_CAPTURE",
    buffer: redaction.buffer,
    mime: args.image.type || "image/png",
    filename: args.image.name,
  });

  await auditWizardEvent({
    sessionId: args.sessionId,
    actor: "system",
    event: "s1.dga_capture.image2_redacted",
    payload: {
      evidence_id: evidence.id,
      redacted_regions: redaction.regions.map((r) => ({
        bbox: r.bbox,
        component_type: r.component_type,
        reason: r.reason,
      })),
      username_anchor_count: redaction.anchorCount,
      username_candidate_count: redaction.candidateCount,
    },
  });

  return {
    evidenceId: evidence.id,
    redactedCount: redaction.regions.length,
    anchorCount: redaction.anchorCount,
    candidateCount: redaction.candidateCount,
    blurredChanged: redaction.blurredChanged,
  };
}

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S1_DGA_CAPTURE")
      return jsonError(`Expected S1_DGA_CAPTURE, got ${session.state}`, 409);
    sw.lap("session_check");

    const form = await req.formData();
    sw.lap("form_parse");
    // Accept legacy names for image1, but image2 is now required because it
    // contains the DGA username privacy gate.
    const image1 = getFileField(form, ["image1", "image", "dga_capture"]);
    const image2 = getFileField(form, ["image2"]);
    if (!image1) return jsonError('Multipart field "image1" is required');
    if (!image2) {
      return jsonError('Multipart field "image2" is required', 400, {
        state: session.state,
        missing_fields: ["DGA_IMAGE2"],
        field_errors: [{
          field: "image2",
          label: "DGA_IMAGE2",
          code: "value_missing",
          message: "ต้องอัปโหลดรูปที่ 2 เพื่อ blur Username ก่อนเก็บหลักฐาน",
        }],
      });
    }

    const result1 = await ocrPrimaryImage({ sessionId: params.sid, image: image1 });
    sw.lap("image1_ocr");
    const result2 = await redactAndStoreSecondaryImage({ sessionId: params.sid, image: image2 });
    sw.lap("image2_redact");

    const validationIssues = [
      ...validateDgaContract({
        identity: result1.identity,
        ocr: result1.ocr,
        layout: result1.layout,
        confidence: result1.confidence,
      }),
      ...(result2.issue ? [result2.issue] : []),
    ];

    if (validationIssues.length > 0) {
      const missingFields = validationIssues
        .filter((issue) => issue.code === "label_missing" || issue.code === "value_missing")
        .map((issue) => issue.label);

      await auditWizardEvent({
        sessionId: params.sid,
        actor: "system",
        event: "s1.dga_capture.contract_failed",
        payload: {
          field_errors: validationIssues,
          missingFields,
          confidence: result1.confidence,
          imageCount: 2,
          image2_redacted_count: result2.redactedCount,
          image2_username_anchor_count: result2.anchorCount,
        },
      });
      return NextResponse.json({
        ok: false,
        state: session.state,
        error: `DGA OCR validation failed: ${validationIssues.map((issue) => issue.label).join(", ")}`,
        missing_fields: missingFields,
        field_errors: validationIssues,
        extracted: result1.identity,
        confidence: result1.confidence,
        image_count: 2,
        image2_redacted_count: result2.redactedCount,
      });
    }

    // Canonical row — same identity as image 1 (image 2 is just stored
    // evidence for the admin, no identity extraction). Downstream steps
    // read this via latestExtractedIdentity(DGA_PROVIDER).
    await saveOcrResult({
      sessionId: params.sid,
      evidenceId: result1.evidenceId,
      provider: DGA_PROVIDER,
      rawResponse: {
        image_count: 2,
        image1_layout: true,
        image2_redacted: true,
        image2_redacted_count: result2.redactedCount,
        image2_username_anchor_count: result2.anchorCount,
      },
      extracted: result1.identity,
      confidence: result1.confidence,
    });

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S2_ID_SELFIE",
      actor: "system",
      event: "s1.dga_capture.ocr",
      payload: {
        confidence: result1.confidence,
        imageCount: 2,
        image2_redacted_count: result2.redactedCount,
        image2_username_anchor_count: result2.anchorCount,
        timings_ms: { ...sw.snapshot(), db_save_transition: sw.snapshot()._total_ms },
      },
    });
    sw.lap("db_save_transition");

    return NextResponse.json({
      ok: true,
      state: updated.state,
      extracted: result1.identity,
      confidence: result1.confidence,
      image_count: 2,
      image2_redacted_count: result2.redactedCount,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
