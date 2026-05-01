# Structure

Mapping of the directory layout and key locations for `project-lilt` as of 2026-04-29.

## Directory Layout
- `.planning/`: GSD planning and documentation artifacts.
- `graphify-out/`: Graphify-generated knowledge graph artifacts.
- `public/`: Static assets.
- `src/`: Source code.
  - `components/`: UI components.
    - `ui/`: Shadcn/Radix UI primitive components.
  - `context/`: React Context providers.
  - `data/`: Static data and seeds.
  - `hooks/`: Custom React hooks.
  - `lib/`: Utility functions and shared logic.
  - `pages/`: Route components.
    - `admin/`: Admin-specific pages.
    - `employee/`: Employee-specific pages.
  - `test/`: Test setup and utilities.

## Key Files
- `src/App.tsx`: Main router and provider setup.
- `src/context/AppContext.tsx`: Global state and business logic.
- `src/data/seed.ts`: Schema definitions and dummy data.
- `src/lib/utils.ts`: Tailwind class merging utility.
- `src/lib/task-utils.ts`: Task-specific formatting and logic.
- `tailwind.config.ts`: Styling configuration.
