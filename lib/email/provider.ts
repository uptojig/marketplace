// Email alias provider abstraction.
// Inbound aliases like "{slug}@{PLATFORM_EMAIL_DOMAIN}" forward to the
// seller's personal email. No outbound email is sent in Phase 1 — identity
// verification is derived from forwardTo == owner's NextAuth-verified login
// email, not from an OTP challenge.

export interface AliasProvider {
  createAlias(args: {
    local: string;
    forwardTo: string;
    name?: string;
  }): Promise<{ aliasEmail: string; ruleId: string }>;

  updateAlias(args: {
    local: string;
    forwardTo: string;
    name?: string;
  }): Promise<{ aliasEmail: string; ruleId: string }>;

  deleteAlias(local: string): Promise<void>;
}
