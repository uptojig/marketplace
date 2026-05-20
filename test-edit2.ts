import fs from 'fs';
const file = fs.readFileSync('components/storefront/BlockRenderer.tsx', 'utf8');
const lines = file.split('\n');
console.log(lines.slice(1185, 1240).join('\n'));
