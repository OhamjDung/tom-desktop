import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const lines = readFileSync(process.argv[2], 'utf8').split(/\r?\n/);
function block(heading, language) {
  const section = lines.findIndex(line => line === heading);
  const start = lines.findIndex((line, i) => i > section && line === '```' + language);
  const end = lines.findIndex((line, i) => i > start && line === '```');
  if (section < 0 || start < 0 || end < 0) throw new Error('Missing supplied component block');
  return lines.slice(start + 1, end).join('\n') + '\n';
}
mkdirSync(resolve('components/effects'), { recursive: true });
writeFileSync(resolve('components/effects/AeroShards.jsx'), block('### Full Component Source', 'jsx'));
writeFileSync(resolve('components/effects/AeroShards.css'), block('### Component CSS', 'css'));
console.log('Extracted the first AeroShards source and CSS verbatim.');
