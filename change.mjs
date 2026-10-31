// The change test (PLAN.md, upkeep): "search the project name too", made in each contestant
// (contestants/with-project/, a one-line diff each). Checks the new query and that the old four still pass.
import { items, queries } from "./data.mjs";
const words = (t) => t.toLowerCase().split(/[^a-z0-9]+/);
const q5 = { text: "harbor", truth: items.filter((x) => words(`${x.name} ${x.project}`).some((w) => w.startsWith("harbor"))) };
const check = (got, truth, typo) => { const ids = new Set(truth.map((x) => x.id)), top = got.slice(0, 10);
  if (typo) return top.some((x) => ids.has(x.id)); const want = Math.min(10, truth.length);
  return top.slice(0, want).filter((x) => ids.has(x.id)).length === want; };
for (const name of ["baseline", "minisearch", "fuse"]) {
  const engine = (await import(`./contestants/with-project/${name}.mjs`)).build(items);
  const r5 = engine.search(q5);
  const old = Object.entries(queries).map(([q, s]) => `${q.slice(0, 2)} ${check(engine.search(s), s.truth, q === "q3_typo") ? "PASS" : "FAIL"}`);
  console.log(`${name.padEnd(10)} harbor: ${check(r5, q5.truth) ? "PASS" : "FAIL"} (truth ${q5.truth.length}, returned ${r5.length}); old four: ${old.join(", ")}`);
}
