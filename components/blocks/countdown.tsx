"use client";

/**
 * Countdown — sale-ending timer ("ลด 50% เหลืออีก 2:14:33").
 *
 * Uses daisyUI 5's native .countdown component for the digit
 * animation (CSS-only sliding numbers based on --value). Each
 * unit gets its own tile with a label below, wrapped in a card
 * that recolors via primary tokens. CTA is .btn.btn-primary.
 *
 * The setInterval still drives the math; we just write the
 * numbers into --value CSS vars on the inline <span>s, which
 * daisyUI animates.
 */

import { useEffect, useState } from "react";

export function CountdownBlock({
  headline,
  target_at,
  ctaText,
  ctaLink,
}: {
  headline?: string;
  target_at?: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

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

  const units = [
    { val: timeLeft.days, label: "วัน" },
    { val: timeLeft.hours, label: "ชั่วโมง" },
    { val: timeLeft.mins, label: "นาที" },
    { val: timeLeft.secs, label: "วินาที" },
  ];

  return (
    <section className="text-center px-6 py-12 bg-base-100 border-y border-base-300">
      {headline && (
        <h3 className="text-lg md:text-2xl font-bold mb-4">{headline}</h3>
      )}
      <div className="flex justify-center gap-4 flex-wrap">
        {units.map((t, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold tabular-nums w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl bg-primary text-primary-content">
              {/* daisyUI .countdown handles the slide animation; the
                  --value CSS var is what it watches. */}
              <span className="countdown">
                <span style={{ "--value": t.val } as React.CSSProperties}>
                  {String(t.val).padStart(2, "0")}
                </span>
              </span>
            </div>
            <div className="text-[10px] md:text-xs text-base-content/70 mt-1">
              {t.label}
            </div>
          </div>
        ))}
      </div>
      {ctaText && (
        <a href={ctaLink || "#"} className="btn btn-primary mt-6">
          {ctaText}
        </a>
      )}
    </section>
  );
}
