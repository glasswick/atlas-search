// MiniSearch 7.2.0: an inverted index over the name; type/bot/date are stored and filtered after.
import MiniSearch from "minisearch";
export const settings = { prefix: true, fuzzy: 0.2 };   // the knobs added beyond the defaults
export function build(items, s = settings) {
  const ms = new MiniSearch({ fields: ["name"], storeFields: ["type", "bot", "date"] });
  ms.addAll(items);
  const byId = new Map(items.map((x) => [x.id, x]));
  return { search({ text, type, bot, since }) {
    const filter = (r) => (!type || r.type === type) && (!bot || r.bot === bot) && (!since || r.date >= since);
    return ms.search(text ?? MiniSearch.wildcard, { ...s, filter }).map((r) => byId.get(r.id));
  } };
}
