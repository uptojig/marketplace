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
  /** Accent hex for the brand square. Defaults to caselnw orange. */
  accent?: string;
}

export function CaselNwFooter({
  storeSlug,
  storeName,
  storeDescription,
  navCategories = [],
  accent = "#f97316",
}: Props) {
  const categoryHref = (cat: string) =>
    `/stores/${storeSlug}/category/${encodeURIComponent(cat)}`;

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="text-xl font-extrabold text-white flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center justify-center size-8 rounded-lg text-slate-900"
              style={{ backgroundColor: accent }}
            >
              ◉
            </span>
            {storeName}
          </div>
          <p className="text-sm text-slate-400 max-w-sm mb-4">
            {storeDescription ??
              "เคสมือถือคุณภาพ ดีไซน์ครบทุกแนว ส่งเร็วทั่วไทย ของแท้ 100% รับประกันความพอใจ"}
          </p>
          <p className="text-xs text-slate-500">
            ส่งสินค้าทุกวันจันทร์ – ศุกร์ · ติดต่อสอบถาม 9.00 – 21.00
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-3">หมวดหมู่</h4>
          <ul className="space-y-2 text-sm">
            {navCategories.slice(0, 5).map((c) => (
              <li key={c.category}>
                <Link
                  href={categoryHref(c.category)}
                  className="hover:text-white transition-colors"
                >
                  {c.label}
                </Link>
              </li>
            ))}
            {navCategories.length === 0 && (
              <li>
                <Link
                  href={`/stores/${storeSlug}/products`}
                  className="hover:text-white transition-colors"
                >
                  สินค้าทั้งหมด
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-3">บริการลูกค้า</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={`/stores/${storeSlug}/about`}
                className="hover:text-white transition-colors"
              >
                เกี่ยวกับร้าน
              </Link>
            </li>
            <li>
              <Link
                href={`/stores/${storeSlug}/shipping`}
                className="hover:text-white transition-colors"
              >
                วิธีจัดส่ง
              </Link>
            </li>
            <li>
              <Link
                href={`/stores/${storeSlug}/returns`}
                className="hover:text-white transition-colors"
              >
                เปลี่ยน/คืน
              </Link>
            </li>
            <li>
              <Link
                href={`/stores/${storeSlug}/contact`}
                className="hover:text-white transition-colors"
              >
                ติดต่อเรา
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {storeName}. สงวนลิขสิทธิ์
          </p>
          <div className="flex gap-4">
            <Link
              href={`/stores/${storeSlug}/terms`}
              className="hover:text-slate-300"
            >
              ข้อกำหนด
            </Link>
            <Link
              href={`/stores/${storeSlug}/privacy`}
              className="hover:text-slate-300"
            >
              ความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
