# Graph Report - .  (2026-04-30)

## Corpus Check
- 93 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 150 nodes · 264 edges · 25 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `useTaskActions()` - 7 edges
2. `useStatusMutation()` - 6 edges
3. `reducer()` - 3 edges
4. `dispatch()` - 3 edges
5. `toast()` - 3 edges
6. `useStartTask()` - 3 edges
7. `useStopTask()` - 3 edges
8. `useRequestCompletion()` - 3 edges
9. `useApproveCompletion()` - 3 edges
10. `useRejectCompletion()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (2): formatDue(), timeRemaining()

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (8): useApproveCompletion(), useDeleteTask(), useRejectCompletion(), useRequestCompletion(), useStartTask(), useStatusMutation(), useStopTask(), useTaskActions()

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (5): addToRemoveQueue(), dispatch(), genId(), reducer(), toast()

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1
Nodes (0): 

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

## Knowledge Gaps
- **Thin community `Community 9`** (2 nodes): `chart.tsx`, `useChart()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `command.tsx`, `dialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `drawer.tsx`, `Drawer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `toggle.tsx`, `toggle-group.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `input-otp.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `example.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `supabase-connection.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._