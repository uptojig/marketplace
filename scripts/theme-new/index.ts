#!/usr/bin/env tsx
/**
 * `pnpm theme:new` — scaffold a new bespoke storefront theme.
 *
 * Usage:
 *   pnpm theme:new \
 *     --id <kebab>                  required, kebab-case TemplateId
 *     --name "<Display Name>"       required, display name (Thai or EN)
 *     --group <group>               required: trust | fashion-beauty |
 *                                    electronics-tech | lifestyle | community |
 *                                    business-model | specialty | everyday |
 *                                    taobao | packaging | neon
 *     --primary "#xxxxxx"           optional palette override
 *     --accent "#xxxxxx"            optional
 *     --ink "#xxxxxx"               optional
 *     --bg "#xxxxxx"                optional
 *     --vibe "<short description>"  optional, copied into theme description
 *     --shell-shape <shape>         optional: centered | sidebar-left |
 *                                    split-hero | full-bleed | magazine
 *     --dry-run                     optional, print plan without writing
 *
 * Spec reference: docs/prompts/new-bespoke-theme.md
 */
import { scaffoldTheme } from './scaffold';
import type { ThemeScaffoldOptions, TemplateGroup, ShellShape } from './scaffold';

const VALID_GROUPS: readonly TemplateGroup[] = [
  'trust',
  'fashion-beauty',
  'electronics-tech',
  'lifestyle',
  'community',
  'business-model',
  'specialty',
  'everyday',
  'taobao',
  'packaging',
  'neon',
];

const VALID_SHELLS: readonly ShellShape[] = [
  'centered',
  'sidebar-left',
  'split-hero',
  'full-bleed',
  'magazine',
];

interface ParsedArgs {
  id?: string;
  name?: string;
  group?: string;
  primary?: string;
  accent?: string;
  ink?: string;
  bg?: string;
  vibe?: string;
  shellShape?: string;
  dryRun?: boolean;
  help?: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run' || arg === '-n') {
      out.dryRun = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      out.help = true;
      continue;
    }
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      // Boolean-style flag with no value.
      (out as Record<string, unknown>)[camel(key)] = true;
      continue;
    }
    (out as Record<string, unknown>)[camel(key)] = next;
    i++;
  }
  return out;
}

function camel(s: string): string {
  return s.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
}

function printHelp(): void {
  process.stdout.write(
    [
      'pnpm theme:new — scaffold a new bespoke storefront theme',
      '',
      'Required:',
      '  --id <kebab>        TemplateId in kebab-case (e.g. "neon-festival")',
      '  --name "<name>"     Display name (Thai or EN)',
      '  --group <group>     One of: ' + VALID_GROUPS.join(', '),
      '',
      'Optional:',
      '  --primary <hex>     Override --shop-primary',
      '  --accent <hex>      Override --shop-accent',
      '  --ink <hex>         Override --shop-ink',
      '  --bg <hex>          Override --shop-bg',
      '  --vibe "<text>"     Short brand description (defaults to name)',
      '  --shell-shape <s>   One of: ' + VALID_SHELLS.join(', '),
      '  --dry-run           Print plan; do not write any files',
      '',
      'Example:',
      '  pnpm theme:new --id "neon-festival" --name "Neon Festival" \\',
      '                 --group "neon" --shell-shape "centered"',
      '',
    ].join('\n')
  );
}

function fail(msg: string): never {
  process.stderr.write(`theme:new — error: ${msg}\n`);
  process.exit(1);
}

function validateHex(value: string | undefined, label: string): string | undefined {
  if (!value) return undefined;
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    fail(`--${label} must be a 6-digit hex like "#FF00AA" (got: ${value})`);
  }
  return value.toUpperCase();
}

function validateKebab(value: string, label: string): string {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value)) {
    fail(`--${label} must be kebab-case (lowercase a-z + digits + dashes). Got: ${value}`);
  }
  return value;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help || argv.length === 0) {
    printHelp();
    process.exit(argv.length === 0 ? 1 : 0);
  }

  if (!args.id) fail('--id is required');
  if (!args.name) fail('--name is required');
  if (!args.group) fail('--group is required');

  const id = validateKebab(args.id!, 'id');
  const name = args.name!.trim();
  const group = args.group!.trim();

  if (!VALID_GROUPS.includes(group as TemplateGroup)) {
    fail(`--group must be one of: ${VALID_GROUPS.join(', ')} (got: ${group})`);
  }

  let shellShape: ShellShape | undefined;
  if (args.shellShape) {
    if (!VALID_SHELLS.includes(args.shellShape as ShellShape)) {
      fail(`--shell-shape must be one of: ${VALID_SHELLS.join(', ')}`);
    }
    shellShape = args.shellShape as ShellShape;
  }

  const opts: ThemeScaffoldOptions = {
    id,
    name,
    group: group as TemplateGroup,
    primary: validateHex(args.primary, 'primary'),
    accent: validateHex(args.accent, 'accent'),
    ink: validateHex(args.ink, 'ink'),
    bg: validateHex(args.bg, 'bg'),
    vibe: args.vibe?.trim(),
    shellShape,
    dryRun: Boolean(args.dryRun),
  };

  try {
    const result = await scaffoldTheme(opts);
    if (opts.dryRun) {
      process.stdout.write('\nDry run — no files written.\n');
    } else {
      process.stdout.write(
        `\nDone. Wrote ${result.filesCreated.length} files and patched ${result.filesPatched.length} files.\n`
      );
      process.stdout.write('Next steps:\n');
      process.stdout.write(`  pnpm tsc --noEmit            # verify ${id} types\n`);
      process.stdout.write(`  pnpm lint                    # lint check\n`);
      process.stdout.write(`  open the new theme in components/storefront/themes/${id}/\n`);
    }
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err));
  }
}

void main();
