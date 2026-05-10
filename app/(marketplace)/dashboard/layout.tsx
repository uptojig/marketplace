import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Settings,
  Store as StoreIcon,
  ExternalLink,
  PlusSquare,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebarToggle } from "@/components/dashboard/sidebar-toggle";

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
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin?next=/dashboard");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      role: true,
      store: { select: { slug: true, name: true, logoUrl: true } },
    },
  });
  if (!user) redirect("/signin?next=/dashboard");

  const storeSlug = user.store?.slug ?? null;

  return (
    <div className="-mx-4 -my-8 flex min-h-[calc(100vh-3.5rem)] bg-background text-foreground">
      <DashboardSidebarToggle>
        <Sidebar
          storeName={user.store?.name ?? "ร้านของฉัน"}
          storeSlug={storeSlug}
          storeLogoUrl={user.store?.logoUrl ?? null}
          userName={user.name ?? user.email ?? ""}
          userEmail={user.email ?? ""}
          isAdmin={user.role === "ADMIN"}
        />
      </DashboardSidebarToggle>

      {/* Main column — topbar + scrollable content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar storeSlug={storeSlug} />
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
 * ───────────────────────────────────────────────────────────────── */
function Sidebar({
  storeName,
  storeSlug,
  storeLogoUrl,
  userName,
  userEmail,
  isAdmin,
}: {
  storeName: string;
  storeSlug: string | null;
  storeLogoUrl: string | null;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
}) {
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
          <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
            ภาพรวม
          </NavItem>
        </NavGroup>

        <NavGroup label="สินค้า">
          <NavItem
            href="/dashboard/store/products"
            icon={<Package className="h-4 w-4" />}
          >
            สินค้าของร้าน
          </NavItem>
          <NavItem
            href="/dashboard/store/categories"
            icon={<Tags className="h-4 w-4" />}
          >
            หมวดหมู่
          </NavItem>
          <NavItem
            href="/dashboard/catalog"
            icon={<PlusSquare className="h-4 w-4" />}
          >
            Browse catalog
          </NavItem>
          <NavItem
            href="/dashboard/products/import"
            icon={<PlusSquare className="h-4 w-4" />}
          >
            นำเข้าจาก URL
          </NavItem>
        </NavGroup>

        <NavGroup label="ร้านค้า">
          <NavItem
            href="/dashboard/store/settings"
            icon={<Settings className="h-4 w-4" />}
          >
            ตั้งค่าร้าน
          </NavItem>
          <NavItem href="/orders" icon={<ShoppingBag className="h-4 w-4" />}>
            ออเดอร์
          </NavItem>
        </NavGroup>

        {isAdmin && (
          <NavGroup label="Admin">
            <NavItem
              href="/admin"
              icon={<StoreIcon className="h-4 w-4" />}
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
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  // Active highlighting is handled per-pathname client-side in a
  // future iteration; for now every item renders neutral and the
  // current page's content area gives the contextual cue. Keeps
  // this component tree fully server-rendered.
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition hover:opacity-100"
        style={{ color: "var(--color-sidebar-foreground)" }}
      >
        <span className="opacity-70">{icon}</span>
        <span className="truncate">{children}</span>
      </Link>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Topbar — slim 56px row. Currently shows "ดูหน้าร้าน" CTA when the
 * operator owns a store. Search + notifications can plug in here
 * later without touching the page-level files.
 * ───────────────────────────────────────────────────────────────── */
function Topbar({ storeSlug }: { storeSlug: string | null }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex-1" />
      {storeSlug && (
        <a
          href={`/stores/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
        >
          ดูหน้าร้าน
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </header>
  );
}
