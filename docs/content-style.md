# Content Style: Avoiding AI Writing Tells

This is the dedicated rule set for how text gets written in this
project: code comments, documentation, and (most importantly) any copy
that ends up visible on an actual page. It complements
`docs/anti-ai.md`, which covers visual patterns. This covers language.

The goal isn't to hide that AI helped write something. It's that
certain patterns are now so strongly associated with AI-generated text
that a reader notices the tell before they read the content, and on a
client-facing site, that reads as generic or unpolished regardless of
how good the underlying work is.

## Banned outright

**The em-dash (—) used as a clause separator.** This is the single
most recognizable AI writing tell in English. Use one of these
instead, picked by what the sentence actually needs:

| Instead of | Use |
|---|---|
| `X — which does Y` | `X, which does Y` |
| `X — Y follows from it` | `X. Y follows from it` (two sentences) |
| `X — specifically Y` | `X: Y` (colon, when Y explains X) |
| `X — an aside — Y` | `X (an aside) Y` (parentheses) |

A colon is the right call more often than it feels like it should be:
if the second half explains or specifies the first half, use `:`. If
the two halves are both complete thoughts, just end the sentence and
start a new one. If it's a genuine aside, parentheses read cleaner than
dashes.

**The "not X. It's Y" / "not just X, it's Y" construction.** ("This
isn't a template. It's a foundation.") Instantly recognizable, and it
almost always adds a sentence without adding information. Say what the
thing is directly, or contrast without the template: "Treat this as a
foundation, not a finished design."

**Rhetorical triplets used as filler.** Three short sentence fragments
in a row for rhythm ("Consistency. Clarity. Confidence.") without each
one carrying distinct information. A triplet is fine when all three
words are actually doing separate work; it's a tell when they're
near-synonyms stacked for cadence.

**Generic inspirational copy with no real referent**, covered in
`docs/anti-ai.md`'s Copy section: "Transform your business," "Elevate
your experience," and anything from that same drawer.

## Watch for, don't ban outright

These aren't wrong in isolation, but a page that stacks several of
them reads as AI-generated even if no single sentence does:

- Buzzwords: *seamless, leverage, elevate, unlock, empower, robust,
  cutting-edge, game-changing, synergy, holistic*. Each one is fine
  once, used precisely. A page with four of them is a tell.
- "Whether you're X or Y" as a default way to open a sentence.
- A summary paragraph that restates what was just said, especially at
  the end of a section ("In short, ..." / "Ultimately, ...").
- Excessive bold on lead-in phrases within body prose, turning
  paragraphs into a fake bullet list.

## How to check

```bash
grep -rn "—" --include="*.md" --include="*.tsx" --include="*.js" src docs *.md
```

Run this before considering any content change (copy, docs, comments)
finished. Zero results is the bar. New content should not reintroduce
what this doc removed; this isn't a one-time cleanup, it's a standing
rule enforced the same way any other Level 1 rule is (see
`docs/agent-protocol.md`).


## Line composition: don't break a grammatical link

After writing or editing any running text (paragraphs, descriptions,
button labels, headings), check that the rendered line break doesn't
fall between two words that belong to the same grammatical unit. The
bar isn't "no line may end on a short word": a line ending on an
article or preposition in the middle of a long sentence is normal,
unremarkable running text. The actual problem is the *link*, not the
word length. Never let a line break separate:

- **Subject and verb**: "This project" from "is built", not "the
  service" from "runs".
- **Noun and its adjective**: "a cozy" from "room".
- **Noun and its complement**: "compliance" from "with deadlines";
  "coverage" from "across regions".
- **Determiner and noun**: "each of" from "the three fronts"; "every"
  from "delivery".
- **Preposition and what it introduces, in a short fixed
  expression**: "right" from "away"; "as soon" from "as possible".

`typography.css` already carries the baseline that reduces this:
`text-wrap: pretty` on paragraphs, `text-wrap: balance` on headings
and display text. Both are progressive enhancement (Chromium-only for
`pretty` as of this writing; unsupported browsers fall back to normal
wrapping), and neither actually understands grammar: `balance` only
avoids a short *last* line; `pretty` only avoids a short last *word*.
Treat both as a first pass, not the fix.

**To fix a link that's still broken:**

1. Glue the two words with `&nbsp;` instead of a normal space (e.g.
   `each&nbsp;of the three fronts`), or wrap a short critical phrase in
   `.text-nowrap` (`typography.css`). Never apply `.text-nowrap` to a
   whole paragraph or a long phrase, only the minimal glued pair.
2. **The break changes with viewport width.** Fixing it at one width
   isn't enough: the same sentence wraps differently at each width.
   Check at minimum: 375px, 560px, 880px, 1200px, 1920px.
3. After gluing one pair, re-check the *same* sentence again: gluing
   two words can push the break onto the next pair (a domino effect).

**Verification script** (run in the browser console, resizing the
window between the widths above): reads the actual rendered lines, not
the raw text, and returns them split out for you to read and judge.
The script only reports what's on screen; deciding whether a given
break is grammatically broken is a human/agent judgment call, not
something to automate away.

```js
function linesFor(el) {
  var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  var words = [], node;
  while (node = walker.nextNode()) {
    var re = /\S+/g, m;
    while (m = re.exec(node.textContent)) {
      var r = document.createRange();
      r.setStart(node, m.index);
      r.setEnd(node, m.index + m[0].length);
      var rect = r.getBoundingClientRect();
      if (rect.width || rect.height) words.push({ w: m[0], top: Math.round(rect.top) });
    }
  }
  var lines = [], curTop = words[0]?.top, cur = [];
  words.forEach(function (wd) {
    if (Math.abs(wd.top - curTop) > 3) { lines.push(cur.join(' ')); cur = []; curTop = wd.top; }
    cur.push(wd.w);
  });
  if (cur.length) lines.push(cur.join(' '));
  return lines;
}
// Example: log the wrapped lines of every paragraph/target element.
document.querySelectorAll('p, .some-selector').forEach(el => console.log(linesFor(el)));
```

Run this at all five reference widths every time running text changes,
not once at the end. This is a standing check on any text edit, the
same way the em-dash grep above is, not a one-time cleanup pass.
