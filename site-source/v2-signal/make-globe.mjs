// Generates land dots for the globe from Natural Earth (world-atlas).
//   node v2-signal/make-globe.mjs --res 110m --step 2.2 --out v2-signal/land.json                       (whole world, current file)
//   node v2-signal/make-globe.mjs --res 50m --step 0.18 --bbox 27,75,32,81 --out v2-signal/india-detail.json  (Kurukshetra to Roorkee)
//   node v2-signal/make-globe.mjs --res 50m --step 0.12 --bbox 50,-6,56,2 --out v2-signal/uk-detail.json      (London to Hull)
//   --shape file.topojson  keeps only dots inside that outline (used with India's official-boundary outline and the UK outline)
// Output: flat array [lat*100, lon*100, lat*100, lon*100, ...] (integers, hundredths of a degree).
import { readFileSync, writeFileSync } from 'node:fs';
import * as topo from 'topojson-client';
import { geoContains } from 'd3-geo';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const res = arg('res', '110m'), step = +arg('step', 2.2), out = arg('out', 'land.json');
const [s, w, n, e] = (arg('bbox', '-58,-180,80,180')).split(',').map(Number);
const world = JSON.parse(readFileSync(new URL(`../node_modules/world-atlas/land-${res}.json`, import.meta.url), 'utf8'));
let land = topo.feature(world, world.objects.land);
const shape = arg('shape', '');
if (shape) { const t = JSON.parse(readFileSync(shape, 'utf8')); land = { type: 'FeatureCollection', features: Object.values(t.objects).flatMap((o) => topo.feature(t, o).features || [topo.feature(t, o)]) }; }
const pts = [];
for (let lat = s; lat <= n; lat += step) {
  const lonStep = step / Math.max(0.2, Math.cos(lat * Math.PI / 180));
  for (let lon = w; lon <= e; lon += lonStep) if (geoContains(land, [lon, lat])) pts.push(Math.round(lat * 100), Math.round(lon * 100));
}
writeFileSync(out, JSON.stringify(pts));
console.log(out, pts.length / 2, 'dots', JSON.stringify(pts).length, 'bytes');
