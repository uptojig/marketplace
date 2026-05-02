interface FooterContent {
  brand?: string;
  tagline?: string;
  copyright?: string;
}

export function CuteFooter({ content }: { content: FooterContent }) {
  return (
    <footer className="rounded-2xl bg-pink-900 px-6 py-10 text-center text-pink-50">
      {content.brand && (
        <p className="text-lg font-bold">{content.brand}</p>
      )}
      {content.tagline && (
        <p className="mt-1 text-sm text-pink-200/80">{content.tagline}</p>
      )}
      {content.copyright && (
        <p className="mt-4 text-xs text-pink-300/60">{content.copyright}</p>
      )}
    </footer>
  );
}
