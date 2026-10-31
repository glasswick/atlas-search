// Added 2026-10-31 after publishing, to try to break my own claim "Fuse passes on its defaults" (it broke).
// The synthetic names are short (about 10 to 40 characters). Real deliverable names may carry a long lead-in
// before the word you type. Same items, same queries; only a prefix is added to every name.
import { items as base } from "./data.mjs";
const words = (t) => t.toLowerCase().split(/[^a-z0-9]+/);
const PREFIXES = ["", "client handoff ", "client handoff for the northwind quarterly review - ",
  "2026-10 client handoff package for the northwind quarterly business review cycle - "];
const QUERIES = { expla: (w) => w.startsWith("expla"), markting: (w) => w === "marketing", pitch: (w) => w === "pitch" };
const TYPOS = { pich: "pitch", explaner: "explainer", onbording: "onboarding", secuirty: "security", dashbord: "dashboard",
  wirefame: "wireframe", investr: "investor", rodmap: "roadmap", podcats: "podcast", slieds: "slides" };
const CONTESTANTS = [["baseline"], ["baseline-typo"], ["minisearch"], ["fuse", {}],
  ["fuse", { ignoreLocation: true }], ["fuse", { threshold: 0.4 }]];

for (const p of PREFIXES) {
  const items = base.map((x) => ({ ...x, name: p + x.name }));
  console.log(`\nprefix of ${p.length} characters before every name ("found / true, of returned")`);
  for (const [name, s] of CONTESTANTS) {
    const e = (await import(`./contestants/${name}.mjs`)).build(items, s);
    const r = Object.entries(QUERIES).map(([q, f]) => {
      const truth = items.filter((x) => words(x.name).some(f)).length, got = e.search({ text: q });
      return `${q} ${got.filter((x) => words(x.name).some(f)).length}/${truth} of ${got.length}`; });
    const typos = Object.entries(TYPOS).filter(([a, w]) => e.search({ text: a }).slice(0, 10).some((x) => words(x.name).includes(w))).length;
    console.log(`  ${(name + (s && Object.keys(s).length ? " " + JSON.stringify(s) : "")).padEnd(32)} ${r.join("; ")}; typos ${typos}/10`);
  }
}
