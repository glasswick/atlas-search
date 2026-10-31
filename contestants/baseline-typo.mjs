// No library, plus typo tolerance by hand: a word matches if it starts with the query, or is within
// 1 edit (queries up to 5 letters) or 2 edits (longer) of it. Still no ranking: exact matches first, then typos.
export const settings = {};
const words = (t) => t.toLowerCase().split(/[^a-z0-9]+/);
function edits(a, b, max) {                     // Levenshtein distance, giving up once it passes max
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
export function build(items) {
  return { search({ text, type, bot, since }) {
    const keep = items.filter((x) => (!type || x.type === type) && (!bot || x.bot === bot) && (!since || x.date >= since));
    if (!text) return keep;
    const q = text.toLowerCase(), max = q.length <= 5 ? 1 : 2;
    const exact = keep.filter((x) => words(x.name).some((w) => w.startsWith(q)));
    if (exact.length) return exact;            // typos only when nothing matches as typed
    return keep.filter((x) => words(x.name).some((w) => edits(q, w, max) <= max));
  } };
}
