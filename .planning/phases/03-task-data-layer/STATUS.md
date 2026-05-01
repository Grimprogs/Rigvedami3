# Phase 3 Status

Status: in progress (hooks + migrations complete, verification pending)

Current state:
- Hook scaffolding complete: `useProfiles` and `useTasks` with workflow mutations.
- AppContext cleaned: removed employee/task state and workflow actions.
- Consumers migrated to hooks:
	- Admin: AdminDashboard, AdminEmployees, AdminEmployeeProfile, AdminCreateTask, AdminApprovals, AdminTasks
	- Employee: EmployeeDashboard, EmployeeTasks, EmployeeProfile
- TaskCard updated to use hook actions and profiles.
- Schema fields aligned to snake_case (`assignee_id`, `due_date`, `due_time`, `joined_at`, `avatar_color`).

Next action:
- Run lint and smoke-test admin/employee pages against Supabase.
- Fix any remaining null handling or field name mismatches.
- Move to Phase 4 once pages render without errors.
