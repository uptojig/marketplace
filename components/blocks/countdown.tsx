"use client";

import { useEffect, useState } from "react";

export function CountdownBlock({ headline, target_at, ctaText, ctaLink }: {
  headline?: string;
  target_at?: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!target_at) return;
    const target = new Date(target_at).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target_at]);

  return (
    <div className="text-center px-6 py-12 bg-card border-y border-border/30">
      {headline && <h3 className="text-lg font-bold mb-4">{headline}</h3>}
      <div className="flex justify-center gap-4">
        {[
          { val: timeLeft.days, label: "วัน" },
          { val: timeLeft.hours, label: "ชั่วโมง" },
          { val: timeLeft.mins, label: "นาที" },
          { val: timeLeft.secs, label: "วินาที" },
        ].map((t, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl font-bold tabular-nums w-16 h-16 flex items-center justify-center rounded-xl bg-zinc-800"
              style={{ color: "var(--primary, #a855f7)" }}>
              {String(t.val).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">{t.label}</div>
          </div>
        ))}
      </div>
      {ctaText && (
        <a href={ctaLink || "#"} className="inline-block mt-6 px-6 py-2.5 rounded-lg font-semibold text-white text-sm"
          style={{ backgroundColor: "var(--primary, #a855f7)" }}>
          {ctaText}
        </a>
      )}
    </div>
  );
}
