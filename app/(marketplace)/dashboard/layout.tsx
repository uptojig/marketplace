import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  LayoutDashboard,
  Mail,
  Package,
  Tags,
  ShoppingBag,
  Settings,
  Store as StoreIcon,
  ExternalLink,
  PlusSquare,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardSidebarToggle } from "@/components/dashboard/sidebar-toggle";
import { StorePicker } from "@/components/dashboard/store-picker";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";

// PAID = paid but not yet shipped — the canonical "needs vendor
// action" bucket for the unread badge in the sidebar. We don't count
// SUPPLIER_PLACED here because that state implies the seller already
// kicked off fulfillment.
const VENDOR_ACTION_REQUIRED_STATUS = "PAID" as const;

/**
 * Dashboard chrome — sidebar + topbar shell that wraps every page
 * under /dashboard/*. Models the shadcn-studio "dashboard-shell"
 * pattern (left rail + top bar + content area) using the radix-nova
 * tokens already in app/globals.css (--sidebar, --sidebar-foreground,
 * --sidebar-accent, etc.).
 *
 * Why this lives at the dashboard level (not marketplace): the public
 * marketplace nav at /signin /orders /stores/* should stay as a
 * thin top strip; the dashboard wants its own opinionated shell.
 *
 * Mobile: sidebar collapses behind a burger button via a tiny client
 * component (DashboardSidebarToggle) so we keep this layout server-
 * rendered for the auth + store name lookup.
 *
 * Multi-store: the layout reads the request URL via the x-pathname /
 * x-search headers injected by middleware (Next.js layouts don't get
 * searchParams natively). The current store is then resolved via
 * `resolveDashboardStore` so the sidebar brand row + pending-orders
 * badge follow the picker selection.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pull the requested store slug out of the URL via the headers our
  // middleware sets. `x-search` is the raw "?storeSlug=foo&..." string;
  // empty/missing means "use default owned store". `x-pathname` is
  // the request path — used below to highlight the active nav item.
  // headers() is synchronous in Next 14; switching to async-aware
  // shape will require revisiting on the Next 15 upgrade.
  const headerList = headers();
  const search = headerList.get("x-search") ?? "";
  const pathname = headerList.get("x-pathname") ?? "/dashboard";
  const requestedSlug =
    new URLSearchParams(search).get("storeSlug") ?? undefined;

  // resolveDashboardStore handles: not-signed-in → redirect, no-store
  // → redirect, cross-tenant probe → fall back to default. The page-
  // level call to the same helper will return the same store.
  const { store, availableStores, isAdmin, userId } =
    await resolveDashboardStore({
      requestedSlug,
      noStoreRedirect: "/signin?next=/dashboard",
    });

  // User-pill identity = the SIGNED-IN user (might be admin viewing
  // someone else's store), not the store owner.
  const displayUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, role: true },
  });
  if (!displayUser) redirect("/signin?next=/dashboard");

  // Unread-action badges — counted in parallel for the active store.
  //   • pendingOrdersCount → orders awaiting vendor fulfilment (PAID).
  //   • unreadMessagesCount → ContactMessage rows still readAt = null.
  // Both run per-request; covered by [storeId, …] composite indexes.
  const [pendingOrdersCount, unreadMessagesCount] = await Promise.all([
    prisma.order.count({
      where: {
        storeId: store.id,
        status: VENDOR_ACTION_REQUIRED_STATUS,
      },
    }),
    prisma.contactMessage.count({
      where: {
        storeId: store.id,
        readAt: null,
      },
    }),
  ]);

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-3.5rem)] bg-background text-foreground">
      <DashboardSidebarToggle>
        <Sidebar
          storeName={store.name}
          storeSlug={store.slug}
          storeLogoUrl={store.logoUrl ?? null}
          userName={displayUser.name ?? displayUser.email ?? ""}
          userEmail={displayUser.email ?? ""}
          isAdmin={displayUser.role === "ADMIN"}
          pendingOrdersCount={pendingOrdersCount}
          unreadMessagesCount={unreadMessagesCount}
          pathname={pathname}
        />
      </DashboardSidebarToggle>

      {/* Main column — topbar + scrollable content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          storeSlug={store.slug}
          currentStore={{
            id: store.id,
            slug: store.slug,
            name: store.name,
            logoUrl: store.logoUrl ?? null,
          }}
          availableStores={availableStores}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Sidebar — operator-curated nav rail. Uses var(--sidebar*) tokens
 * so the rail follows the active radix-nova palette in light + dark.
 * Nav links append `?storeSlug=<current>` so switching pages keeps
 * the picker selection intact.
 * ───────────────────────────────────────────────────────────────── */
