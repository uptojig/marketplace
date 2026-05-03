import type { AliasProvider } from "./provider";
import { cloudflareProvider } from "./cloudflare";

const noopProvider: AliasProvider = {
  async createAlias({ local }) {
    const aliasEmail = `${local}@${process.env.PLATFORM_EMAIL_DOMAIN ?? "mail.local"}`;
    console.log(`[email/noop] createAlias ${aliasEmail}`);
    return { aliasEmail, ruleId: `noop-${local}` };
  },
  async updateAlias({ local }) {
    const aliasEmail = `${local}@${process.env.PLATFORM_EMAIL_DOMAIN ?? "mail.local"}`;
    console.log(`[email/noop] updateAlias ${aliasEmail}`);
    return { aliasEmail, ruleId: `noop-${local}` };
  },
  async deleteAlias(local) {
    console.log(`[email/noop] deleteAlias ${local}`);
  },
};

export function getAliasProvider(): AliasProvider {
  const driver = (process.env.EMAIL_PROVIDER ?? "noop").toLowerCase();
  if (driver === "cloudflare") return cloudflareProvider;
  return noopProvider;
}

export type { AliasProvider } from "./provider";
