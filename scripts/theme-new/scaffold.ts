/**
 * scaffold.ts — orchestrator for `pnpm theme:new`.
 *
 * Generates 16 theme files + auto-wires 3 registry/types/template-groups
 * patches. All file writes happen here; templates live next to this file
 * under ./templates/*.tmpl with `{{var}}` placeholders.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';

import { patchRegistry } from './registry-patcher';
import { patchTypes } from './types-patcher';
import { patchTemplateGroups } from './template-groups-patcher';

export type TemplateGroup =
  | 'trust'
  | 'fashion-beauty'
  | 'electronics-tech'
  | 'lifestyle'
  | 'community'
  | 'business-model'
  | 'specialty'
  | 'everyday'
  | 'taobao'
  | 'packaging'
  | 'neon';

export type ShellShape =
  | 'centered'
  | 'sidebar-left'
  | 'split-hero'
  | 'full-bleed'
  | 'magazine';

export interface ThemeScaffoldOptions {
  id: string;
  name: string;
  group: TemplateGroup;
  primary?: string;
  accent?: string;
  ink?: string;
  bg?: string;
  vibe?: string;
  shellShape?: ShellShape;
  dryRun: boolean;
}

export interface ThemeScaffoldResult {
  filesCreated: string[];
  filesPatched: string[];
  themeDir: string;
}

const REPO_ROOT = resolve(__dirname, '..', '..');
const TEMPLATES_DIR = resolve(__dirname, 'templates');

/**
 * Compute identifier variants used by templates / patchers.
 * Example for id "neon-festival":
 *   kebab        = "neon-festival"
 *   snake        = "neon_festival"
 *   pascal       = "NeonFestival"
 *   constUpper   = "NEON_FESTIVAL"
 */
export interface IdVariants {
  kebab: string;
  snake: string;
  pascal: string;
  constUpper: string;
}

export function deriveIdVariants(id: string): IdVariants {
  const parts = id.split('-').filter(Boolean);
  const pascal = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join('');
  return {
    kebab: id,
    snake: parts.join('_'),
    pascal,
    constUpper: parts.join('_').toUpperCase(),
  };
}

const DEFAULT_PALETTE = {
  primary: '#3B82F6',
  accent: '#10B981',
  ink: '#0F172A',
  bg: '#FFFFFF',
};

function buildContext(opts: ThemeScaffoldOptions): Record<string, string> {
  const v = deriveIdVariants(opts.id);
  const colors = {
    primary: opts.primary ?? DEFAULT_PALETTE.primary,
    accent: opts.accent ?? DEFAULT_PALETTE.accent,
    ink: opts.ink ?? DEFAULT_PALETTE.ink,
    bg: opts.bg ?? DEFAULT_PALETTE.bg,
  };
  return {
    THEME_ID: v.kebab,
    THEME_ID_SNAKE: v.snake,
    THEME_PASCAL: v.pascal,
    THEME_CONST: v.constUpper,
    THEME_NAME: opts.name,
    THEME_VIBE: opts.vibe ?? opts.name,
    GROUP_ID: opts.group,
    SHELL_SHAPE: opts.shellShape ?? 'centered',
    PRIMARY: colors.primary,
    ACCENT: colors.accent,
    INK: colors.ink,
    BG: colors.bg,
  };
}

function render(template: string, ctx: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(ctx, key)) return ctx[key];
    return match;
  });
}

function readTemplate(rel: string): string {
  return readFileSync(join(TEMPLATES_DIR, rel), 'utf8');
}

function writeFileSafe(
  absPath: string,
  content: string,
  dryRun: boolean,
  created: string[]
): void {
  if (existsSync(absPath)) {
    throw new Error(`file already exists: ${absPath}`);
  }
  if (dryRun) {
    process.stdout.write(`  [dry-run] would create ${absPath} (${content.split('\n').length} lines)\n`);
    created.push(absPath);
    return;
  }
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content, 'utf8');
  process.stdout.write(`  created ${absPath}\n`);
  created.push(absPath);
}

