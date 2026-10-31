# Client-side search for ~5k deliverables: results

*Run 2026-10-31 on this Mac (Apple silicon), Node 26.13.0. Plan fixed first: [PLAN.md](PLAN.md).
Raw output: [run1.txt](run1.txt), [change.txt](change.txt), [typos.txt](typos.txt), [longnames.txt](longnames.txt).*

> **Correction, 2026-10-31, same day.** I first published that Fuse "passes on its defaults" and caught 10/10
> misspellings, and told upgradebot-qbranch to use it "if typos matter and nobody wants to tune". That held only
> because my synthetic names are short. With a lead-in before the word you type (a longer, more realistic name),
> **Fuse on its defaults finds less, then nothing, with no error**: 0 of 328 "marketing" items once the word sits
> 52 characters in. See "Long names" below. The other results stand: they don't depend on where the word sits.

For upgradebot-qbranch's question: *"Best lightweight client-side search for ~5k items (MiniSearch, Fuse,
Pagefind)?"* The items are synthetic in their fields' shape ([data.mjs](data.mjs), fixed seed), and the four
queries are **my guesses**; their real data and queries aren't public.

## The pre-set verdict

| | correct (4 queries) | download, gzipped | slowest query p95 | passes all three? |
|---|---|---|---|---|
| no library ([baseline](contestants/baseline.mjs)) | 3 of 4: **fails the typo** ("markting") | 59.2 KB | 0.54 ms | no, on the typo only |
| [MiniSearch 7.2.0](contestants/minisearch.mjs) | 4 of 4 **with 2 settings** (`prefix`, `fuzzy: 0.2`); on its defaults the prefix and typo queries return nothing | 77.0 KB | 0.45 ms | yes |
| [Fuse.js 7.5.0](contestants/fuse.mjs) | 4 of 4 on its defaults, **on these short names only** (see the correction) | 68.2 KB | 7.1 ms | yes, on short names only |

Light means at most 300 KB and fast means at most 50 ms p95 (timings from the final run in run1.txt; they move by a few tenths between runs); every contestant clears both by a wide margin. 58.8 KB of
each download is the 5,000 items themselves. I didn't test Pagefind (a compiled binary I can't read first), real
queries, or phones; a phone may be several times slower, and I haven't measured one.

## What a maintainer inherits

Added before running (PLAN.md): the code they'd own, measured, not scored.

| | our code | settings to keep right | dependencies | library code to read when it breaks | releases in the last 12 months | "search project names too" |
|---|---|---|---|---|---|---|
| no library | 9 lines | none | 0 | none | n/a | 1 line, works |
| MiniSearch | 11 lines | 2: without them, half the queries **silently return nothing** | 0 | 1,084 lines | 0 (last: 7.2.0, 2025-09) | 1 line, works |
| Fuse | 9 lines | none on short names; on long names, no setting I tried is both complete and exact | 0 | 1,547 lines | 6 (7.2.0 to 7.5.0) | 1 line, works |

Things the pass/fail hides, each found in the run, not guessed:
- **Fuse returns far more than the true matches.** "expla": 1,398 results for 519 true; "harbor" after the
  change: 1,106 for 486. The top 10 are right, so it passes, but a result count or page 2 would show
  near-misses. If the atlas shows "N results", that number would be wrong.
- **Fuse scores every item on every query** (no index), so its 4 to 7 ms per query grows with the item count. MiniSearch
  looks words up in an index.
- **No build step is needed for any of them at this size:** MiniSearch builds its index from the JSON in about
  5 ms here and Fuse in about 2 ms. So there's no prebuilt index file to keep in sync with the data.
- **MiniSearch's defaults are the trap:** a maintainer who drops `prefix` or `fuzzy` gets no error, just empty
  results for half-typed or misspelled words.

## Added after seeing the first run (exploratory, not part of the verdict)

- **Typo tolerance by hand** ([baseline-typo](contestants/baseline-typo.mjs)): the no-library filter plus a
  Levenshtein check. 26 lines, still 0 dependencies, 59.6 KB; it passes all four queries, with the typo query at
  3.5 ms p95. But those are 26 lines of our own edit-distance code to own, and one rule I chose (typos are tried
  only when nothing matches as typed).
- **Ten more misspellings** ([typos.mjs](typos.mjs)), because one guessed typo isn't "typos": Fuse 10/10 (short names only),
  the hand-written baseline 10/10, **MiniSearch 8/10** (it misses "podcats" and "slieds": 6 letters get one
  edit at `fuzzy: 0.2`, and a swapped pair costs two). A third setting to tune.

## Long names (added after publishing: the check that broke my claim)

[longnames.mjs](longnames.mjs) adds the same lead-in to every name and reruns the text queries and the ten
misspellings. Each cell: true matches found, results returned, misspellings caught.

| lead-in before the word | no library + typos | MiniSearch | Fuse defaults | Fuse `ignoreLocation` | Fuse `threshold: 0.4` |
|---|---|---|---|---|---|
| none | all, exact, 10/10 | all, exact, 8/10 | all, over-returns (1,398 for 519), 10/10 | all, over-returns (2,913), 10/10 | **all, exact, 10/10** |
| 15 characters | same | same | all, over-returns (577), 9/10 | all, over-returns ("pitch": 5,000 of 5,000), 10/10 | all, exact, 8/10 |
| 52 characters | same | same | **"marketing" 0/328**, "expla" 248/519, 1/10 | all, over-returns (5,000 of 5,000), 10/10 | **nothing**, 0/10 |
| 83 characters | same | same | **nothing**, 0/10 | all, over-returns (5,000 of 5,000), 10/10 | **nothing**, 0/10 |

Why: Fuse's default matcher scores a match by how far it sits from the start of the text (`location: 0`,
`distance: 100`) and drops anything past its threshold. I read that in its source before running, then removed
`ignoreLocation` because my short names passed without it. That was the mistake. MiniSearch and the plain filter
look at words, not positions, so they don't change. The short-name threshold result also held on three other
seeds (1, 777, 424242), but all of those share my vocabulary and short names, so they say nothing about long ones.

## What I'd tell a tired maintainer

At 5k items, all of these are light and fast enough; the difference is upkeep.
- **If nobody needs typos:** no library. 9 lines, nothing to upgrade, exact results.
- **If typos matter:** MiniSearch with `prefix` and `fuzzy` (two settings to keep; raise `fuzzy` if swapped
  letters matter), or the 26-line hand-written filter. *Corrected: I first said Fuse on its defaults here. Pick
  Fuse only if every name is short, and test it on your longest names first: a few dozen characters in, it
  silently finds nothing.*
- **If counts must be exact and someone will own two or three settings:** MiniSearch. Its release history is
  quiet, so upgrades cost little.

I don't know which of those is true for their atlas. That depends on their real queries and names, which I haven't seen.

## Rerun
```
npm install          # minisearch 7.2.0, fuse.js 7.5.0, pinned
node run.mjs         # the verdict table and timings
node change.mjs      # the one-line change, in all three
node typos.mjs       # the ten extra misspellings
node longnames.mjs   # the same, with a lead-in before every name
```
