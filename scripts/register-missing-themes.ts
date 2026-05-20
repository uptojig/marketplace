import fs from 'fs';
import path from 'path';

const themesDir = path.join(process.cwd(), 'components/storefront/themes');
const registryFile = path.join(process.cwd(), 'lib/templates/registry.ts');
const typesFile = path.join(process.cwd(), 'lib/templates/types.ts');

const existingThemes = new Set();
const registryContent = fs.readFileSync(registryFile, 'utf8');
const typesContent = fs.readFileSync(typesFile, 'utf8');

const idMatch = registryContent.match(/id:\s*['"]([a-z0-9-]+)['"]/g);
if (idMatch) {
  idMatch.forEach(match => {
    const id = match.split(/['"]/)[1];
    existingThemes.add(id);
  });
}

function kebabToCamel(str: string) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

let newTypes = typesContent;
let newRegistry = registryContent;

const allThemeDirs = fs.readdirSync(themesDir).filter(dir => {
  return fs.existsSync(path.join(themesDir, dir, 'adapters.tsx'));
});

const missingThemes = allThemeDirs.filter(dir => !existingThemes.has(dir));
console.log(`Found ${missingThemes.length} missing themes to register:`, missingThemes);

if (missingThemes.length === 0) {
  process.exit(0);
}

// 1. Update types.ts
const typeIdRegex = /(export type TemplateId =[\s\S]*?;)/;
const typeIdMatch = newTypes.match(typeIdRegex);
if (typeIdMatch) {
  const currentDeclaration = typeIdMatch[1];
  const newThemeTypes = missingThemes.map(theme => `  | '${theme}'`).join('\n');
  const updatedDeclaration = currentDeclaration.replace(';', `\n${newThemeTypes};`);
  newTypes = newTypes.replace(currentDeclaration, updatedDeclaration);
}

// 2. Update registry.ts
let importsToAdd = '';
let templatesToAdd = '';

for (const theme of missingThemes) {
  const prefix = kebabToCamel(theme);
  importsToAdd += `
import {
  ${prefix}HeaderAdapter,
  ${prefix}FooterAdapter,
  ${prefix}StripAdapter,
  ${prefix}HomepageAdapter,
} from '@/components/storefront/themes/${theme}/adapters';
`;

  templatesToAdd += `
  '${theme}': {
    id: '${theme}',
    name: '${kebabToCamel(theme).replace(/([A-Z])/g, ' $1').trim()}',
    description: 'Auto-generated theme for ${theme}',
    group: 'specialty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: ${prefix}HeaderAdapter,
      Footer: ${prefix}FooterAdapter,
      AnnouncementStrip: ${prefix}StripAdapter,
    },
    pages: {
      home: ${prefix}HomepageAdapter,
    },
  },
`;
}

// Insert imports right before "export const templates"
newRegistry = newRegistry.replace('export const templates: Record<TemplateId, Template> = {', importsToAdd + '\nexport const templates: Record<TemplateId, Template> = {');

// Insert templates right before the closing brace of the templates object
newRegistry = newRegistry.replace(/};\s*export function getTemplate/g, templatesToAdd + '};\n\nexport function getTemplate');

fs.writeFileSync(typesFile, newTypes);
fs.writeFileSync(registryFile, newRegistry);
console.log('Successfully updated lib/templates/types.ts and lib/templates/registry.ts');
