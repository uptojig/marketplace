interface FooterContent {
  brand?: string;
  tagline?: string;
  copyright?: string;
}

export function MinimalFooter({ content }: { content: FooterContent }) {
  return (
    <footer className="border-t py-10 text-sm text-gray-600">
      {content.brand && <p className="font-medium text-gray-900">{content.brand}</p>}
      {content.tagline && <p className="mt-1">{content.tagline}</p>}
      {content.copyright && (
        <p className="mt-4 text-xs text-gray-400">{content.copyright}</p>
      )}
    </footer>
  );
}
