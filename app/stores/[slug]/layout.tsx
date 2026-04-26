import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, ShoppingCart, User, ChevronDown, Menu } from "lucide-react";
import { ShopCartIndicator } from "@/components/shop/ShopCartIndicator";
import { ShopFloatingButtons } from "@/components/shop/ShopFloatingButtons";
import { CookiesBar } from "@/components/shop/CookiesBar";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const primary = store.primaryColor ?? "#008BF8";

  // Distinct category names from this store's active products
  const categoryRows = await prisma.product.findMany({
    where: { storeId: store.id, active: true, categoryName: { not: null } },
    select: { categoryName: true },
    distinct: ["categoryName"],
    orderBy: { categoryName: "asc" },
    take: 50,
  });
  const categories = categoryRows
    .map((r) => r.categoryName)
    .filter((c): c is string => !!c);

  return (
    <div
      className="min-h-screen bg-[#f5f6f8]"
      style={{ ["--shop-primary" as string]: primary }}
    >
      {/* Top header */}
      <header className="bg-white border-b">
        {/* Top bar — logo, search, lang, account, cart */}
        <div className="hidden lg:block border-b">
          <div className="container mx-auto max-w-[1200px] px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo + brand */}
              <Link href={`/stores/${store.slug}`} className="flex items-center gap-3">
                {store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded text-lg font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {store.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <h1 className="text-xl font-semibold leading-tight">{store.name}</h1>
              </Link>

              {/* Search + actions */}
              <div className="flex items-center gap-3">
                <form
                  action={`/stores/${store.slug}`}
                  className="flex items-center rounded-full border bg-white pl-4 pr-1 py-1 w-72"
                >
                  <input
                    name="q"
                    placeholder="ค้นหา"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <button type="submit" aria-label="Search" className="p-2 text-gray-500 hover:text-gray-700">
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {/* Language flag */}
                <button
                  type="button"
                  className="flex items-center gap-1 rounded p-1 hover:bg-gray-50"
                  aria-label="Languages"
                >
                  <span className="inline-block h-4 w-6 rounded-sm overflow-hidden">
                    <span className="block h-1/3 bg-red-600" />
                    <span className="block h-1/3 bg-white" />
                    <span className="block h-1/3 bg-blue-700" />
                  </span>
                </button>

                <Link
                  href="/signin"
                  aria-label="Account"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white"
                >
                  <User className="h-4 w-4" />
                </Link>

                <Link href="/cart" aria-label="Cart" className="relative p-2">
                  <ShoppingCart className="h-5 w-5" />
                  <ShopCartIndicator />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Menu bar — categories + nav */}
        <div className="hidden lg:block">
          <div className="container mx-auto max-w-[1200px] px-4">
            <div className="flex items-center justify-between">
              {/* Category mega-menu */}
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: primary }}
                >
                  <Menu className="h-4 w-4" />
                  หมวดหมู่สินค้า
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute left-0 top-full z-30 hidden min-w-[260px] rounded-md border bg-white shadow-lg group-hover:block">
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-500">
                      ยังไม่มีหมวดหมู่ — import สินค้าก่อน
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto py-1">
                      <Link
                        href={`/stores/${store.slug}`}
                        className="block px-4 py-2 text-sm font-medium hover:bg-gray-50"
                      >
                        ทั้งหมด
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/stores/${store.slug}?category=${encodeURIComponent(cat)}`}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right nav */}
              <nav className="flex items-center gap-1">
                <div className="group relative">
                  <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium hover:text-[var(--shop-primary)]">
                    เกี่ยวกับร้าน <ChevronDown className="h-3 w-3" />
                  </button>
                  <div className="absolute right-0 top-full z-30 hidden min-w-[200px] rounded-md border bg-white shadow-lg group-hover:block">
                    <Link href={`/stores/${store.slug}`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      รายละเอียดร้าน
                    </Link>
                    <Link href={`/stores/${store.slug}/help/faq`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      คำถามที่พบบ่อย
                    </Link>
                    <Link href={`/stores/${store.slug}/help/order-guide`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      วิธีการสั่งซื้อ
                    </Link>
                    <Link href={`/stores/${store.slug}/help/privacy`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      นโยบายความเป็นส่วนตัว
                    </Link>
                    <Link href={`/stores/${store.slug}/help/terms`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      ข้อกำหนดการใช้งาน
                    </Link>
                  </div>
                </div>
                <Link href="/orders" className="px-4 py-3 text-sm font-medium hover:text-[var(--shop-primary)]">
                  การสั่งซื้อของฉัน
                </Link>
                <Link href={`/stores/${store.slug}/contact`} className="px-4 py-3 text-sm font-medium hover:text-[var(--shop-primary)]">
                  ติดต่อร้านค้า
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile compact header */}
        <div className="lg:hidden flex items-center justify-between gap-2 px-4 py-3">
          <button aria-label="Menu" className="p-1">
            <Menu className="h-5 w-5" />
          </button>
          <Link href={`/stores/${store.slug}`} className="flex-1 text-center text-base font-semibold truncate">
            {store.name}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative p-1">
            <ShoppingCart className="h-5 w-5" />
            <ShopCartIndicator />
          </Link>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer service section */}
      <footer className="mt-12 bg-white border-t">
        <div className="container mx-auto max-w-[1200px] px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold">ตัวเลือกการจัดส่ง</h3>
              <div className="flex flex-wrap gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/shipping/thailand-post.svg"
                  alt="ไปรษณีย์ไทย"
                  title="ไปรษณีย์ไทย"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/shipping/flash-express.svg"
                  alt="Flash Express"
                  title="Flash Express"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">ตัวเลือกการชำระเงิน</h3>
              <div className="flex flex-wrap gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/payment/scb.svg"
                  alt="SCB"
                  title="โอนผ่าน SCB"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/payment/other.svg"
                  alt="Other payments"
                  title="ช่องทางอื่น"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info — 4 columns */}
        <div className="hidden lg:block border-t bg-white">
          <div className="container mx-auto max-w-[1200px] px-4 py-10">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <h3 className="mb-3 font-semibold">เกี่ยวกับเรา</h3>
                <p className="text-sm text-gray-600">
                  {store.description ?? store.tagline ?? store.name}
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">ลูกค้าสัมพันธ์</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><Link href={`/stores/${store.slug}/help/membership`} className="hover:text-gray-900">การสมัครสมาชิก</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/payment`} className="hover:text-gray-900">วิธีการชำระเงิน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/tax-invoice`} className="hover:text-gray-900">วิธีการขอใบกำกับภาษี</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/claim`} className="hover:text-gray-900">วิธีการเคลมสินค้า</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/warranty`} className="hover:text-gray-900">การประกันสินค้า</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/faq`} className="hover:text-gray-900">คำถามที่พบบ่อย (FAQs)</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">รู้จักเรา</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><Link href={`/stores/${store.slug}`} className="hover:text-gray-900">รายละเอียดร้าน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/order-guide`} className="hover:text-gray-900">วิธีการสั่งซื้อ</Link></li>
                  <li><Link href="/orders" className="hover:text-gray-900">การสั่งซื้อของฉัน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/privacy`} className="hover:text-gray-900">นโยบายความเป็นส่วนตัว</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/terms`} className="hover:text-gray-900">ข้อกำหนดการใช้งาน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/refund`} className="hover:text-gray-900">นโยบายการคืนเงิน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/shipping`} className="hover:text-gray-900">นโยบายการจัดส่ง</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">ที่อยู่ร้านค้า</h3>
                <p className="text-sm text-gray-600">
                  {store.name}<br />
                  Thailand
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">ติดต่อเรา</h3>
                <div className="flex gap-3 text-xl text-gray-600">
                  {store.contactEmail && (
                    <a
                      href={`mailto:${store.contactEmail}`}
                      aria-label="Email"
                      title={store.contactEmail}
                      className="hover:opacity-70"
                    >
                      ✉
                    </a>
                  )}
                  {store.contactPhone && (
                    <a
                      href={`tel:${store.contactPhone.replace(/[^0-9+]/g, "")}`}
                      aria-label="Phone"
                      title={store.contactPhone}
                      className="hover:opacity-70"
                    >
                      ☎
                    </a>
                  )}
                  {store.facebookUrl && (
                    <a
                      href={store.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="hover:opacity-70"
                    >
                      f
                    </a>
                  )}
                  {store.lineId && (
                    <a
                      href={`https://line.me/R/ti/p/${encodeURIComponent(
                        store.lineId.replace(/^@/, "~"),
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LINE"
                      title={store.lineId}
                      className="hover:opacity-70"
                    >
                      L
                    </a>
                  )}
                  {!store.contactEmail &&
                    !store.contactPhone &&
                    !store.facebookUrl &&
                    !store.lineId && (
                      <span className="text-xs text-gray-400">
                        ยังไม่ได้ตั้งค่า
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CookiesBar />
      <ShopFloatingButtons primaryColor={primary} />
    </div>
  );
}
