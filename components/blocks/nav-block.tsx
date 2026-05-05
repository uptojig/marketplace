"use client";

import { ShoppingCart, Menu } from "lucide-react";

export function NavBlock({ brandText, links, showCart = true }: {
  brandText?: string;
  links?: Array<{ label: string; href: string }>;
  showCart?: boolean;
}) {
  return (
    <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Menu className="size-5 text-muted-foreground md:hidden" />
        {brandText && <span className="font-semibold text-sm tracking-tight">{brandText}</span>}
      </div>
      {links && links.length > 0 && (
        <div className="hidden md:flex items-center gap-6">
          {links.map((link, i) => (
            <a key={i} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      )}
      {showCart && (
        <button className="relative">
          <ShoppingCart className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      )}
    </nav>
  );
}
