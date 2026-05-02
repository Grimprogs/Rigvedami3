import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ListTodo, PlusCircle, User, LogOut, CheckSquare2, Inbox } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

const adminNav = [
  { to: "/admin",            label: "Dashboard",   icon: LayoutDashboard, end: true },
  { to: "/admin/employees",  label: "Employees",   icon: Users },
  { to: "/admin/tasks",      label: "All tasks",   icon: ListTodo },
  { to: "/admin/my-tasks",   label: "My tasks",    icon: CheckSquare2 },
  { to: "/admin/employees/ME", label: "My Profile",  icon: User },
  { to: "/admin/approvals",  label: "Approvals",   icon: Inbox, badge: "approvals" as const },
  { to: "/admin/tasks/new",  label: "Create task", icon: PlusCircle },
];

const empNav = [
  { to: "/me",         label: "Dashboard",      icon: LayoutDashboard, end: true },
  { to: "/me/tasks",   label: "My tasks",       icon: ListTodo },
  { to: "/me/team",    label: "Team Directory", icon: Users },
  { to: "/me/employees/ME", label: "Profile",   icon: User },
];

interface Props { open: boolean; onClose: () => void; }

export function Sidebar({ open, onClose }: Props) {
  const { user, profile, logout } = useApp();
  const { pathname } = useLocation();
  const items = user?.role === "admin" ? adminNav : empNav;
  const { data: tasks = [] } = useTasks(
    user?.role === "employee"
      ? { role: "employee", userId: user.employeeId }
      : user
        ? { role: "admin" }
        : undefined
  );
  const approvalsCount = tasks.filter(t => t.status === "completion_requested").length;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed z-50 md:static inset-y-0 left-0 w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground",
          "transform transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border">
          <img src="/ztasks-logo.jpg" alt="ZTasks Logo" className="h-9 w-9 rounded-xl object-cover shadow-glow" />
          <div>
            <div className="font-display text-lg font-bold leading-none">ZTasks</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {user?.role === "admin" ? "Admin workspace" : "Employee"}
            </div>
          </div>
        </div>

        <nav className="p-3">
          <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
          <ul className="space-y-1">
            {items.map(item => {
              const to = item.to.replace("ME", user?.employeeId || profile?.id || "");
              const active = item.end ? pathname === to : pathname.startsWith(to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={to}
                    end={item.end}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className={cn("h-4.5 w-4.5", active ? "text-sidebar-primary" : "")} />
                    <span className="flex-1">{item.label}</span>
                    {(item as any).badge === "approvals" && approvalsCount > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                        {approvalsCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
