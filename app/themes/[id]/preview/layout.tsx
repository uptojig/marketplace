/**
 * Minimal layout for /themes/[id]/preview — explicitly NOT under the
 * (marketplace) route group, so the marketplace header/footer don't
 * wrap the salepage. We want the preview to look exactly like a live
 * salepage with our own thin top bar pinned above it.
 */
export default function SalepagePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
