# Graph Report - src  (2026-05-02)

## Corpus Check
- 90 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 157 nodes · 297 edges · 15 communities detected
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
Cohesion: 0.07
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (4): calculateTaskDuration(), formatDuration(), formatDue(), timeRemaining()

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (8): useApproveCompletion(), useDeleteTask(), useRejectCompletion(), useRequestCompletion(), useStartTask(), useStatusMutation(), useStopTask(), useTaskActions()

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (4): canManage(), getRank(), normalize(), submit()

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (5): addToRemoveQueue(), dispatch(), genId(), reducer(), toast()

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.33
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

## Knowledge Gaps
- **Thin community `Community 9`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `example.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `supabase-connection.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._