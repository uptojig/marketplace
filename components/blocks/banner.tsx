"use client";

export function BannerBlock({ text, ctaText, ctaLink }: {
  text?: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  return (
    <div className="bg-purple-600 text-white text-center py-2.5 px-4 text-sm font-medium">
      <span>{text || "โปรโมชั่นพิเศษ"}</span>
      {ctaText && (
        <a href={ctaLink || "#"} className="ml-2 underline underline-offset-2 hover:opacity-80">
          {ctaText}
        </a>
      )}
    </div>
  );
}
