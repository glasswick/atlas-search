// No library: the items array and a filter. No ranking (array order), no typo tolerance.
export const settings = {};
const words = (t) => t.toLowerCase().split(/[^a-z0-9]+/);
export function build(items) {
  return { search({ text, type, bot, since }) {
    const q = text?.toLowerCase();
    return items.filter((x) => (!type || x.type === type) && (!bot || x.bot === bot) && (!since || x.date >= since)
      && (!q || words(x.name).some((w) => w.startsWith(q))));
  } };
}
