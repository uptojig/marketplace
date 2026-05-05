"use client";

export function LogoBlock({ imageUrl, svgCode, altText, brandText, linkTo = "/", size = "md" }: {
  imageUrl?: string;
  svgCode?: string;
  altText?: string;
  brandText?: string;
  linkTo?: string;
  size?: string;
}) {
  const sizeClass = size === "lg" ? "h-12" : size === "sm" ? "h-6" : "h-8";

  return (
    <div className="px-6 py-4 flex items-center">
      <a href={linkTo} className="flex items-center gap-2">
        {svgCode ? (
          <div className={`${sizeClass} w-auto flex items-center [&>svg]:w-full [&>svg]:h-full`} dangerouslySetInnerHTML={{ __html: svgCode }} />
        ) : imageUrl ? (
          <img src={imageUrl} alt={altText || brandText || "โลโก้"} className={`${sizeClass} w-auto object-contain`} />
        ) : (
          <div className={`${sizeClass} px-3 bg-zinc-800 rounded flex items-center text-xs text-zinc-400`}>{brandText || altText || "โลโก้"}</div>
        )}
        {brandText && (imageUrl || svgCode) && <span className="font-semibold text-sm">{brandText}</span>}
      </a>
    </div>
  );
}
