import Link from "next/link";
import type { GlobalFooter as GlobalFooterSchema } from "@/types/multi-page-schema";
import type { ThemeVariant } from "@/lib/landing/families";

interface Props {
  content: GlobalFooterSchema;
  theme: ThemeVariant;
  storeSlug: string;
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "Twitter",
  line: "LINE",
};

export function GlobalFooter({ content, theme, storeSlug }: Props) {
  if (!content) return null;
  // Rewrite footer nav hrefs to be relative to /stores/{slug}
  const resolveHref = (href?: string) => {
    if (!href) return `/stores/${storeSlug}`;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (href === "/" || href === "") return `/stores/${storeSlug}`;
    const clean = href.startsWith("/") ? href.slice(1) : href;
    return `/stores/${storeSlug}/${clean}`;
  };

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand column — image OR name, not both. */}
          {content.brand && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                {content.brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content.brand.logoUrl}
                    alt={content.brand.logoAlt ?? content.brand.name ?? "Logo"}
                    className="h-10 w-auto"
                  />
                ) : content.brand.name ? (
                  <span className="text-lg font-semibold text-white">
                    {content.brand.name}
                  </span>
                ) : null}
              </div>
              {content.brand.description && (
                <p className="text-sm text-stone-400 leading-relaxed">{content.brand.description}</p>
              )}
            </div>
          )}

          {/* Link columns */}
          {content.columns?.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {(col.links ?? []).map((link, j) => (
                  <li key={j}>
                    <Link
                      href={resolveHref(link.href ?? (link as Record<string, unknown>).url as string ?? "#")}
                      className="text-sm text-stone-400 hover:text-white transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          {content.contact && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                ติดต่อเรา
              </h4>
              <ul className="space-y-2 text-sm text-stone-400">
                {content.contact.phone && (
                  <li>
                    <a href={`tel:${content.contact.phone}`} className="hover:text-white">
                      📞 {content.contact.phone}
                    </a>
                  </li>
                )}
                {content.contact.email && (
                  <li>
                    <a href={`mailto:${content.contact.email}`} className="hover:text-white">
                      ✉️ {content.contact.email}
                    </a>
                  </li>
                )}
                {content.contact.lineId && (
                  <li>LINE: @{content.contact.lineId}</li>
                )}
                {content.contact.address && <li className="leading-relaxed">{content.contact.address}</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Newsletter */}
        {content.newsletter && (
          <div className="border-t border-stone-700 py-8 mb-8">
            <div className="max-w-md mx-auto text-center">
              <h4 className="text-lg font-semibold text-white mb-3">{content.newsletter.title}</h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder={content.newsletter.placeholder}
                  className="flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded text-white placeholder:text-stone-500"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-stone-900 rounded font-medium hover:bg-stone-100 transition"
                >
                  {content.newsletter.ctaText}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Bottom row */}
        <div className="border-t border-stone-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {content.copyright && (
            <p className="text-xs text-stone-500">{content.copyright}</p>
          )}

          {content.socialLinks && content.socialLinks.length > 0 && (
            <div className="flex gap-3">
              {content.socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href ?? (social as Record<string, unknown>).url as string ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LABELS[social.platform] ?? social.platform}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors text-xs font-bold uppercase"
                >
                  {social.platform.charAt(0)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
