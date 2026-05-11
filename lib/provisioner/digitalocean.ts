// DigitalOcean API client — minimal surface used by the provisioner.
//
// We avoid pulling the full `dots-wrapper` SDK to keep bundle size and the
// dependency surface small; only ~5 endpoints are exercised.
//
// Docs: https://docs.digitalocean.com/reference/api/api-reference/

import { getConfig } from "./config";

const API_BASE = "https://api.digitalocean.com/v2";

export type Droplet = {
  id: number;
  name: string;
  status: "new" | "active" | "off" | "archive";
  memory: number;
  vcpus: number;
  region: { slug: string };
  size_slug: string;
  networks: {
    v4: Array<{ ip_address: string; type: "public" | "private"; netmask: string }>;
    v6: Array<{ ip_address: string; type: "public" | "private" }>;
  };
  tags: string[];
  created_at: string;
};

export type CreateDropletInput = {
  name: string;
  region?: string;
  size?: string;
  imageSnapshotId?: string;
  imageSlugFallback?: string;
  sshKeyIds?: string[];
  userData: string; // cloud-init script
  tags?: string[];
  vpcUuid?: string | null;
};

async function doFetch(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<Response> {
  const { token: tokenOverride, ...rest } = init;
  const token = tokenOverride ?? getConfig().doToken;
  if (!token) {
    throw new Error("DigitalOcean token not configured (DIGITALOCEAN_TOKEN)");
  }
  return fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
  });
}

async function expectOk(res: Response, op: string): Promise<unknown> {
  if (res.ok) return res.json().catch(() => ({}));
  const body = await res.text();
  throw new DOApiError(op, res.status, body);
}

export class DOApiError extends Error {
  constructor(
    public operation: string,
    public status: number,
    public responseBody: string,
  ) {
    super(`DigitalOcean ${operation} failed: HTTP ${status} ${responseBody.slice(0, 200)}`);
  }
}

export async function createDroplet(input: CreateDropletInput): Promise<Droplet> {
  const cfg = getConfig();
  const image =
    input.imageSnapshotId ?? cfg.doImageSnapshotId ?? input.imageSlugFallback ?? cfg.doImageFallbackSlug;
  const sshKeys = input.sshKeyIds ?? cfg.doSshKeyIds;

  const body = {
    name: input.name,
    region: input.region ?? cfg.doRegion,
    size: input.size ?? cfg.doSize,
    image: /^\d+$/.test(String(image)) ? Number(image) : image,
    ssh_keys: sshKeys,
    backups: false,
    ipv6: true,
    monitoring: true,
    tags: input.tags ?? ["marketplace", "shop-droplet"],
    user_data: input.userData,
    vpc_uuid: input.vpcUuid ?? undefined,
  };

  const res = await doFetch("/droplets", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = (await expectOk(res, "createDroplet")) as { droplet: Droplet };
  return data.droplet;
}

export async function getDroplet(id: number): Promise<Droplet> {
  const res = await doFetch(`/droplets/${id}`);
  const data = (await expectOk(res, "getDroplet")) as { droplet: Droplet };
  return data.droplet;
}

export async function destroyDroplet(id: number): Promise<void> {
  const res = await doFetch(`/droplets/${id}`, { method: "DELETE" });
  if (res.status === 204 || res.status === 404) return;
  await expectOk(res, "destroyDroplet");
}

export async function listSnapshots(): Promise<
  Array<{ id: string; name: string; created_at: string; size_gigabytes: number; regions: string[] }>
> {
  const res = await doFetch("/snapshots?resource_type=droplet&per_page=50");
  const data = (await expectOk(res, "listSnapshots")) as {
    snapshots: Array<{
      id: string;
      name: string;
      created_at: string;
      size_gigabytes: number;
      regions: string[];
    }>;
  };
  return data.snapshots ?? [];
}

// Wait until a droplet transitions out of "new" — returns the droplet record
// with networks populated. Backoff: 5s × 60 = 5 min max (typical: 30-90s).
export async function waitForDropletActive(
  id: number,
  opts: { maxAttempts?: number; intervalMs?: number; signal?: AbortSignal } = {},
): Promise<Droplet> {
  const max = opts.maxAttempts ?? 60;
  const interval = opts.intervalMs ?? 5000;
  for (let i = 0; i < max; i++) {
    if (opts.signal?.aborted) throw new Error("Aborted waitForDropletActive");
    const d = await getDroplet(id);
    if (d.status === "active" && publicIpv4(d)) return d;
    await sleep(interval);
  }
  throw new Error(`Droplet ${id} did not become active within ${(max * interval) / 1000}s`);
}

export function publicIpv4(d: Droplet): string | null {
  return d.networks.v4.find((n) => n.type === "public")?.ip_address ?? null;
}

export function privateIpv4(d: Droplet): string | null {
  return d.networks.v4.find((n) => n.type === "private")?.ip_address ?? null;
}

export function publicIpv6(d: Droplet): string | null {
  return d.networks.v6.find((n) => n.type === "public")?.ip_address ?? null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
