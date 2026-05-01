# Graph Report - project-lilt  (2026-04-30)

## Corpus Check
- 93 files · ~28,169 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 156 nodes · 83 edges · 3 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]

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
- `StatusBadge()` --calls--> `statusMeta()`  [INFERRED]
  src\components\StatusBadge.tsx → src\lib\task-utils.ts
- `PriorityBadge()` --calls--> `priorityMeta()`  [INFERRED]
  src\components\StatusBadge.tsx → src\lib\task-utils.ts
- `Toaster()` --calls--> `useToast()`  [INFERRED]
  src\components\ui\toaster.tsx → src\hooks\use-toast.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.33
Nodes (8): useApproveCompletion(), useDeleteTask(), useRejectCompletion(), useRequestCompletion(), useStartTask(), useStatusMutation(), useStopTask(), useTaskActions()

### Community 1 - "Community 1"
Cohesion: 0.28
Nodes (6): formatDue(), priorityMeta(), statusMeta(), timeRemaining(), PriorityBadge(), StatusBadge()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (7): Toaster(), addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast()

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._