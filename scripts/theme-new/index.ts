#!/usr/bin/env tsx
/**
 * theme:new — scaffold a new bespoke theme by cloning neon-festival and
 * wiring the result into the template registry.
 *
 * Usage:
 *   pnpm theme:new \
 *     --id <kebab-id>             e.g. casethep
 *     --name "<display name>"     e.g. "Casethep Pro"
 *     --group <existing-group>    e.g. fashion-beauty | lifestyle | neon | ...
 *     --primary <#hex>            e.g. #FF458A
 *     --accent <#hex>             e.g. #42A5F5
 *
 * What it does (idempotent — refuses to clobber an existing theme):
 *   1. Copies components/storefront/themes/neon-festival/  →  …/<id>/
 *   2. Renames identifiers inside every copied file
 *        neon-festival       →  <id>
 *        NeonFestival        →  <PascalCase(id)>
 *        neon_festival_      →  <snake_case(id)>_
 *        Neon Festival       →  <display name>
 *      and replaces palette HEX values with primary / accent
 *   3. Patches lib/templates/types.ts          (adds to TemplateId union)
 *   4. Patches lib/templates/template-groups.ts (adds to group array)
 *   5. Patches lib/templates/registry.ts        (clones neon-festival entry)
 *
 * It deliberately does NOT create a new family palette (lib/landing/<group>.ts);
 * use an existing group. To add a new family, add the family file by hand and
 * extend TemplateGroup in types.ts first.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { argv, exit } from 'node:process';

interface Args {
  id: string;
  name: string;
  group: string;
  primary: string;
  accent: string;
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
  const required: (keyof Args)[] = ['id', 'name', 'group', 'primary', 'accent'];
  const missing = required.filter((k) => !a[k]);
  if (missing.length) {
    console.error(`Missing required flags: ${missing.map((k) => `--${k}`).join(', ')}`);
    console.error('Run with --help to see usage.');
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
  return a as unknown as Args;
}

const kebabToPascal = (s: string) =>
  s.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const kebabToSnake = (s: string) => s.replace(/-/g, '_');

const REPO_ROOT = join(__dirname, '..', '..');
const SRC = join(REPO_ROOT, 'components/storefront/themes/neon-festival');

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

function rewriteSource(content: string, a: Args): string {
  const pascal = kebabToPascal(a.id);
  const snake = kebabToSnake(a.id);
  let out = content;
  // Replace identifiers (order matters — most-specific first)
  out = out.replaceAll('NeonFestival', pascal);
  out = out.replaceAll('neon_festival_', `${snake}_`);
  out = out.replaceAll('neon-festival', a.id);
  out = out.replaceAll('Neon Festival', a.name);
  return out;
}

function rewritePalette(content: string, a: Args): string {
  // palette.ts in neon-festival exposes NEON_TOKENS — swap primary + accent
  // hex values. We do a narrow replace targeting common hex literals at the
  // top of the file so we don't accidentally rewrite unrelated colors.
  return content
    .replace(/(primary:\s*['"])#[0-9A-Fa-f]{3,8}(['"])/, `$1${a.primary}$2`)
    .replace(/(accent:\s*['"])#[0-9A-Fa-f]{3,8}(['"])/, `$1${a.accent}$2`);
}

function copyTheme(args: Args) {
  const dest = join(REPO_ROOT, 'components/storefront/themes', args.id);
  if (existsSync(dest)) {
    console.error(`Theme directory already exists: ${relative(REPO_ROOT, dest)}`);
    exit(1);
  }
  mkdirSync(dest, { recursive: true });
  for (const src of walk(SRC)) {
    const rel = relative(SRC, src);
    const out = join(dest, rel);
    mkdirSync(join(out, '..'), { recursive: true });
    let body = readFileSync(src, 'utf8');
    body = rewriteSource(body, args);
    if (rel.endsWith('palette.ts')) body = rewritePalette(body, args);
    writeFileSync(out, body, 'utf8');
    console.log(`  + ${relative(REPO_ROOT, out)}`);
  }
}

function patchTypes(args: Args) {
  const file = join(REPO_ROOT, 'lib/templates/types.ts');
  let body = readFileSync(file, 'utf8');
  if (body.includes(`'${args.id}'`)) {
    console.log(`  · types.ts already references '${args.id}', skipping`);
    return;
  }
  // Append to TemplateId union — assume 'neon-festival' is the current tail.
  if (!/\|\s*'neon-festival';/.test(body)) {
    console.error("Could not find anchor (| 'neon-festival';) in types.ts");
    exit(1);
  }
  body = body.replace(/\|\s*'neon-festival';/, `| 'neon-festival'\n  | '${args.id}';`);
  writeFileSync(file, body, 'utf8');
  console.log(`  ~ patched lib/templates/types.ts`);
}

function patchGroups(args: Args) {
  const file = join(REPO_ROOT, 'lib/templates/template-groups.ts');
  let body = readFileSync(file, 'utf8');
  if (body.includes(`'${args.id}'`)) {
    console.log(`  · template-groups.ts already references '${args.id}', skipping`);
    return;
  }
  // Group keys may be unquoted (e.g. `neon:`) or quoted (e.g. `'fashion-beauty':`)
  const escaped = args.group.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const groupLine = new RegExp(`(['"]?${escaped}['"]?:\\s*\\[)([^\\]]*?)(\\])`, 's');
  if (!groupLine.test(body)) {
    console.error(`Group "${args.group}" not found in template-groups.ts`);
    exit(1);
  }
  body = body.replace(groupLine, (_m, p1, p2, p3) => {
    const trimmed = p2.trimEnd().replace(/,?\s*$/, '');
    return `${p1}${trimmed}, '${args.id}'${p3}`;
  });
  writeFileSync(file, body, 'utf8');
  console.log(`  ~ patched lib/templates/template-groups.ts`);
}

function patchRegistry(args: Args) {
  const file = join(REPO_ROOT, 'lib/templates/registry.ts');
  let body = readFileSync(file, 'utf8');
  if (body.includes(`'${args.id}':`)) {
    console.log(`  · registry.ts already references '${args.id}', skipping`);
    return;
  }
  const pascal = kebabToPascal(args.id);
  const snake = kebabToSnake(args.id);
  // 1. Add imports — duplicate the neon-festival import block.
  const importBlock = body.match(
    /import\s*\{[\s\S]*?\}\s*from\s*'@\/components\/storefront\/themes\/neon-festival\/adapters';/,
  );
  if (importBlock) {
    const newImport = importBlock[0]
      .replaceAll('NeonFestival', pascal)
      .replaceAll('neon-festival', args.id);
    body = body.replace(importBlock[0], importBlock[0] + '\n' + newImport);
  }
  // 2. Add registry entry — duplicate the neon-festival entry block.
  const entryBlock = body.match(/'neon-festival':\s*\{[\s\S]*?\n\s*\},/);
  if (entryBlock) {
    const newEntry = entryBlock[0]
      .replaceAll('NeonFestival', pascal)
      .replaceAll('neon_festival_', `${snake}_`)
      .replaceAll('neon-festival', args.id)
      .replaceAll('Neon Festival', args.name)
      .replace(/group:\s*'neon'/, `group: '${args.group}'`);
    body = body.replace(entryBlock[0], entryBlock[0] + '\n\n  ' + newEntry);
  }
  writeFileSync(file, body, 'utf8');
  console.log(`  ~ patched lib/templates/registry.ts`);
}

function main() {
  const args = parseArgs();
  console.log(`\nScaffolding theme "${args.id}" (${args.name})  group=${args.group}\n`);
  copyTheme(args);
  patchTypes(args);
  patchGroups(args);
  patchRegistry(args);
  console.log(`\n✓ Done.

Next steps:
  1. Open  components/storefront/themes/${args.id}/  and customize copy / layout
  2. Run   pnpm tsc --noEmit   to verify the wiring compiles
  3. Visit /create-store and pick the new template to test
`);
}

main();
