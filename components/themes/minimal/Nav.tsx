interface NavLink {
  label?: string;
  href?: string;
}

interface NavContent {
  brand?: string;
  logoUrl?: string;
  links?: NavLink[];
}

export function MinimalNav({ content }: { content: NavContent }) {
  const links = content.links ?? [];
  return (
    <nav className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-2">
        {content.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.logoUrl}
            alt={content.brand ?? ""}
            className="h-8 w-8 rounded-sm object-cover"
          />
        )}
        {content.brand && <span className="font-semibold">{content.brand}</span>}
      </div>
      <div className="hidden items-center gap-6 md:flex">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.href ?? "#"}
            className="text-sm text-gray-700 transition hover:text-black"
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
