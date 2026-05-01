# PROJECT LILT: Supabase Full-Stack Migration

Transform the existing React task management frontend into a production-ready system with a Supabase backend.

## Objective
Transform the existing React frontend into a production-ready full-stack Task Management System using Supabase.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Shadcn UI
- **Backend/Data Layer:** Supabase, PostgreSQL, Supabase Auth, Realtime, Row Level Security
- **AI Engineering Stack:** Graphify, GSD, Ralph Loop, Antigravity orchestration

## Core Requirement
**DO NOT regenerate frontend UI unnecessarily.**
- Preserve existing frontend structure, components, routing, and design system.
- Replace dummy/mock data with real backend integration.

## System Features
### Roles
1. **Admin:** Manage employees, assign tasks, monitor activity, approvals, analytics.
2. **Employee:** Login, view tasks, toggle status ("I'm On It"/"Not Doing"), request completion, profile.

### Task Workflow
Pending → In Progress → Completion Requested → Completed → Overdue

### Notification Events
Employee started task, Employee stopped task, Completion requested, Completion approved, Completion rejected.
