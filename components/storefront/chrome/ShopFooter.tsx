import Link from "next/link";
import { formatStoreAddressLines } from "@/lib/format/storeAddress";
import {
  StoreSocialIcons,
  StoreContactRows,
} from "@/components/shop/StoreSocialIcons";

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  facebookUrl?: string | null;
  messengerUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
  lineId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

interface Props {
  store: StoreLite;
  categories?: string[];
  /** Hex accent — used for the brand square + section underlines. */
  accent?: string;
  decorationGlyph?: string | null;
  glyphStyle?: "filled" | "tinted";
}

/**
 * Phase-1 unified storefront footer.
 *
 * Replaces the inline default footer AND the per-template caselnw /
 * mini-mops footers. Visual variation comes from `tokens` — the
 * structure (4 columns + bottom bar) is the same for everyone.
 */
export function ShopFooter({
  store,
  categories = [],
  accent = "#0f172a",
  decorationGlyph = null,
  glyphStyle = "filled",
}: Props) {
  const addressLines = formatStoreAddressLines(store);
  const categoryHref = (cat: string) =>
    `/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`;
  const glyph = decorationGlyph ?? store.name.slice(0, 1).toUpperCase();

  return (
    <footer className="mt-16 border-t border-[var(--shop-border)] bg-[var(--shop-card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-9 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <span
                className="inline-flex size-9 items-center justify-center rounded-lg text-sm font-extrabold"
                style={
                  glyphStyle === "tinted"
                    ? {
                        backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                        color: `color-mix(in srgb, ${accent} 80%, black)`,
                      }
                    : { backgroundColor: accent, color: "#ffffff" }
                }
              >
                {glyph}
              </span>
            )}
            <span className="text-base font-extrabold tracking-tight text-[var(--shop-ink)]">
              {store.name}
            </span>
          </div>
          {(store.description || store.tagline) && (
            <p className="text-sm text-[var(--shop-ink-muted)] max-w-sm">
              {store.description ?? store.tagline}
            </p>
          )}
          <p className="mt-4 text-xs text-[var(--shop-ink-muted)]">
            ส่งสินค้าทุกวันจันทร์–ศุกร์ · ตอบเร็ว 9:00–21:00
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[var(--shop-ink)] mb-3">
            หมวดหมู่
          </h4>
          {categories.length > 0 ? (
            <ul className="space-y-2 text-sm text-[var(--shop-ink-muted)]">
              {categories.slice(0, 6).map((c) => (
                <li key={c}>
                  <Link
                    href={categoryHref(c)}
                    className="hover:text-[var(--shop-ink)]"
                  >
                    {c}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/stores/${store.slug}/category`}
                  className="text-[var(--shop-primary)] hover:underline font-medium"
                >
                  ดูทั้งหมด →
                </Link>
              </li>
            </ul>
          ) : (
            <Link
              href={`/stores/${store.slug}/category`}
              className="text-sm text-[var(--shop-primary)] hover:underline font-medium"
            >
              ดูสินค้าทั้งหมด →
            </Link>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[var(--shop-ink)] mb-3">
            บริการลูกค้า
          </h4>
          <ul className="space-y-2 text-sm text-[var(--shop-ink-muted)]">
            <li>
              <Link
                href={`/stores/${store.slug}/help/order-guide`}
                className="hover:text-[var(--shop-ink)]"
              >
                วิธีสั่งซื้อ
              </Link>
            </li>
            <li>
              <Link
                href={`/stores/${store.slug}/shipping`}
                className="hover:text-[var(--shop-ink)]"
              >
                การจัดส่ง
              </Link>
            </li>
            <li>
              <Link
                href={`/stores/${store.slug}/returns`}
                className="hover:text-[var(--shop-ink)]"
              >
                เปลี่ยน / คืน
              </Link>
            </li>
            <li>
              <Link
                href={`/stores/${store.slug}/help/faq`}
                className="hover:text-[var(--shop-ink)]"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href={`/stores/${store.slug}/contact`}
                className="hover:text-[var(--shop-ink)]"
              >
                ติดต่อร้าน
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[var(--shop-ink)] mb-3">
            ที่อยู่ & ช่องทาง
          </h4>
          {addressLines.length > 0 ? (
            <div className="space-y-1 text-sm text-[var(--shop-ink-muted)] mb-3">
              {addressLines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--shop-ink-muted)] mb-3">
              ยังไม่ได้กรอกที่อยู่
            </p>
          )}
          <div className="space-y-2">
            <StoreContactRows store={store} />
          </div>
          <div className="mt-4">
            <StoreSocialIcons store={store} />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--shop-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--shop-ink-muted)]">
          <p>
            © {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/stores/${store.slug}/help/terms`}
              className="hover:text-[var(--shop-ink)]"
            >
              ข้อกำหนด
            </Link>
            <Link
              href={`/stores/${store.slug}/help/privacy`}
              className="hover:text-[var(--shop-ink)]"
            >
              ความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
