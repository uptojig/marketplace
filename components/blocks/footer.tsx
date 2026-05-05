"use client";

export function FooterBlock({ brandText, links, contact, social, copyright }: {
  brandText?: string;
  links?: Array<{ label: string; href: string }>;
  contact?: { phone?: string; email?: string; lineOa?: string };
  social?: Array<{ platform: string; url: string }>;
  copyright?: string;
}) {
  return (
    <footer className="bg-zinc-900 text-zinc-400 px-6 py-10 mt-auto">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          {brandText && <div className="text-white font-semibold mb-2">{brandText}</div>}
          {contact && (
            <div className="space-y-1 text-xs">
              {contact.phone && <p>โทร: {contact.phone}</p>}
              {contact.email && <p>อีเมล: {contact.email}</p>}
              {contact.lineOa && <p>LINE OA: {contact.lineOa}</p>}
            </div>
          )}
        </div>
        {links && links.length > 0 && (
          <div>
            <div className="text-white text-sm font-medium mb-2">ลิงก์</div>
            <div className="space-y-1">
              {links.map((link, i) => (
                <a key={i} href={link.href} className="block text-xs hover:text-white transition">{link.label}</a>
              ))}
            </div>
          </div>
        )}
        {social && social.length > 0 && (
          <div>
            <div className="text-white text-sm font-medium mb-2">ติดตามเรา</div>
            <div className="flex gap-3">
              {social.map((s, i) => (
                <a key={i} href={s.url} className="text-xs hover:text-white transition capitalize">{s.platform}</a>
              ))}
            </div>
          </div>
        )}
      </div>
      {copyright && (
        <div className="text-center text-[10px] text-zinc-600 mt-8 pt-4 border-t border-zinc-800">{copyright}</div>
      )}
    </footer>
  );
}
