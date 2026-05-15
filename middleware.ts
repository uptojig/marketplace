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
  "/dashboard",
  "/admin",
  // /cart and /checkout/* used to live at marketplace level —
  // they're now per-store at /stores/<slug>/cart and
  // /stores/<slug>/checkout/* and inherit /stores/ passthrough above.
  "/order-success",
  "/orders",
  "/mock-payment-gate",
  "/signin",
  "/resolve-domain",
  "/api/webhook/quickpay",
];

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // On a shop droplet, buyer auth paths must render the per-store
  // signin/signup — not the central seller-signin that lives in
  // PASSTHROUGH_PREFIXES below. NextAuth's default unauthenticated
  // redirect (`signIn: "/signin"`) otherwise lands buyers on the
  // basketplace-branded seller page even while their address bar
  // still shows the shop's own domain.
  const shopSlug = process.env.SHOP_SLUG;
  if (shopSlug && (path === "/signin" || path === "/signup")) {
    const target = url.clone();
    target.pathname = `/stores/${shopSlug}${path}`;
    return NextResponse.rewrite(target);
  }

  // On a shop droplet, the entire app *is* the store — so /stores/<slug>/X
  // and /X are the same page. Most Link components in the codebase still
  // emit the prefixed form (because they're shared with the marketplace),
  // which leaks the slug into the buyer's address bar
  // (e.g. fluffy-house.com/stores/fluffyhouse/category). Strip the prefix
  // with a 308 so links normalize and URLs stay clean.
  if (shopSlug) {
    const prefix = `/stores/${shopSlug}`;
    if (path === prefix || path === `${prefix}/`) {
      const target = url.clone();
      target.pathname = "/";
      return NextResponse.redirect(target, 308);
    }
    if (path.startsWith(`${prefix}/`)) {
      const target = url.clone();
      target.pathname = path.slice(prefix.length);
      return NextResponse.redirect(target, 308);
    }
  }

  // Skip framework / API / already-namespaced routes
  if (PASSTHROUGH_PREFIXES.some((p) => path === p || path.startsWith(p))) {
    // Inject the request URL as a header so server layouts/components
    // can read the current pathname + search string. Next.js doesn't
    // expose `searchParams` to layouts (only pages); we use this on
    // the dashboard layout to know which store the picker should
    // highlight + which store's pending-order count to render in the
    // sidebar badge. Scoped to /dashboard to avoid widening cache
    // surface elsewhere.
    if (path.startsWith("/dashboard")) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-pathname", path);
      requestHeaders.set("x-search", url.search);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    return NextResponse.next();
  }

  // Single-tenant shop droplet: SHOP_SLUG is baked into the per-droplet
  // env at provision time. Everything that isn't a passthrough route maps
  // straight to that store — no host-based routing or DB lookup needed.
  // This is the right behavior whether the request came in via the
  // platform subdomain or via the vendor's custom domain.
  if (shopSlug) {
    const target = url.clone();
    target.pathname = `/stores/${shopSlug}${path === "/" ? "" : path}`;
    return NextResponse.rewrite(target);
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
    try {
      const resolveUrl = new URL("/api/internal/resolve-domain", url.origin);
      resolveUrl.searchParams.set("host", hostname);
      const res = await fetch(resolveUrl, { headers: { "x-middleware-internal": "1" } });
      if (res.ok) {
        const { slug } = await res.json();
        if (slug) {
          const target = url.clone();
          target.pathname = path === "/" ? `/stores/${slug}` : `/stores/${slug}${path}`;
          return NextResponse.rewrite(target);
        }
      }
    } catch {
      // DB lookup failed, fall through to 404
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
