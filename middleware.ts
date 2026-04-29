import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Domain config — set MAIN_DOMAIN in env (e.g. "marketplace.app").
// In dev, hosts like "tuen.localhost:3000" or "tuen.lvh.me:3000" both work natively.
const MAIN_DOMAIN = process.env.MAIN_DOMAIN ?? "localhost";
const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "dashboard"]);

function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  const mainNoPort = MAIN_DOMAIN.split(":")[0].toLowerCase();

  if (hostname === mainNoPort || hostname === `www.${mainNoPort}`) return null;
  if (!hostname.endsWith(`.${mainNoPort}`)) return null;

  const sub = hostname.slice(0, -mainNoPort.length - 1);
  const leftmost = sub.split(".")[0];
  if (RESERVED_SUBDOMAINS.has(leftmost)) return null;
  return leftmost || null;
}

const PASSTHROUGH_PREFIXES = [
  "/api",
  "/_next",
  "/static",
  "/favicon",
  "/icons",
  "/uploads",
  "/stores/",
  "/products/",
  "/onboarding",
  "/dashboard",
  "/admin",
  "/cart",
  "/checkout",
  "/checkout/address",
  "/checkout/confirm",
  "/order-success",
  "/orders",
  "/mock-payment-gate",
  "/signin",
  "/_resolve-domain",
  "/api/webhook/quickpay",
];

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Skip framework / API / already-namespaced routes
  if (PASSTHROUGH_PREFIXES.some((p) => path === p || path.startsWith(p))) {
    return NextResponse.next();
  }

  // Subdomain match: <slug>.<MAIN_DOMAIN> → rewrite to /stores/<slug><path>
  const sub = extractSubdomain(host);
  if (sub) {
    const target = url.clone();
    target.pathname = `/stores/${sub}${path === "/" ? "" : path}`;
    return NextResponse.rewrite(target);
  }

  // Custom domain: hosts that aren't MAIN_DOMAIN/localhost get resolved
  // by a server-side route that looks up Store.customDomain in the DB.
  const hostname = host.split(":")[0].toLowerCase();
  const mainNoPort = MAIN_DOMAIN.split(":")[0].toLowerCase();
  const isMain = hostname === mainNoPort || hostname === `www.${mainNoPort}`;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  if (!isMain && !isLocalhost) {
    const target = url.clone();
    target.pathname = "/_resolve-domain";
    target.searchParams.set("host", hostname);
    target.searchParams.set("path", path);
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
