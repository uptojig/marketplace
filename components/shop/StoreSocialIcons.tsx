import {
  Facebook,
  Instagram,
  Globe,
  MessageSquare,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";

export interface StoreSocialFields {
  contactEmail?: string | null;
  contactPhone?: string | null;
  facebookUrl?: string | null;
  messengerUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  lineId?: string | null;
}

interface IconLink {
  key: string;
  href: string;
  label: string;
  hoverColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}

// lucide ships the legacy Twitter bird, not the new X mark
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function buildLinks(s: StoreSocialFields): IconLink[] {
  const links: IconLink[] = [];
  if (s.facebookUrl) {
    links.push({
      key: "fb",
      href: s.facebookUrl,
      label: "Facebook",
      hoverColor: "#1877f2",
      Icon: Facebook,
    });
  }
  if (s.messengerUrl) {
    links.push({
      key: "msg",
      href: s.messengerUrl,
      label: "Messenger",
      hoverColor: "#0084ff",
      Icon: MessageSquare,
    });
  }
  if (s.twitterUrl) {
    links.push({
      key: "x",
      href: s.twitterUrl,
      label: "X (Twitter)",
      hoverColor: "#000000",
      Icon: XIcon,
    });
  }
  if (s.instagramUrl) {
    links.push({
      key: "ig",
      href: s.instagramUrl,
      label: "Instagram",
      hoverColor: "#e1306c",
      Icon: Instagram,
    });
  }
  if (s.websiteUrl) {
    links.push({
      key: "web",
      href: s.websiteUrl,
      label: "Website",
      hoverColor: "#374151",
      Icon: Globe,
    });
  }
  if (s.lineId) {
    links.push({
      key: "line",
      href: `https://line.me/R/ti/p/${encodeURIComponent(s.lineId.replace(/^@/, "~"))}`,
      label: "LINE",
      hoverColor: "#06c755",
      Icon: MessageCircle,
    });
  }
  return links;
}

export function StoreSocialIcons({
  store,
  emptyText,
}: {
  store: StoreSocialFields;
  emptyText?: string;
}) {
  const links = buildLinks(store);
  if (links.length === 0) {
    return emptyText ? (
      <span className="text-xs text-gray-400">{emptyText}</span>
    ) : null;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-current hover:text-[var(--icon-hover)]"
          style={{ ["--icon-hover" as string]: l.hoverColor }}
        >
          <l.Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

/**
 * Inline contact rows used on the contact page (envelope + phone with text).
 */
export function StoreContactRows({ store }: { store: StoreSocialFields }) {
  return (
    <div className="space-y-2 text-sm text-gray-700">
      {store.contactEmail && (
        <a
          href={`mailto:${store.contactEmail}`}
          className="flex items-center gap-2 hover:text-[var(--shop-primary)]"
        >
          <Mail className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="break-all">{store.contactEmail}</span>
        </a>
      )}
      {store.contactPhone && (
        <a
          href={`tel:${store.contactPhone.replace(/[^0-9+]/g, "")}`}
          className="flex items-center gap-2 hover:text-[var(--shop-primary)]"
        >
          <Phone className="h-4 w-4 shrink-0 text-gray-400" />
          <span>{store.contactPhone}</span>
        </a>
      )}
    </div>
  );
}
