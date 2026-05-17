import { randomUUID } from "node:crypto";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type {
  OcrIdCardFrontResult,
  OcrIdCardBackResult,
  OcrBookBankResult,
  OcrDocumentResult,
  OcrDocumentLayoutResult,
  PassiveLivenessResult,
  FaceVerificationResult,
  IappCallResult,
} from "./types";

const BASE = process.env.IAPP_BASE_URL ?? "https://api.iapp.co.th";
const REQUEST_TIMEOUT_MS = parseInt(process.env.IAPP_REQUEST_TIMEOUT_MS ?? "10000", 10);
const MAX_RETRIES = parseInt(process.env.IAPP_RETRIES ?? "1", 10);

function getApiKey(): string {
  const key = process.env.IAPP_API_KEY;
  if (!key) {
    throw new Error("IAPP_API_KEY is missing. Set it in your environment.");
  }
  return key;
}

type FileInput = string | Buffer;
type MultipartFieldValue = string | number | boolean;

interface MultipartPayload {
  body: Buffer;
  contentType: string;
}

interface HttpResponse {
  statusCode: number;
  bodyText: string;
}

export interface OcrThaiIdFrontOptions {
  fields?: string | string[];
  options?: string | string[];
}

export interface OcrThaiIdBackOptions {
  options?: string | string[];
}

function mimeFromName(name: string): string {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    pdf: "application/pdf",
  };
  return map[ext] ?? "image/jpeg";
}

function normalizeMultipartField(
  value: MultipartFieldValue | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value.join(",") : String(value);
}

function cleanFields(
  fields: Record<string, MultipartFieldValue | string[] | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([name, value]) => [name, normalizeMultipartField(value)] as const)
      .filter(
        (entry): entry is readonly [string, string] =>
          entry[1] !== undefined && entry[1] !== "",
      ),
  );
}

function retryDelay(attempt: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
}

function errorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const withCode = err as { code?: string; cause?: { code?: string } };
  return withCode.code ?? withCode.cause?.code;
}

function isRetryableNetworkError(err: unknown): boolean {
  const code = errorCode(err);
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message).toLowerCase()
      : String(err).toLowerCase();
  return (
    code === "UND_ERR_SOCKET" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_BODY_TIMEOUT" ||
    code === "ABORT_ERR" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    message.includes("other side closed") ||
    message.includes("socket") ||
    message.includes("aborted") ||
    message.includes("timeout")
  );
}

async function toFilePart(
  input: FileInput,
  fallbackName: string,
): Promise<{ data: Buffer; filename: string; mime: string }> {
  if (typeof input === "string") {
    const name = basename(input);
    return { data: await readFile(input), filename: name, mime: mimeFromName(name) };
  }
  return { data: input, filename: fallbackName, mime: mimeFromName(fallbackName) };
}

function escapeMultipartValue(value: string): string {
  return value.replace(/"/g, "%22");
}

async function createMultipartPayload(
  files: Record<string, FileInput>,
  extraFields: Record<string, MultipartFieldValue | string[] | undefined>,
): Promise<MultipartPayload> {
  const boundary = `----iapp-kyc-${randomUUID()}`;
  const chunks: Buffer[] = [];

  for (const [name, value] of Object.entries(cleanFields(extraFields))) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${escapeMultipartValue(name)}"\r\n\r\n${value}\r\n`,
      ),
    );
  }

  for (const [name, value] of Object.entries(files)) {
    const file = await toFilePart(value, `${name}.jpg`);
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${escapeMultipartValue(name)}"; filename="${escapeMultipartValue(file.filename)}"\r\nContent-Type: ${file.mime}\r\n\r\n`,
      ),
      file.data,
      Buffer.from("\r\n"),
    );
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