function Sidebar({
  storeName,
  storeSlug,
  storeLogoUrl,
  userName,
  userEmail,
  isAdmin,
  pendingOrdersCount,
  unreadMessagesCount,
  pathname,
}: {
  storeName: string;
  storeSlug: string | null;
  storeLogoUrl: string | null;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  pendingOrdersCount: number;
  unreadMessagesCount: number;
  pathname: string;
}) {
  // Build a query string suffix to append to dashboard nav hrefs so
  // the picker selection survives page navigation. Empty when no
  // explicit slug is needed (i.e. the user is on their default owned
  // store) — falling back to the owner's default keeps URLs short.
  const suffix = storeSlug ? `?storeSlug=${encodeURIComponent(storeSlug)}` : "";

  return (
    <aside
      className="flex w-64 shrink-0 flex-col border-r"
      style={{
        background: "var(--color-sidebar)",
        color: "var(--color-sidebar-foreground)",
        borderColor: "var(--color-sidebar-border)",
      }}
    >
      {/* Brand row */}
      <div
        className="flex h-14 items-center gap-2.5 border-b px-4"
        style={{ borderColor: "var(--color-sidebar-border)" }}
      >
        {storeLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={storeLogoUrl}
            alt={storeName}
            className="h-8 w-8 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
            style={{
              background: "var(--color-sidebar-primary)",
              color: "var(--color-sidebar-primary-foreground)",
            }}
          >
            {storeName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {storeName}
          </p>
          <p className="truncate text-xs opacity-60">
            {storeSlug ? `/${storeSlug}` : "ยังไม่มีร้าน"}
          </p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 text-sm">
        <NavGroup label="หน้าหลัก">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            pathname={pathname}
            exact
          >
            ภาพรวม
          </NavItem>
        </NavGroup>

        <NavGroup label="สินค้า">
          <NavItem
            href={`/dashboard/store/products${suffix}`}
            icon={<Package className="h-4 w-4" />}
            pathname={pathname}
          >
            สินค้าของร้าน
          </NavItem>
          <NavItem
            href={`/dashboard/store/categories${suffix}`}
            icon={<Tags className="h-4 w-4" />}
            pathname={pathname}
          >
            หมวดหมู่
          </NavItem>
          <NavItem
            href="/dashboard/catalog"
            icon={<PlusSquare className="h-4 w-4" />}
            pathname={pathname}
          >
            Browse catalog
          </NavItem>
          <NavItem
            href="/dashboard/products/import"
            icon={<PlusSquare className="h-4 w-4" />}
            pathname={pathname}
          >
            นำเข้าจาก URL
          </NavItem>
        </NavGroup>

        <NavGroup label="ร้านค้า">
          <NavItem
            href={`/dashboard/store/orders${suffix}`}
            icon={<ShoppingBag className="h-4 w-4" />}
            badge={pendingOrdersCount}
            pathname={pathname}
          >
            ออเดอร์
          </NavItem>
          <NavItem
            href={`/dashboard/store/messages${suffix}`}
            icon={<Mail className="h-4 w-4" />}
            badge={unreadMessagesCount}
            pathname={pathname}
          >
            ข้อความ
          </NavItem>
          <NavItem
            href={`/dashboard/store/settings${suffix}`}
            icon={<Settings className="h-4 w-4" />}
            pathname={pathname}
          >
            ตั้งค่าร้าน
          </NavItem>
        </NavGroup>

        {isAdmin && (
          <NavGroup label="Admin">
            <NavItem
              href="/admin"
              icon={<StoreIcon className="h-4 w-4" />}
              pathname={pathname}
            >
              Admin console
            </NavItem>
          </NavGroup>
        )}
      </nav>

      {/* User pill */}
      <div
        className="border-t px-3 py-3"
        style={{ borderColor: "var(--color-sidebar-border)" }}
      >
        <div
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
          style={{ background: "var(--color-sidebar-accent)" }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{
              background: "var(--color-sidebar-primary)",
              color: "var(--color-sidebar-primary-foreground)",
            }}
          >
            {(userName || userEmail).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 text-xs">
            <p
              className="truncate font-medium"
              style={{ color: "var(--color-sidebar-accent-foreground)" }}
            >
              {userName || userEmail}
            </p>
            <p className="truncate opacity-60">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider opacity-60">
        {label}
      </p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
  badge,
  pathname,
  exact,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  // Optional unread-count pill. Rendered only when > 0; the layout
  // already skips the count query when there's no store so passing
  // 0/undefined here is the no-store default.
  badge?: number;
  // Current request pathname, passed through from the server layout
  // via the x-pathname header. Used to highlight the active item.
  pathname: string;
  // For overview ("/dashboard") only — without this every child
  // /dashboard/* path would also light up the home item.
  exact?: boolean;
}) {
  // Strip the query-string off the link href before comparing — nav
  // items append `?storeSlug=...` to preserve the picker selection so
  // a substring match on the bare path is what we want.
  const linkPath = href.split("?")[0]!;
  const active = exact
    ? pathname === linkPath
    : pathname === linkPath || pathname.startsWith(`${linkPath}/`);

  // Badge a11y: the screen-reader label echoes the link's own text
  // (`children`) when it's a string so the reader announces e.g.
  // "ออเดอร์, ค้าง 3 รายการ" instead of a bare digit.
  const childLabel = typeof children === "string" ? children : "รายการ";
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition ${
          active ? "font-medium" : "hover:opacity-100"
        }`}
        style={{
          color: active
            ? "var(--color-sidebar-accent-foreground)"
            : "var(--color-sidebar-foreground)",
          background: active ? "var(--color-sidebar-accent)" : undefined,
        }}
      >
        <span className={active ? "opacity-100" : "opacity-70"}>{icon}</span>
        <span className="flex-1 truncate">{children}</span>
        {typeof badge === "number" && badge > 0 && (
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
            style={{
              background: "var(--color-sidebar-primary)",
              color: "var(--color-sidebar-primary-foreground)",
            }}
            aria-label={`${childLabel} ค้าง ${badge} รายการ`}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Topbar — slim 56px row. Hosts the StorePicker (multi-store admins
 * + future multi-owner users) plus the "ดูหน้าร้าน" CTA so the
 * operator can preview the picked store's public face in one click.
 * ───────────────────────────────────────────────────────────────── */
function Topbar({
  storeSlug,
  currentStore,
  availableStores,
  isAdmin,
}: {
  storeSlug: string | null;
  currentStore: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
  };
  availableStores: { id: string; slug: string; name: string; logoUrl: string | null }[];
  isAdmin: boolean;
}) {
  return (
    // pl-14 below md leaves space for the fixed mobile burger button
    // (`fixed left-3 top-3 z-30`, 9*4 = 36px wide + 12px margin). On
    // md+ the rail occupies the column to the left so the burger is
    // hidden and the regular px-4/6/8 padding takes over.
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background pl-14 pr-3 sm:gap-3 sm:px-6 lg:px-8">
      <StorePicker
        currentStore={currentStore}
        availableStores={availableStores}
        isAdmin={isAdmin}
      />
      <div className="flex-1" />
      {storeSlug && (
        <a
          href={`/stores/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ดูหน้าร้าน"
          // Icon-only below sm, label+icon at sm+. Keeps the topbar
          // from overflowing on 320–360px phones where the burger,
          // StorePicker (180px min), and full-label CTA combined
          // pushed the picker off-screen.
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-2 text-sm font-medium hover:bg-accent sm:px-3"
        >
          <span className="hidden sm:inline">ดูหน้าร้าน</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </header>
  );
}
