// Cloudflare DNS API client — minimal surface used by the provisioner.
//
// Docs: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records
//
// We work strictly within ONE zone (the platform domain, e.g. basketplace.co).
// For vendor-owned custom domains (myshop.com) we DON'T touch their DNS —
// the vendor adds the A record themselves on their own DNS provider. The
// control plane only verifies the lookup matches the droplet IP.

import { getConfig } from "./config";

const API_BASE = "https://api.cloudflare.com/client/v4";

export type CFDnsRecord = {
  id: string;
  name: string;
  type: "A" | "AAAA" | "CNAME" | "TXT" | "MX";
  content: string;
  proxied: boolean;
  ttl: number;
};

async function cfFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getConfig().cfToken;
  if (!token) throw new Error("Cloudflare token not configured (CLOUDFLARE_API_TOKEN)");
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

type CFResponse<T> = {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
};

async function expectOk<T>(res: Response, op: string): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as Partial<CFResponse<T>>;
  if (res.ok && data.success && data.result !== undefined) return data.result as T;
  const msg = data.errors?.map((e) => `${e.code}:${e.message}`).join(", ") ?? `HTTP ${res.status}`;
  throw new CFApiError(op, res.status, msg);
}

export class CFApiError extends Error {
  constructor(public operation: string, public status: number, public reason: string) {
    super(`Cloudflare ${operation} failed: ${reason}`);
  }
}

export type UpsertARecordInput = {
  zoneId?: string;
  name: string;     // FQDN — e.g. "myshop.basketplace.co"
  content: string;  // ipv4
  proxied?: boolean; // default false — DO NOT proxy shop droplets (breaks outbound IP match)
  ttl?: number;     // default 300
  comment?: string;
};

// Idempotent create-or-update by name+type. Returns the record id either way.
export async function upsertARecord(input: UpsertARecordInput): Promise<CFDnsRecord> {
  const zoneId = input.zoneId ?? getConfig().cfZoneId;
  const existing = await findRecord({ zoneId, name: input.name, type: "A" });

  const body = {
    type: "A" as const,
    name: input.name,
    content: input.content,
    ttl: input.ttl ?? 300,
    // proxied=false is critical: if Cloudflare proxies the storefront, the
    // outbound IP of the droplet is unchanged but inbound requests appear
    // to come from CF, which is fine for the storefront — but the payment
    // provider's IP whitelist checks the *droplet's* outbound IP. We keep
    // grey-cloud by default so the entire flow uses one IP end-to-end.
    proxied: input.proxied ?? false,
    comment: input.comment ?? "managed by marketplace provisioner",
  };

  if (existing) {
    const res = await cfFetch(`/zones/${zoneId}/dns_records/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return await expectOk<CFDnsRecord>(res, "updateDnsRecord");
  }

  const res = await cfFetch(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return await expectOk<CFDnsRecord>(res, "createDnsRecord");
}

export async function deleteRecord(recordId: string, zoneId?: string): Promise<void> {
  const z = zoneId ?? getConfig().cfZoneId;
  const res = await cfFetch(`/zones/${z}/dns_records/${recordId}`, { method: "DELETE" });
  if (res.status === 404) return; // already gone — idempotent
  await expectOk<unknown>(res, "deleteDnsRecord");
}

export async function findRecord(opts: {
  zoneId?: string;
  name: string;
  type: CFDnsRecord["type"];
}): Promise<CFDnsRecord | null> {
  const zoneId = opts.zoneId ?? getConfig().cfZoneId;
  const params = new URLSearchParams({ name: opts.name, type: opts.type, per_page: "1" });
  const res = await cfFetch(`/zones/${zoneId}/dns_records?${params}`);
  const list = await expectOk<CFDnsRecord[]>(res, "listDnsRecords");
  return list[0] ?? null;
}

// Look up which CF zone owns a given FQDN. Walks up the labels
// (foo.bar.example.com -> bar.example.com -> example.com) and asks
// `GET /zones?name=<candidate>` until a match is found. Useful when
// the vendor has registered their custom domain in the same CF
// account as the platform zone — we can then auto-manage A records
// without the vendor having to log into their DNS provider.
export async function findZoneForDomain(
  domain: string,
): Promise<{ id: string; name: string } | null> {
  const labels = domain.toLowerCase().replace(/\.$/, "").split(".");
  // Need at least 2 labels (foo.com) — single-label hostnames aren't zones.
  for (let i = 0; i <= labels.length - 2; i++) {
    const candidate = labels.slice(i).join(".");
    const res = await cfFetch(`/zones?name=${encodeURIComponent(candidate)}&per_page=1`);
    const list = await expectOk<Array<{ id: string; name: string }>>(res, "listZones");
    if (list.length > 0) return { id: list[0].id, name: list[0].name };
  }
  return null;
}

// Public DNS resolver for verifying a vendor's custom domain points at the
// droplet IP. We hit Cloudflare's 1.1.1.1 DoH endpoint so we don't depend
// on whatever local resolver the host happens to have configured.
export async function resolveARecord(hostname: string): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  if (!res.ok) return [];
  const data = (await res.json()) as { Answer?: Array<{ type: number; data: string }> };
  return (data.Answer ?? []).filter((a) => a.type === 1).map((a) => a.data);
}
