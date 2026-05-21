/**
 * Single source of truth for "where does this role's workspace live" and how
 * to label it. Used by post-login redirects (signin), the operator shell brand
 * link, and the shared AccountMenu — so the role→home mapping is defined
 * exactly once instead of being copy-pasted across three places.
 */

export function workspaceHomeFor(role: string | null | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "AGENT":
      return "/agent/dashboard";
    case "VENDOR":
      return "/dashboard";
    default:
      // No seller workspace yet (CUSTOMER / unknown) → onboarding.
      return "/apply";
  }
}

export function workspaceLabelFor(role: string | null | undefined): string {
  switch (role) {
    case "ADMIN":
      return "Admin Console";
    case "AGENT":
      return "Agent Console";
    case "VENDOR":
      return "แดชบอร์ดร้านค้า";
    default:
      return "ดำเนินการสมัคร";
  }
}
