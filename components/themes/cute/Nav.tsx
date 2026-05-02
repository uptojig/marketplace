interface NavLink {
  label?: string;
  href?: string;
}

interface NavContent {
  brand?: string;
  logoUrl?: string;
  links?: NavLink[];
}

export function CuteNav({ content }: { content: NavContent }) {
  const links = content.links ?? [];
  return (
    <nav className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        {content.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.logoUrl}
            alt={content.brand ?? ""}
            className="h-9 w-9 rounded-full object-cover"
          />
        )}
        {content.brand && (
          <span className="text-base font-bold text-pink-700">{content.brand}</span>
        )}
      </div>
      <div className="hidden items-center gap-1 md:flex">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.href ?? "#"}
            className="rounded-full px-3 py-1.5 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
