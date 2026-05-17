/**
 * DigitalOcean Spaces (S3-compatible) helper.
 *
 * Required env:
 *   SPACES_ENDPOINT  — e.g. https://sgp1.digitaloceanspaces.com
 *   SPACES_REGION    — e.g. sgp1
 *   SPACES_BUCKET    — bucket name
 *   SPACES_KEY       — access key id
 *   SPACES_SECRET    — secret access key
 *
 * Server-side `uploadBuffer` PUTs through the Next.js API route so
 * the browser never needs Spaces CORS configured. For very large
 * files use `presignUpload` instead and let the browser PUT directly.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";

const endpoint = process.env.SPACES_ENDPOINT;
const region = process.env.SPACES_REGION ?? "sgp1";
const bucket = process.env.SPACES_BUCKET;
const accessKeyId = process.env.SPACES_KEY;
const secretAccessKey = process.env.SPACES_SECRET;

let client: S3Client | null = null;

export class SpacesNotConfiguredError extends Error {
  constructor() {
    super("SPACES_ENDPOINT / SPACES_BUCKET / SPACES_KEY / SPACES_SECRET not set");
    this.name = "SpacesNotConfiguredError";
  }
}

export function isSpacesConfigured() {
  return !!(endpoint && bucket && accessKeyId && secretAccessKey);
}

function getClient(): S3Client {
  if (!isSpacesConfigured()) throw new SpacesNotConfiguredError();
  if (!client) {
    client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
      forcePathStyle: false,
    });
  }
  return client;
}

function buildKey(prefix: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase().slice(0, 8) ?? "bin";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "bin";
  const random = randomBytes(8).toString("hex");
  return `${prefix.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${random}.${safeExt}`;
}

function publicUrlFor(key: string): string {
  const host = endpoint!.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${bucket}.${host}/${key}`;
}

export async function uploadBuffer(args: {
  prefix: string;
  filename: string;
  contentType: string;
  body: Buffer | Uint8Array;
}): Promise<{ key: string; publicUrl: string }> {
  const c = getClient();
  const key = buildKey(args.prefix, args.filename);
  await c.send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: args.body,
      ContentType: args.contentType,
      ACL: "public-read",
    }),
  );
  return { key, publicUrl: publicUrlFor(key) };
}

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function presignUpload(args: {
  prefix: string;
  filename: string;
  contentType: string;
  expiresIn?: number;
}): Promise<PresignedUpload> {
  const c = getClient();
  const key = buildKey(args.prefix, args.filename);
  const command = new PutObjectCommand({
    Bucket: bucket!,
    Key: key,
    ContentType: args.contentType,
    ACL: "public-read",
  });
  const uploadUrl = await getSignedUrl(c, command, {
    expiresIn: args.expiresIn ?? 300,
  });
  return { uploadUrl, publicUrl: publicUrlFor(key), key };
}

// Time-limited GET URL for previewing KYC evidence in the admin queue and
// the vendor wizard. Works for both public-read and private objects; the
// presigned URL embeds the auth, so the underlying ACL doesn't matter.
export async function presignDownload(args: {
  key: string;
  expiresIn?: number;
}): Promise<string> {
  const c = getClient();
  const command = new GetObjectCommand({ Bucket: bucket!, Key: args.key });
  return getSignedUrl(c, command, { expiresIn: args.expiresIn ?? 600 });
}
