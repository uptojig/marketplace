#!/usr/bin/env node
/**
 * Operator UI design-system guardrail.
 *
 * Scans app/(operator) + components/operator for visual drift away from the
 * operator semantic-token design system (the warm BackOffice/Orders look
 * mapped onto shadcn tokens by `.theme-operator` in app/globals.css):
 *
 *   - mp-* brand utilities      → use shadcn semantic tokens / operator-primitives
 *   - solid bg-white / bg-black → use bg-card / bg-background (translucent overlays are fine)
 *   - gray/stone/slate/zinc     → use muted / foreground / border
 *   - indigo/purple/violet/blue → use primary (coral) or a primitives status tone
 *
 * Status hues (emerald/amber/sky/rose/red…) are ALLOWED for inline status
 * indicators and are owned centrally by operator-primitives.tsx, which is
 * the single allowlisted source of truth for tone → colour mapping.
 *
 * Translucent overlays (bg-white/10, bg-black/60) are allowed — those are
 * media viewers / modal backdrops, not brand surfaces.
 *
 * Usage:
 *   node scripts/check-operator-ui.mjs            # warn  — lists drift, always exit 0
 *   node scripts/check-operator-ui.mjs --enforce  # gate  — exit 1 if any violation
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = [join("app", "(operator)"), join("components", "operator")];

// The design-system source of truth — owns tone → colour mapping, so it's
// allowed to reference status hues (emerald/amber/sky/violet) directly.
const ALLOWLIST = new Set([join("components", "operator", "operator-primitives.tsx")]);

const RULES = [
  {
    id: "mp-token",
    re: /\b(?:bg|text|border|ring|from|via|to|fill|stroke|divide|outline|placeholder|decoration)-mp-[a-z]/,
    msg: "mp-* marketplace utility — use a shadcn semantic token / operator-primitives",
  },
  {
    id: "bg-white",
    re: /\bbg-white(?![\w/-])/,
    msg: "solid bg-white — use bg-card / bg-background (translucent bg-white/NN is fine)",
  },
  {
    id: "bg-black",
    re: /\bbg-black(?![\w/-])/,
    msg: "solid bg-black — use a semantic token (translucent bg-black/NN overlay is fine)",
  },
  {
    id: "neutral-palette",
    re: /\b(?:bg|text|border)-(?:gray|stone|slate|zinc|neutral)-\d/,
    msg: "raw gray/stone/slate palette — use muted / foreground / border",
  },
  {
    id: "brand-hue",
    re: /\b(?:bg|text|border|from|via|to|ring|fill|stroke|decoration)-(?:indigo|purple|violet|blue)-\d/,
    msg: "indigo/purple/violet/blue brand accent — use primary (coral) or a status tone",
  },
];

const enforce = process.argv.includes("--enforce");
const violations = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) walk(rel);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) scan(rel);
  }
}

function scan(relPath) {
  if (ALLOWLIST.has(relPath)) return;
  const lines = readFileSync(join(ROOT, relPath), "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      const m = rule.re.exec(line);
      if (m) {
        violations.push({
          file: relPath.split(sep).join("/"),
          line: i + 1,
          rule: rule.id,
          msg: rule.msg,
          snippet: m[0],
        });
      }
    }
  });
}

for (const d of SCAN_DIRS) walk(d);

if (violations.length === 0) {
  console.log("✓ check-operator-ui: no operator design-system violations");
  process.exit(0);
}

console.log(
  `\ncheck-operator-ui: ${violations.length} operator design-system ${
    violations.length === 1 ? "violation" : "violations"
  }${enforce ? "" : " (warn mode — not failing the build)"}\n`,
);
let lastFile = "";
for (const v of violations) {
  if (v.file !== lastFile) {
    console.log(`  ${v.file}`);
    lastFile = v.file;
  }
  console.log(`    L${v.line}  ${v.snippet}  — ${v.msg}  [${v.rule}]`);
}
console.log("");

process.exit(enforce ? 1 : 0);
