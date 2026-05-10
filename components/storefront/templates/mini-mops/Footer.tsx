import Link from "next/link";

interface NavCategory {
  label: string;
  category: string;
}

interface Props {
  storeSlug: string;
  storeName: string;
  storeDescription?: string | null;
  navCategories?: NavCategory[];
  /** Hex accent — defaults to emerald-600 (#10b981). */
  accent?: string;
}

export function MiniMopsFooter({
  storeSlug,
  storeName,
  storeDescription,
  navCategories = [],
  accent = "#10b981",
}: Props) {
  const categoryHref = (cat: string) =>
    `/stores/${storeSlug}/category/${encodeURIComponent(cat)}`;
  const accentDeep = `color-mix(in srgb, ${accent} 75%, black)`;
  const accentTint = `color-mix(in srgb, ${accent} 18%, transparent)`;

  return (
    <footer className="bg-white border-t border-gray-200 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div
              className="text-2xl font-black tracking-tight flex items-center gap-2 mb-4"
              style={{ color: accentDeep }}
            >
              <span
                className="p-1 rounded-lg"
                style={{ backgroundColor: accentTint }}
              >
                ✨
              </span>
              {storeName}
            </div>
            <p className="text-gray-500 max-w-sm mb-6">
              {storeDescription ??
                "แหล่งรวมของใช้ในบ้าน ของใช้ในครัว และเฟอร์นิเจอร์สุดชิค ที่จะช่วยให้บ้านของคุณน่าอยู่และมีสไตล์ในทุกๆ มุม"}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">หมวดหมู่สินค้า</h4>
            <ul className="space-y-2 text-gray-500">
              {navCategories.length > 0
                ? navCategories.slice(0, 4).map((c) => (
                    <li key={c.category}>
                      <Link
                        href={categoryHref(c.category)}
                        className="transition-colors"
                        style={{ color: undefined }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = accent;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "";
                        }}
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))
                : null}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">บริการลูกค้า</h4>
            <ul className="space-y-2 text-gray-500">
              <li>
                <Link
                  href={`/stores/${storeSlug}/about`}
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "";
                  }}
                >
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link
                  href={`/stores/${storeSlug}/shipping`}
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "";
                  }}
                >
                  นโยบายการจัดส่ง
                </Link>
              </li>
              <li>
                <Link
                  href={`/stores/${storeSlug}/returns`}
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "";
                  }}
                >
                  การรับประกันและคืนสินค้า
                </Link>
              </li>
              <li>
                <Link
                  href={`/stores/${storeSlug}/contact`}
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "";
                  }}
                >
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} {storeName}. สงวนลิขสิทธิ์
          </p>
          <div className="flex gap-4">
            <Link href={`/stores/${storeSlug}/terms`} className="hover:text-gray-600">
              ข้อกำหนดและเงื่อนไข
            </Link>
            <Link href={`/stores/${storeSlug}/privacy`} className="hover:text-gray-600">
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
