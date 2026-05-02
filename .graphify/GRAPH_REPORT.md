# Graph Report - .  (2026-05-02)

## Corpus Check
- 97 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2127 nodes · 6422 edges · 30 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `t()` - 120 edges
2. `Id` - 88 edges
3. `filter()` - 79 edges
4. `EE()` - 75 edges
5. `map()` - 69 edges
6. `r()` - 65 edges
7. `from()` - 63 edges
8. `join()` - 57 edges
9. `Q()` - 49 edges
10. `kV()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `n()` --calls--> `r()`  [EXTRACTED]
  dist/assets/index-BxggdA5z.js → dist/assets/index-BxggdA5z.js  _Bridges community 3 → community 1_
- `n()` --calls--> `fetch()`  [EXTRACTED]
  dist/assets/index-BxggdA5z.js → dist/assets/index-BxggdA5z.js  _Bridges community 3 → community 2_
- `sp()` --calls--> `i()`  [EXTRACTED]
  dist/assets/index-BxggdA5z.js → dist/assets/index-BxggdA5z.js  _Bridges community 11 → community 3_
- `sp()` --calls--> `UB()`  [EXTRACTED]
  dist/assets/index-BxggdA5z.js → dist/assets/index-BxggdA5z.js  _Bridges community 11 → community 1_
- `HB()` --calls--> `t()`  [EXTRACTED]
  dist/assets/index-BxggdA5z.js → dist/assets/index-BxggdA5z.js  _Bridges community 7 → community 9_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (321): $7(), A_e(), Aae(), Abe(), ade(), af(), Afe(), ag() (+313 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (221): _8(), ab(), Al(), aR(), aU(), Av(), az(), b$() (+213 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (98): _6(), addObserver(), bindMethods(), cancel(), cancelRefEvent(), cancelTimeout(), canPush(), Ch() (+90 more)

### Community 3 - "Community 3"
Cohesion: 0.02
Nodes (196): a$(), A3(), AA(), AC(), ah(), Ai(), aj(), ake() (+188 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (45): _2(), a0(), a7(), a8(), aK(), bN(), d7(), E2() (+37 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (21): canManage(), getRank(), normalize(), submit(), calculateTaskDuration(), formatDuration(), formatDue(), timeRemaining() (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.03
Nodes (116): Ao(), aP(), aq(), b7(), BM(), bW(), C9(), cd() (+108 more)

### Community 7 - "Community 7"
Cohesion: 0.03
Nodes (93): aE(), applyTransformOptsToQuery(), bh(), binaryEncode(), build(), bz(), cancelQueries(), catch() (+85 more)

### Community 8 - "Community 8"
Cohesion: 0.03
Nodes (95): a0e(), add(), B4(), bve(), Bx(), Bye(), c4(), canRun() (+87 more)

### Community 9 - "Community 9"
Cohesion: 0.03
Nodes (91): aee(), AN(), b1e(), bj(), bT(), bue(), bwe(), C2() (+83 more)

### Community 10 - "Community 10"
Cohesion: 0.04
Nodes (60): a6(), at(), b0(), b6(), Bc(), c6(), clear(), Dz() (+52 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (41): A1(), aye(), d5(), E1(), Fo(), fre(), G7(), GX() (+33 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (37): _1e(), _3(), a1e(), Bv(), c1e(), cj(), cve(), Di() (+29 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (31): bbe(), cm(), Dbe(), Fbe(), Fee(), G4(), gbe(), hbe() (+23 more)

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (29): Ahe(), ape(), bhe(), cE(), Che(), dhe(), epe(), fhe() (+21 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (7): binaryDecode(), decode(), decodeBroadcast(), decodePush(), decodeReply(), onConnMessage(), xV

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (17): ajax(), batchSend(), createTable(), createTableIfNotExists(), dH(), dropNamespace(), dropTable(), listNamespaces() (+9 more)

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (1): f6

### Community 18 - "Community 18"
Cohesion: 1
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 18`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `example.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `supabase-connection.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Id` connect `Community 4` to `Community 0`, `Community 3`, `Community 9`, `Community 1`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `kV()` connect `Community 2` to `Community 0`, `Community 4`, `Community 15`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Wv()` connect `Community 2` to `Community 0`, `Community 10`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._