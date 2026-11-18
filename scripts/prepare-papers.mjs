// Turns the PDFs in ../Papers into scrambled .dat files for the view-only reader.
// The original PDFs never enter this project, its repository or the published site.
// Run again (npm run prepare:papers) whenever a paper changes.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scramble } from '../src/scripts/paper-cipher.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'Papers');
const target = join(root, 'public', 'papers');
const papers = { 'mirror-slam': 'Mirror-SLAM.pdf', 'dmsc-slam': 'DMSC-SLAM.pdf', 'nst-sam': 'NST-SAM.pdf' };

mkdirSync(target, { recursive: true });
for (const [id, file] of Object.entries(papers)) {
  const bytes = new Uint8Array(readFileSync(join(source, file)));
  writeFileSync(join(target, `${id}.dat`), scramble(bytes, id));
  console.log(`${file} -> public/papers/${id}.dat`);
}
