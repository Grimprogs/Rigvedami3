import { Link, useParams } from "react-router-dom";
import { useProfile } from "@/hooks/useProfiles";
import { useTasks } from "@/hooks/useTasks";
import { UserAvatar } from "@/components/UserAvatar";
import { TaskCard } from "@/components/TaskCard";
import { ArrowLeft, Mail, Building2, CalendarDays, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AdminEmployeeProfile() {
  const { id } = useParams();
  const { data: employee } = useProfile(id);
  const { user } = useApp();
  const isAdmin = user?.role === 'admin';
  const { data: tasks = [] } = useTasks(isAdmin ? { role: "admin" } : undefined);

  if (!employee) {
    return (
      <div className="surface-card p-10 text-center">
        <p className="text-muted-foreground">Employee not found.</p>
        <Link to={isAdmin ? "/admin/employees" : "/me/team"} className="story-link text-primary font-medium mt-2 inline-block">Back to team</Link>
      </div>
    );
  }

  const email = employee.email ?? "—";
  const department = employee.department ?? "—";

  const my = tasks.filter(t => t.assignee_id === employee.id);
  const total = my.length;
  const done  = my.filter(t => t.status === "completed").length;
  const pending = my.filter(t => t.status !== "completed").length;
  const overdue = my.filter(t => t.status === "overdue").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link to={isAdmin ? "/admin/employees" : "/me/team"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to team
      </Link>

      <div className="surface-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar name={employee.name} color={employee.avatar_color ?? undefined} size="xl" />
            <div>
              <h1 className="font-display text-2xl font-bold">{employee.name}</h1>
              <div className="text-muted-foreground">{employee.role}</div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {email}</span>
                <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {department}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Joined {employee.joined_at ? new Date(employee.joined_at).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Performance</div>
            <div className="font-display text-4xl font-bold gradient-text">{pct}%</div>
            <div className="text-xs text-muted-foreground">{done} of {total} tasks completed</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={CheckCircle2}  tone="success"     label="Completed" value={done} />
        <Stat icon={Clock}         tone="warning"     label="Pending"   value={pending} />
        <Stat icon={AlertTriangle} tone="destructive" label="Overdue"   value={overdue} />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Assigned tasks</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {my.map(t => <TaskCard key={t.id} task={t} showAssignee={false} canManage={isAdmin} />)}
          {my.length === 0 && <div className="surface-card p-8 text-center text-muted-foreground sm:col-span-2 xl:col-span-3">No tasks assigned.</div>}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: any) {
  const tones: Record<string, string> = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="surface-card hover-lift p-5 flex items-center gap-4">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
