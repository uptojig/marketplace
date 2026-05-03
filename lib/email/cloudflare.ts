import type { AliasProvider } from "./provider";

const CF_API = "https://api.cloudflare.com/client/v4";

function authHeaders(): HeadersInit {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function zoneId(): string {
  const id = process.env.CLOUDFLARE_ZONE_ID;
  if (!id) throw new Error("CLOUDFLARE_ZONE_ID not set");
  return id;
}

function platformDomain(): string {
  const d = process.env.PLATFORM_EMAIL_DOMAIN;
  if (!d) throw new Error("PLATFORM_EMAIL_DOMAIN not set");
  return d;
}

type CFRoutingRule = {
  id: string;
  enabled: boolean;
  name: string;
  matchers: Array<{ type: string; field: string; value: string }>;
  actions: Array<{ type: string; value: string[] }>;
};

async function findRuleByMatcherValue(
  matcherValue: string
): Promise<CFRoutingRule | null> {
  const res = await fetch(
    `${CF_API}/zones/${zoneId()}/email/routing/rules?per_page=50`,
    { headers: authHeaders() }
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(
      `Cloudflare list rules failed: ${JSON.stringify(json.errors ?? json)}`
    );
  }
  const rules: CFRoutingRule[] = json.result ?? [];
  return (
    rules.find((r) =>
      r.matchers.some(
        (m) =>
          m.type === "literal" && m.field === "to" && m.value === matcherValue
      )
    ) ?? null
  );
}

export const cloudflareProvider: AliasProvider = {
  async createAlias({ local, forwardTo, name }) {
    const aliasEmail = `${local}@${platformDomain()}`;
    const body = {
      name: name ?? `store-${local}`,
      enabled: true,
      matchers: [{ type: "literal", field: "to", value: aliasEmail }],
      actions: [{ type: "forward", value: [forwardTo] }],
    };
    const res = await fetch(
      `${CF_API}/zones/${zoneId()}/email/routing/rules`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      }
    );
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(
        `Cloudflare createAlias failed: ${JSON.stringify(json.errors ?? json)}`
      );
    }
    return { aliasEmail, ruleId: json.result.id };
  },

  async updateAlias({ local, forwardTo, name }) {
    const aliasEmail = `${local}@${platformDomain()}`;
    const existing = await findRuleByMatcherValue(aliasEmail);
    if (!existing) {
      return cloudflareProvider.createAlias({ local, forwardTo, name });
    }
    const body = {
      name: name ?? existing.name,
      enabled: true,
      matchers: existing.matchers,
      actions: [{ type: "forward", value: [forwardTo] }],
    };
    const res = await fetch(
      `${CF_API}/zones/${zoneId()}/email/routing/rules/${existing.id}`,
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      }
    );
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(
        `Cloudflare updateAlias failed: ${JSON.stringify(json.errors ?? json)}`
      );
    }
    return { aliasEmail, ruleId: existing.id };
  },

  async deleteAlias(local) {
    const aliasEmail = `${local}@${platformDomain()}`;
    const existing = await findRuleByMatcherValue(aliasEmail);
    if (!existing) return;
    const res = await fetch(
      `${CF_API}/zones/${zoneId()}/email/routing/rules/${existing.id}`,
      { method: "DELETE", headers: authHeaders() }
    );
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(
        `Cloudflare deleteAlias failed: ${JSON.stringify(json.errors ?? json)}`
      );
    }
  },
};
