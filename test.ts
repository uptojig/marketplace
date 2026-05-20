import fs from 'fs';
const code = fs.readFileSync('lib/landing-agent.ts', 'utf8');
console.log(code.match(/schemaVersion:.*\n.*type:.*\n/g));
