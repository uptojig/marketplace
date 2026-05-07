"use client";

/**
 * <ThemeController /> — floating dropdown for switching between the
 * 35 built-in daisyUI themes plus the custom `marketplace-fantasy`.
 *
 * Persistence: localStorage (key: "mp-theme"). On first paint we
 * read the saved value (if any) and apply it to <html data-theme>.
 * SSR-safe — the localStorage read sits inside useEffect so the
 * server-rendered HTML doesn't disagree with what the client paints
 * a tick later.
 *
 * Why a dropdown not a radio group: 35 themes × radio + label is
 * ~70 nodes minimum; a single <select> is one tab stop and renders
 * the label text without DOM bloat. We forego the
 * daisyUI-native `theme-controller` class (which expects
 * radio/checkbox inputs) and apply data-theme manually so the
 * persistence-on-page-load story works the same regardless of
 * which page mounts the component.
 */

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

// Source: packages/daisyui/functions/themeOrder.js
// Order matches the daisyUI theme generator dropdown.
const BUILTIN_THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
] as const;

const DARK_THEMES = new Set([
  "dark",
  "synthwave",
  "halloween",
  "forest",
  "aqua",
  "black",
  "luxury",
  "dracula",
  "business",
  "night",
  "coffee",
  "dim",
  "sunset",
  "abyss",
]);

const STORAGE_KEY = "mp-theme";
const DEFAULT_THEME = "marketplace-fantasy";

export function ThemeController() {
  // Hydration-safe: keep the SSR markup matching whatever the page
  // shipped with, then sync from localStorage after mount.
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
    setMounted(true);
  }, []);

  function applyTheme(next: string) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Quota exceeded / privacy mode — preview still works for
      // this tab, just won't persist on next reload.
    }
  }

  // Avoid flashing default-theme label on hydration before we've
  // read localStorage.
  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div
          role="listbox"
          aria-label="เลือกธีม"
          className="absolute bottom-12 right-0 max-h-[60vh] w-56 overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-xl"
          style={{
            // Force the dropdown panel to stay light/readable
            // regardless of which theme is currently active —
            // otherwise switching to e.g. `dim` would render the
            // panel itself with the wrong colors mid-pick.
            colorScheme: "light",
          }}
        >
          <div className="p-2">
            {/* "Default" group */}
            <button
              type="button"
              onClick={() => applyTheme(DEFAULT_THEME)}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-base-200 ${
                theme === DEFAULT_THEME ? "bg-base-200 font-semibold" : ""
              }`}
              role="option"
              aria-selected={theme === DEFAULT_THEME}
            >
              <span>marketplace-fantasy</span>
              <span className="text-[10px] text-stone-500">default</span>
            </button>
            <div className="my-1 border-t border-base-300" />
            {BUILTIN_THEMES.map((t) => {
              const isDark = DARK_THEMES.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyTheme(t)}
                  className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-base-200 ${
                    theme === t ? "bg-base-200 font-semibold" : ""
                  }`}
                  role="option"
                  aria-selected={theme === t}
                >
                  <span className="capitalize">{t}</span>
                  <span className="text-[10px] text-stone-500">
                    {isDark ? "🌙" : "☀️"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="เลือกธีม"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-base-100 text-base-content shadow-lg ring-1 ring-base-300 hover:scale-105 transition-transform"
        title={`Theme: ${theme}`}
      >
        <Palette className="h-5 w-5" />
      </button>
    </div>
  );
}
