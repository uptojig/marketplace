"use client";

/**
 * StepBadge — pill in the wizard's top progress bar. Shows step #
 * (pending), the number on a black bg (active), or a check mark on a
 * green bg (done). Pure presentational helper, no logic of its own.
 */

import { Check } from "lucide-react";

export function StepBadge({
  num,
  active,
  done,
  children,
}: {
  num: number;
  active: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
        active
          ? "bg-black text-white"
          : done
            ? "bg-green-100 text-green-800"
            : "bg-stone-100 text-stone-500"
      }`}
    >
      {done ? (
        <Check className="h-3 w-3" />
      ) : (
        <span className="font-mono text-[10px]">{num}</span>
      )}
      {children}
    </span>
  );
}
