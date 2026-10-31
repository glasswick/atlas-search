// Exploratory, added after the first run (not part of PLAN.md's verdict): does the typo result hold beyond
// the one typo I guessed? Each misspelling should put at least one item with the intended word in the top 10.
import { items } from "./data.mjs";
const words = (t) => t.toLowerCase().split(/[^a-z0-9]+/);
const TYPOS = { pich: "pitch", explaner: "explainer", onbording: "onboarding", secuirty: "security",
  dashbord: "dashboard", wirefame: "wireframe", investr: "investor", rodmap: "roadmap", podcats: "podcast", slieds: "slides" };
for (const name of ["baseline", "baseline-typo", "minisearch", "fuse"]) {
  const engine = (await import(`./contestants/${name}.mjs`)).build(items);
  const row = Object.entries(TYPOS).map(([typo, word]) => {
    const top = engine.search({ text: typo }).slice(0, 10);
    return `${typo} ${top.some((x) => words(x.name).includes(word)) ? "ok" : "MISS"}`; });
  console.log(`${name.padEnd(13)} ${row.filter((r) => r.endsWith("ok")).length}/10  ${row.filter((r) => r.endsWith("MISS")).join(", ")}`);
}