const THEME_FILES: { rel: string; tmpl: string }[] = [
  { rel: 'adapters.tsx', tmpl: 'adapters.tsx.tmpl' },
  { rel: 'palette.ts', tmpl: 'palette.ts.tmpl' },
  { rel: 'PolicyShell.tsx', tmpl: 'PolicyShell.tsx.tmpl' },
  { rel: 'chrome/Header.tsx', tmpl: 'chrome/Header.tsx.tmpl' },
  { rel: 'chrome/Footer.tsx', tmpl: 'chrome/Footer.tsx.tmpl' },
  { rel: 'chrome/AnnouncementStrip.tsx', tmpl: 'chrome/AnnouncementStrip.tsx.tmpl' },
  { rel: 'pages/Homepage.tsx', tmpl: 'pages/Homepage.tsx.tmpl' },
  { rel: 'pages/Catalog.tsx', tmpl: 'pages/Catalog.tsx.tmpl' },
  { rel: 'pages/ProductDetail.tsx', tmpl: 'pages/ProductDetail.tsx.tmpl' },
  { rel: 'pages/Cart.tsx', tmpl: 'pages/Cart.tsx.tmpl' },
  { rel: 'pages/Checkout.tsx', tmpl: 'pages/Checkout.tsx.tmpl' },
  { rel: 'pages/About.tsx', tmpl: 'pages/About.tsx.tmpl' },
  { rel: 'pages/Help.tsx', tmpl: 'pages/Help.tsx.tmpl' },
  { rel: 'pages/Contact.tsx', tmpl: 'pages/Contact.tsx.tmpl' },
];

export async function scaffoldTheme(opts: ThemeScaffoldOptions): Promise<ThemeScaffoldResult> {
  const themeDir = resolve(REPO_ROOT, 'components', 'storefront', 'themes', opts.id);

  if (existsSync(themeDir)) {
    throw new Error(
      `theme directory already exists: ${themeDir}\n` +
        `If you want to regenerate, delete the directory first.`
    );
  }

  process.stdout.write(`\ntheme:new — scaffolding "${opts.id}"\n`);
  process.stdout.write(`  group:       ${opts.group}\n`);
  process.stdout.write(`  display:     ${opts.name}\n`);
  process.stdout.write(`  shell:       ${opts.shellShape ?? 'centered'}\n`);
  process.stdout.write(`  palette:     primary=${opts.primary ?? '(default)'}, accent=${opts.accent ?? '(default)'}\n`);
  process.stdout.write(`  dry-run:     ${opts.dryRun}\n\n`);

  const ctx = buildContext(opts);
  const filesCreated: string[] = [];

  // 1. Write 14 theme files (adapters + palette + PolicyShell + 3 chrome + 8 pages = 14).
  for (const { rel, tmpl } of THEME_FILES) {
    const rendered = render(readTemplate(tmpl), ctx);
    const abs = join(themeDir, rel);
    writeFileSafe(abs, rendered, opts.dryRun, filesCreated);
  }

  process.stdout.write('\npatching wiring files:\n');
  const filesPatched: string[] = [];

  const typesPath = resolve(REPO_ROOT, 'lib', 'templates', 'types.ts');
  const groupsPath = resolve(REPO_ROOT, 'lib', 'templates', 'template-groups.ts');
  const registryPath = resolve(REPO_ROOT, 'lib', 'templates', 'registry.ts');

  const typesResult = patchTypes({
    filePath: typesPath,
    themeId: opts.id,
    dryRun: opts.dryRun,
  });
  if (typesResult.changed) filesPatched.push(typesPath);

  const groupsResult = patchTemplateGroups({
    filePath: groupsPath,
    themeId: opts.id,
    group: opts.group,
    dryRun: opts.dryRun,
  });
  if (groupsResult.changed) filesPatched.push(groupsPath);

  const registryResult = patchRegistry({
    filePath: registryPath,
    themeId: opts.id,
    themeName: opts.name,
    themeVibe: opts.vibe ?? opts.name,
    group: opts.group,
    shellShape: opts.shellShape,
    dryRun: opts.dryRun,
  });
  if (registryResult.changed) filesPatched.push(registryPath);

  return {
    filesCreated,
    filesPatched,
    themeDir,
  };
}
