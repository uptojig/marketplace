/**
 * Tailwind v4 PostCSS plugin (replaces the v3 `tailwindcss: {}` entry).
 * Autoprefixer is no longer needed — v4 ships with built-in prefixing
 * via lightningcss; bundling autoprefixer would actually conflict.
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