async function postRaw(path: string, payload: MultipartPayload): Promise<HttpResponse> {
  const url = new URL(`${BASE}${path}`);
  const transport = url.protocol === "http:" ? httpRequest : httpsRequest;
  const apiKey = getApiKey();

  return new Promise<HttpResponse>((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      req.destroy(new Error(`timeout after ${REQUEST_TIMEOUT_MS}ms`));
    }, REQUEST_TIMEOUT_MS);
    timeout.unref?.();

    const req = transport(
      url,
      {
        method: "POST",
        headers: {
          apikey: apiKey,
          connection: "close",
          "content-type": payload.contentType,
          "content-length": payload.body.length,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          resolve({
            statusCode: res.statusCode ?? 0,
            bodyText: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    req.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(err);
    });

    req.end(payload.body);
  });
}

async function postMultipart<T>(
  path: string,
  files: Record<string, FileInput>,
  ic: number,
  extraFields: Record<string, MultipartFieldValue | string[] | undefined> = {},
): Promise<IappCallResult<T>> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const payload = await createMultipartPayload(files, extraFields);

    const start = Date.now();
    try {
      const res = await postRaw(path, payload);
      const ms = Date.now() - start;

      if (res.statusCode >= 500 && attempt < MAX_RETRIES) {
        lastError = new Error(`iApp ${path} failed ${res.statusCode}: ${res.bodyText}`);
        console.warn(`[iapp] ${path} returned ${res.statusCode}; retry ${attempt + 1}/${MAX_RETRIES}`);
        await retryDelay(attempt);
        continue;
      }

      if (res.statusCode >= 400) {
        throw new Error(`iApp ${path} failed ${res.statusCode}: ${res.bodyText}`);
      }

      const data = JSON.parse(res.bodyText) as T;
      return { data, ic, ms };
    } catch (err) {
      lastError = err;
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : String(err);
      if (attempt < MAX_RETRIES && isRetryableNetworkError(err)) {
        console.warn(`[iapp] ${path} transient error: ${message}; retry ${attempt + 1}/${MAX_RETRIES}`);
        await retryDelay(attempt);
        continue;
      }
      if (isRetryableNetworkError(err)) {
        throw new Error(`iApp ${path} network error after ${attempt + 1} attempt(s): ${message}`);
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`iApp ${path} failed`);
}

export const iapp = {
  // OCR — front side: 1.25 IC per request
  ocrThaiIdFront: (file: FileInput, options: OcrThaiIdFrontOptions = {}) =>
    postMultipart<OcrIdCardFrontResult>(
      "/v3/store/ekyc/thai-national-id-card/front",
      { file },
      1.25,
      { fields: options.fields, options: options.options },
    ),

  // OCR — back side: 0.75 IC per request
  ocrThaiIdBack: (file: FileInput, options: OcrThaiIdBackOptions = {}) =>
    postMultipart<OcrIdCardBackResult>(
      "/v3/store/ekyc/thai-national-id-card/back",
      { file },
      0.75,
      { options: options.options },
    ),

  // Book-bank OCR — 1.25 IC per request. The account-name field is noisy;
  // downstream matching should tier exact / partial / manual review.
  ocrBookBank: (file: FileInput) =>
    postMultipart<OcrBookBankResult>(
      "/v3/store/ekyc/book-bank",
      { file },
      1.25,
    ),

  // General Thai document OCR — plain text response. Used for DGA Digital ID
  // profile screenshots (no purpose-built endpoint exists for that form).
  // 1 IC per page. Returns { text: string[] } where each entry is one page of
  // newline-separated Thai text. Parser in identity-extract treats the blob
  // as a haystack and pulls label→value pairs via Thai-label regex.
  ocrDocument: (file: FileInput) =>
    postMultipart<OcrDocumentResult>(
      "/v3/store/ocr/document/ocr",
      { file },
      1,
    ),

  // Layout-aware document OCR — returns per-component text with bounding
  // boxes. Used to locate PII regions (e.g. DGA username value) before
  // applying a blur via sharp. 1 IC per page.
  ocrDocumentLayout: (file: FileInput) =>
    postMultipart<OcrDocumentLayoutResult>(
      "/v3/store/ocr/document/layout",
      { file },
      1,
    ),

  // Passive liveness (iBeta Level 1 certified): 0.3 IC per request
  liveness: (file: FileInput) =>
    postMultipart<PassiveLivenessResult>(
      "/v3/store/ekyc/face-passive-liveness",
      { file },
      0.3,
    ),

  // Face verification (1:1 face match): 0.3 IC per request
  // Returns: { matched, score (0-2822), threshold, duration, message }
  faceVerification: (
    file1: FileInput,
    file2: FileInput,
    threshold?: number,
  ) =>
    postMultipart<FaceVerificationResult>(
      "/v3/store/ekyc/face-verification",
      { file1, file2 },
      0.3,
      threshold !== undefined ? { threshold: String(threshold) } : {},
    ),
};
