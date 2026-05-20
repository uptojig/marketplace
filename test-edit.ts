import fs from 'fs';
const file = fs.readFileSync('lib/landing-agent.ts', 'utf8');
const lines = file.split('\n');
console.log(lines.slice(250, 310).join('\n'));
