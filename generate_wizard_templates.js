const fs = require('fs');

const registryData = fs.readFileSync('lib/templates/registry.ts', 'utf-8');
const lines = registryData.split('\n');

const newTemplateIds = [
  'sai-sing', 'talad-see-sod', 'brutalist-thai', 'mono-eight', 'lila-modest',
  'atelier-27', 'bulkbox-industrial', 'caldera-skin', 'carbon-era-cameras',
  'glow-lamp-co', 'hinoki-apothecary', 'inkstone-paper', 'keystroke-lab',
  'korakot-house', 'linen-and-loom', 'mai-hatthakam', 'pastel-pack',
  'petit-cote', 'pigment-studio', 'reclaim-leather', 'saluki-yoga',
  'sirin-womenswear', 'smartloop-home', 'tinyhand-wooden-toys',
  'trailcraft-outdoors', 'wavelength-audio', 'yumeiro-lip'
];

let typeUnion = '';
let arrayElements = '';

newTemplateIds.forEach(id => {
  typeUnion += `  | "${id}"\n`;
  
  // Format name
  const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  arrayElements += `
  {
    id: "${id}",
    name: "${name}",
    description: "ธีมดีไซน์เฉพาะตัวสำหรับร้านค้า",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },`;
});

console.log("=== UNION ===");
console.log(typeUnion);
console.log("=== ARRAY ===");
console.log(arrayElements);
