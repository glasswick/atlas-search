// Fuse.js 7.5.0: scores every name on each query (no inverted index); type/bot/date filtered after.
import Fuse from "fuse.js";
export const settings = {};                           // the defaults passed all four queries
export function build(items, s = settings) {
  const fuse = new Fuse(items, { keys: ["name", "project"], ...s });
  return { search({ text, type, bot, since }) {
    const keep = (x) => (!type || x.type === type) && (!bot || x.bot === bot) && (!since || x.date >= since);
    return (text ? fuse.search(text).map((r) => r.item) : items).filter(keep);
  } };
}
