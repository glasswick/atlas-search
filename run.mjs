// Runs the comparison in PLAN.md: correctness against ground truth, bytes, build time, query time.
// Usage: node run.mjs   (after npm install; pinned versions in package.json)
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { items, queries } from "./data.mjs";

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const kb = (n) => (n / 1024).toFixed(1);
const dataGz = gz(JSON.stringify(items));
// What a browser downloads for the library itself: the ES module file each package ships for browsers.
const libFile = { baseline: null, "baseline-typo": null, minisearch: "minisearch/dist/es/index.js", fuse: "fuse.js/dist/fuse.min.mjs" };
const libPath = (f) => new URL(`./node_modules/${f}`, import.meta.url);

function correct(name, got, truth) {
  const ids = new Set(truth.map((x) => x.id)), top = got.slice(0, 10);
  if (name === "q3_typo") { const n = top.filter((x) => ids.has(x.id)).length; return { pass: n >= 1, note: `${n} of top 10 are marketing items` }; }
  const want = Math.min(10, truth.length);
  const right = top.slice(0, want).filter((x) => ids.has(x.id)).length;
  return { pass: right === want, note: `${right}/${want} of the top ${want} are true matches (truth ${truth.length}, returned ${got.length})` };
}
const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };

const report = {};
for (const name of ["baseline", "baseline-typo", "minisearch", "fuse"]) {
  const mod = await import(`./contestants/${name}.mjs`);
  const glue = readFileSync(new URL(`./contestants/${name}.mjs`, import.meta.url));
  const libGz = libFile[name] ? gz(readFileSync(libPath(libFile[name]))) : 0;
  const r = (report[name] = { bytes_gz: { library: libGz, data: dataGz, glue: gz(glue), total: libGz + dataGz + gz(glue) } });
  for (const [label, s] of [["defaults", {}], ["settings", mod.settings]]) {
    if (label === "defaults" && Object.keys(mod.settings).length === 0) continue;
    const t0 = performance.now(); const engine = mod.build(items, s); const buildMs = performance.now() - t0;
    const out = (r[label] = { settings: s, build_ms: +buildMs.toFixed(1), queries: {} });
    for (const [q, spec] of Object.entries(queries)) {
      const got = engine.search(spec);
      const times = []; for (let i = 0; i < 100; i++) { const t = performance.now(); engine.search(spec); times.push(performance.now() - t); }
      out.queries[q] = { ...correct(q, got, spec.truth), median_ms: +pct(times, 0.5).toFixed(3), p95_ms: +pct(times, 0.95).toFixed(3) };
    }
  }
}

console.log(`node ${process.version}; ${items.length} items; data ${kb(dataGz)} KB gzipped`);
for (const [name, r] of Object.entries(report)) {
  console.log(`\n== ${name}: download ${kb(r.bytes_gz.total)} KB gz (library ${kb(r.bytes_gz.library)}, data ${kb(r.bytes_gz.data)}, glue ${kb(r.bytes_gz.glue)})`);
  for (const label of ["defaults", "settings"]) {
    if (!r[label]) continue;
    console.log(`  ${label} ${JSON.stringify(r[label].settings)}  build ${r[label].build_ms} ms`);
    for (const [q, v] of Object.entries(r[label].queries))
      console.log(`    ${v.pass ? "PASS" : "FAIL"} ${q.padEnd(17)} ${v.note}; median ${v.median_ms} ms, p95 ${v.p95_ms} ms`);
  }
}
if (process.argv.includes("--json")) console.log(JSON.stringify(report));
