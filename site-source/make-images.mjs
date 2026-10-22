// Turns the photos in photos/ into WebP at 800 and 1600 px wide, and writes assets/data/photos.json
// (the profile page shows only the photos listed there; everything else stays a typographic card).
//   node make-images.mjs [--in photos] [--out ../assets]
// Credits: photos/credits.txt, one line per file:  filename | title | author | licence | source URL
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const inDir = new URL(arg('in', 'photos') + '/', 'file://' + process.cwd() + '/').pathname, outDir = new URL(arg('out', '../assets') + '/', 'file://' + process.cwd() + '/').pathname;
mkdirSync(join(outDir, 'img'), { recursive: true }); mkdirSync(join(outDir, 'data'), { recursive: true });
const credits = {};
if (existsSync(join(inDir, 'credits.txt'))) for (const line of readFileSync(join(inDir, 'credits.txt'), 'utf8').split('\n')) {
  const [file, ...rest] = line.split('|').map((s) => s.trim()); if (file && rest.length && !file.startsWith('#')) credits[ALIAS[parse(file).name] || parse(file).name] = rest.filter(Boolean).join(', ');
}
// short file names the owner uses -> the names the pages look for
const ALIAS = { iitr: 'iit-roorkee', kurukshetrauniversity: 'kurukshetra-university', nitkkr: 'nit-kurukshetra', uoh: 'university-of-hull', kdd: 'kdd-2018-london', kdd2018: 'kdd-2018-london' };
// only photos the pages use are published
const USED = new Set(['headshot', 'kurukshetra-university', 'nit-kurukshetra', 'iit-roorkee', 'kdd-2018-london', 'ucl', 'university-of-hull']);
const manifest = {};
for (const f of readdirSync(inDir).filter((n) => /\.(jpe?g|png|webp|avif)$/i.test(n)).sort()) {
  const name = ALIAS[parse(f).name] || parse(f).name;
  if (!USED.has(name)) { console.log('skipped (not used by any page):', f); continue; }
  const src = sharp(join(inDir, f)).rotate();
  const meta = await sharp(join(inDir, f)).rotate().metadata();
  let h800 = 0;
  for (const w of [800, 1600]) {
    const info = await src.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(outDir, 'img', `${name}-${w}.webp`));
    if (w === 800) h800 = info.height;
  }
  manifest[name] = { h: h800, ...(credits[name] ? { credit: credits[name] } : {}) };
  console.log(name, meta.width + 'x' + meta.height, '->', '800 and 1600 wide');
}
writeFileSync(join(outDir, 'data', 'photos.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log('wrote', Object.keys(manifest).length, 'photos to photos.json');
