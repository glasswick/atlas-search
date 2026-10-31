// 5,000 synthetic deliverables shaped like upgradebot-qbranch's atlas (PLAN.md). Fixed seed: same items every run.
// Their real data isn't public; only the field shapes come from their post.
export const NOW = Date.parse("2026-10-31T00:00:00Z");   // fixed "today", so "last 7 days" never drifts
const DAY = 86_400_000;

let s = 20261031;                                          // mulberry32
const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rand() * a.length)];

export const TYPES = ["deck", "video", "audio", "pdf", "mockup", "cli", "skill"];           // their 7
export const BOTS = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"];                 // their ~9
const PROJECT_WORDS = ["northwind", "harbor", "lumen", "cobalt", "juniper", "atlas", "quarry", "ember", "tidal", "sable"];
export const PROJECTS = Array.from({ length: 30 }, (_, i) => `${PROJECT_WORDS[i % 10]} ${["launch", "retainer", "audit"][Math.floor(i / 10)]}`);
const TOPIC = ["Q1", "Q2", "Q3", "Q4", "onboarding", "pricing", "marketing", "hiring", "roadmap", "security", "growth", "partner", "investor", "support", "brand"];
const NOUN = {
  deck: ["pitch deck", "slides", "board deck", "pitch slides"],
  video: ["demo video", "walkthrough", "teaser cut", "explainer video"],
  audio: ["audio explainer", "podcast cut", "voice memo", "explainer episode"],
  pdf: ["report", "one-pager", "brief", "whitepaper"],
  mockup: ["landing mockup", "dashboard mockup", "wireframe", "pitch page mockup"],
  cli: ["sync tool", "export cli", "uploader", "linter"],
  skill: ["research skill", "summary skill", "outreach skill", "review skill"],
};
const EXTRA = ["draft", "final", "v2", "short", "long", "internal", "client"];

export const items = Array.from({ length: 5000 }, (_, i) => {
  const type = pick(TYPES);
  const words = [pick(TOPIC), pick(NOUN[type])];
  if (rand() < 0.5) words.push(pick(EXTRA));
  return { id: i, name: words.join(" "), type, bot: pick(BOTS), project: pick(PROJECTS),
    date: new Date(NOW - Math.floor(rand() * 365) * DAY).toISOString().slice(0, 10) };
});

// The four queries (my guesses, PLAN.md) and their ground truth from a plain filter.
const words = (t) => t.toLowerCase().split(/[^a-z0-9]+/);
export const weekAgo = new Date(NOW - 7 * DAY).toISOString().slice(0, 10);
export const queries = {
  q1_word_and_type: { text: "pitch", type: "deck", truth: items.filter((x) => x.type === "deck" && words(x.name).includes("pitch")) },
  q2_prefix:        { text: "expla", truth: items.filter((x) => words(x.name).some((w) => w.startsWith("expla"))) },
  q3_typo:          { text: "markting", truth: items.filter((x) => words(x.name).includes("marketing")) },
  q4_bot_this_week: { bot: "B3", since: weekAgo, truth: items.filter((x) => x.bot === "B3" && x.date >= weekAgo) },
};
