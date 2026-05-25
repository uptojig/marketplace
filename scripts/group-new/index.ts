#!/usr/bin/env tsx
/**
 * group:new — scaffold a new template family (group).
 *
 * A "group" = one chrome family with its own palette + body class. Themes
 * (template IDs) belong to a group; a group always has at least one theme.
 *
 * Usage:
 *   pnpm group:new \
 *     --id <kebab-id>           e.g. accessories
 *     --name "<display name>"   e.g. "Accessories Family"
 *     --primary <#hex>          e.g. #FF458A
 *     --accent  <#hex>          e.g. #FFD600
 *     [--savings <#hex>]        default: #2563eb (blue-600)
 *     [--blurb "<one-liner>"]   shown in the family file header comment
 *
 * What it does (idempotent — refuses to clobber):
 *   1. Creates lib/landing/<id>.ts cloned from the neon family template
 *   2. Patches lib/templates/types.ts          (adds to TemplateGroup union)
 *   3. Patches lib/templates/template-groups.ts (adds `<id>: []` entry)
 *
 * It DOES NOT patch lib/storefront/resolve-store-theme.ts — that file needs
 * four coordinated inserts (import, two ladder branches, switch case) and
 * a regex patcher is fragile. At the end of a run the CLI prints the four
 * snippets to paste manually.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { argv, exit } from 'node:process';

interface Args {
  id: string;
  name: string;
  primary: string;
  accent: string;
  savings: string;
  blurb: string;
}

function parseArgs(): Args {
  const a: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith('--')) {
      a[k.slice(2)] = argv[i + 1] ?? '';
      i++;
    }
  }
  const required = ['id', 'name', 'primary', 'accent'];
  const missing = required.filter((k) => !a[k]);
  if (missing.length) {
    console.error(`Missing required flags: ${missing.map((k) => `--${k}`).join(', ')}`);
    exit(1);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(a.id)) {
    console.error(`--id must be kebab-case (got "${a.id}")`);
    exit(1);
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(a.primary) || !/^#[0-9A-Fa-f]{6}$/.test(a.accent)) {
    console.error('--primary and --accent must be 6-digit hex like #FF458A');
    exit(1);
  }
  return {
    id: a.id,
    name: a.name,
    primary: a.primary,
    accent: a.accent,
    savings: a.savings || '#2563eb',
    blurb: a.blurb || `${a.name} storefronts.`,
  };
}

const REPO_ROOT = join(__dirname, '..', '..');
const kebabToScream = (s: string) => s.replace(/-/g, '_').toUpperCase();
const kebabToCamel = (s: string) =>
  s.split('-').map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1))).join('');

function createFamilyFile(args: Args) {
  const dest = join(REPO_ROOT, `lib/landing/${args.id}.ts`);
  if (existsSync(dest)) {
    console.error(`Family file already exists: lib/landing/${args.id}.ts`);
    exit(1);
  }
  const scream = kebabToScream(args.id);
  const camel = kebabToCamel(args.id);
  const body = `/**
 * ${args.name} family — ${args.blurb}
 *
 * Opt in by setting Store.landingThemeVariant = "${args.id}" or by
 * picking a templateId in the \`${args.id}\` group.
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const ${scream}_TEMPLATE_IDS: ReadonlySet<string> = templateIdsForGroup('${args.id}');

const ${scream}_VARIANT_VALUES: ReadonlySet<string> = new Set(['${args.id}']);

export function is${camel[0].toUpperCase() + camel.slice(1)}Store(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && ${scream}_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && ${scream}_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const ${scream}_BODY_CLASS = 'theme-${args.id}';

export const ${scream}_TOKENS = {
  primary: '${args.primary}',
  accent: '${args.accent}',
  savings: '${args.savings}',
  ink: '#0F0F0F',
  inkMuted: '#525252',
  bg: '#FAFAFA',
  bgSoft: '#FFFFFF',
  border: '#E5E5E5',
  muted: '#F5F5F5',
} as const;

export function ${camel}CssVars(): Record<string, string> {
  const c = ${scream}_TOKENS;
  return {
    '--shop-primary': c.primary,
    '--shop-accent': c.accent,
    '--shop-savings': c.savings,
    '--shop-ink': c.ink,
    '--shop-ink-muted': c.inkMuted,
    '--shop-bg': c.bg,
    '--shop-bg-soft': c.bgSoft,
    '--shop-border': c.border,
    '--shop-muted': c.muted,
  };
}
`;
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, body, 'utf8');
  console.log(`  + lib/landing/${args.id}.ts`);
}

function patchTypes(args: Args) {
  const file = join(REPO_ROOT, 'lib/templates/types.ts');
  let body = readFileSync(file, 'utf8');
  if (body.includes(`'${args.id}'`)) {
    console.log(`  · types.ts already references '${args.id}', skipping`);
    return;
  }
  // Append to TemplateGroup union — assume 'neon' is the last entry today.
  if (!/\|\s*'neon';/.test(body)) {
    console.error('Could not find TemplateGroup union anchor in types.ts');
    exit(1);
  }
  body = body.replace(/\|\s*'neon';/, `| 'neon'\n  | '${args.id}';`);
  writeFileSync(file, body, 'utf8');
  console.log(`  ~ patched lib/templates/types.ts`);
}

function patchGroupsMap(args: Args) {
  const file = join(REPO_ROOT, 'lib/templates/template-groups.ts');
  let body = readFileSync(file, 'utf8');
  if (body.includes(`${args.id}: [`) || body.includes(`'${args.id}': [`)) {
    console.log(`  · template-groups.ts already references '${args.id}', skipping`);
    return;
  }
  // Insert a new entry right after `neon:` line.
  const anchor = /(neon:\s*\['neon-festival'\],\n)/;
  if (!anchor.test(body)) {
    console.error('Could not find anchor (`neon:` entry) in template-groups.ts');
    exit(1);
  }
  body = body.replace(anchor, `$1  '${args.id}': [],\n`);
  writeFileSync(file, body, 'utf8');
  console.log(`  ~ patched lib/templates/template-groups.ts (added '${args.id}: []')`);
}

function printResolveStoreThemeSnippets(args: Args) {
  const scream = kebabToScream(args.id);
  const camel = kebabToCamel(args.id);
  const Pascal = camel[0].toUpperCase() + camel.slice(1);
  console.log(`
─────────────────────────────────────────────────────────────────────
Manual edit still required: lib/storefront/resolve-store-theme.ts
─────────────────────────────────────────────────────────────────────

1. Add this import near the top (next to other landing imports):

   import {
     is${Pascal}Store,
     ${camel}CssVars,
     ${scream}_BODY_CLASS,
   } from "@/lib/landing/${args.id}";

2. In resolveChromeTheme(), add to the chromeKey ladder (after the last
   else-if branch, before \`else if (isNeonStore(key))\`):

   else if (is${Pascal}Store(key)) chromeKey = "${args.id}";

3. In the same function's switch, add a case (before \`case "neon"\`):

   case "${args.id}":
     familyClass = ${scream}_BODY_CLASS;
     familyVars = ${camel}CssVars();
     break;

4. In resolveContentThemeKey(), add (before \`if (isNeonStore(key))\`):

   if (is${Pascal}Store(key)) return "${args.id}";

5. Extend the ThemeKey union in the same file to include "${args.id}".
`);
}

function main() {
  const args = parseArgs();
  console.log(`\nScaffolding group "${args.id}" (${args.name})\n`);
  createFamilyFile(args);
  patchTypes(args);
  patchGroupsMap(args);
  printResolveStoreThemeSnippets(args);
  console.log(`✓ Family file created. Apply the 5 manual edits above, then run:
    pnpm theme:new --id <theme-id> --name "..." --group ${args.id} --primary ... --accent ...
`);
}

main();
