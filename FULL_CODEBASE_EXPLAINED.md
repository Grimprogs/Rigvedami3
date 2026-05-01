# project-lilt — Simple, baby-friendly explanation

This file explains how the app wiring works (App.tsx) in very simple terms, shows the routes, explains key words, and gives a step-by-step build approach.

**Where to look**
- Main wiring file: [src/App.tsx](src/App.tsx#L1-L60)

**Short summary**
- The app is a React SPA (single-page app).
- `App.tsx` sets up global providers (things the whole app uses) and the router (what page to show when you go to a path).

---

**How I would have built this logic — ELI5 (like a baby)**

1. Think of the app like a house with rooms:
   - Each web page is a room (Landing, AdminDashboard, EmployeeDashboard, etc.).
   - The front door is the URL (path) you type in the address bar.
2. I build helpers people use everywhere:
   - A cookie jar for shared data (`AppProvider`) so all rooms can share small information.
   - A query manager (`QueryClientProvider`) that remembers fetched data so rooms don’t keep asking the server the same thing.
   - A tooltip box and toasters (tiny popup messages) that can be shown from any room.
3. Then I put a map on the wall — a Router:
   - The router says: when the address is `/admin/tasks`, bring out the `AdminTasks` room.
   - Some rooms need a key (permission). I use `ProtectedRoute` which checks the key and either lets you in or sends you to login.
4. I wrap rooms needing the site layout with `AppLayout` so they all have the same header/sidebar.

---

**Step-by-step of `src/App.tsx` (line references shown)**

- `QueryClient` / `QueryClientProvider` — (top) Makes a central place to cache server data so pages load faster and share results.
- `AppProvider` — your app-level React context. It holds small global state (user info, theme, etc.).
- `TooltipProvider` — enables tooltips across the app.
- `Toaster` and `Sonner` — two toast components (pop-up messages). They are rendered once so any page can trigger a message.
- `BrowserRouter` — sets up the app to listen to the browser address bar and show the right page.
- `Routes` and `Route` — the map: each `Route` maps a `path` to a React element (component tree to render).
- `ProtectedRoute` — a wrapper component that checks the `role` prop; if allowed, renders children; otherwise redirects to login.
- `AppLayout` — common layout wrapper (header/sidebar) used by many admin/employee pages.

Example route (what happens when you open `/admin/tasks`):
- Browser sees `/admin/tasks` → `BrowserRouter` matches the `Route` with `path="/admin/tasks"` → React renders `<ProtectedRoute role="admin">` → `ProtectedRoute` verifies user role → if OK: renders `<AppLayout><AdminTasks/></AppLayout>` → user sees page with layout and content.

---

**Routing map (human-friendly)**

- `/` → Landing (public)
- `/login/admin` → Login (admin)
- `/login/employee` → Login (employee)
- `/admin` → AdminDashboard (admin only)
- `/admin/employees` → AdminEmployees (admin only)
- `/admin/employees/:id` → AdminEmployeeProfile (admin only)
- `/admin/tasks` → AdminTasks (admin only)
- `/admin/tasks/new` → AdminCreateTask (admin only)
- `/admin/approvals` → AdminApprovals (admin only)
- `/me` → EmployeeDashboard (employee only)
- `/me/tasks` → EmployeeTasks (employee only)
- `/me/profile` → EmployeeProfile (employee only)
- `*` → NotFound (any unmatched path)

---

**Key words and what they mean (plain)**

- `React` — a library that draws pages using components; think of components as LEGO blocks.
- `component` — a function or class that returns UI (JSX). Example: `Landing`, `Login`.
- `prop` — extra information you hand to a component (like `role="admin"`).
- `children` — the content you put inside a component tag; e.g., `<AppLayout>...children...</AppLayout>`.
- `Context` (`AppProvider`) — a global bag you can read from anywhere without passing props through every level.
- `QueryClient` / `react-query` — a helper for fetching and caching server data.
- `Router` (`BrowserRouter`) — watches the URL and shows the right component.
- `Route` — one single rule in the router map linking a path to an element.
- `ProtectedRoute` — special route wrapper that either allows access or redirects to login.
- `AppLayout` — common frame (header + sidebar) shared by many pages.

---

**How the pieces connect (connectivity)**

- `QueryClientProvider` and `AppProvider` wrap everything so any page can use the query cache and app-level context.
- `BrowserRouter` lives inside those providers so the routed pages can use context and query hooks.
- `ProtectedRoute` reads the app context (likely `AppProvider`) to check the current user role, then either shows its `children` or navigates away.
- `AppLayout` sits inside `ProtectedRoute` so layout is only shown to logged-in users.

---

**Minimal example: what `ProtectedRoute` typically does**

```
function ProtectedRoute({ role, children }) {
  const { user } = useAppContext(); // read user from AppProvider
  if (!user) return <Navigate to="/login" />; // not logged in
  if (role && user.role !== role) return <Navigate to="/" />; // wrong role
  return children; // allowed
}
```

---

**If I were building this from scratch — tiny checklist (how-to, baby steps)**

1. Create pages: `Landing`, `Login`, `NotFound`, `AdminDashboard`, etc. Make them simple placeholders.
2. Add `BrowserRouter`, `Routes`, `Route` in `App.tsx` and map paths to the page components.
3. Build `AppProvider` with a minimal context containing `user` and `setUser`.
4. Create `ProtectedRoute` that reads `user` and checks `role`.
5. Add `AppLayout` component and wrap protected pages in it.
6. Install and set up `@tanstack/react-query` (create `QueryClient` and wrap app), then replace data fetching with `useQuery` where needed.
7. Add UI helpers (toaster, tooltips) and render them once in `App.tsx` so pages can trigger them.

---

**Where this file sits**
- The live code is at [src/App.tsx](src/App.tsx#L1-L60) in this repo.

---

**Next actions / question for you**
- Do you want me to revert any recent edits to `src/App.tsx` or other files? If yes, tell me which file(s) or describe the desired previous state and I will revert.

---

*End of explanation.*
