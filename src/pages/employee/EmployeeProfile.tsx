import { useApp } from "@/context/AppContext";
import { useTasks } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfiles";
import { UserAvatar } from "@/components/UserAvatar";
import { TaskCard } from "@/components/TaskCard";
import { Mail, Building2, CalendarDays, CheckCircle2, Clock, AlertTriangle, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { downloadCSV, calculateTaskDuration } from "@/lib/csv-export";

export default function EmployeeProfile() {
  const { user } = useApp();
  const { data: me } = useProfile(user?.employeeId);
  const { data: my = [] } = useTasks({ role: "employee", userId: user?.employeeId });
  const total = my.length;
  const done = my.filter(t => t.status === "completed").length;
  const pending = my.filter(t => t.status !== "completed").length;
  const overdue = my.filter(t => t.status === "overdue").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (!me) {
    return (
      <div className="surface-card p-10 text-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const email = me.email ?? "—";
  const department = me.department ?? "—";

  return (
    <div className="space-y-6">
      <div className="surface-card overflow-hidden">
        <div className="h-28 bg-gradient-primary" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar name={me.name} color={me.avatar_color ?? undefined} size="xl" className="ring-4 ring-background" />
              <div>
                <h1 className="font-display text-2xl font-bold">{me.name}</h1>
                <div className="text-muted-foreground">{me.role}</div>
              </div>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4 min-w-[240px] sm:self-center flex flex-col justify-center">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Performance</span>
                  <span className="font-semibold tabular-nums gradient-text">{pct}%</span>
                </div>
                <Progress value={pct} className="mt-2 h-2" />
                <div className="mt-1.5 text-xs text-muted-foreground">{done} of {total} tasks completed</div>
              </div>
              {done > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full text-xs"
                  onClick={() => {
                    const rows = my.map(t => [
                      t.title,
                      t.priority,
                      t.status,
                      t.due_date,
                      t.started_at ? new Date(t.started_at).toLocaleString() : "—",
                      t.approved_at ? new Date(t.approved_at).toLocaleString() : "—",
                      calculateTaskDuration(t)
                    ]);
                    downloadCSV(`My_Performance_Report`, 
                      ["Task", "Priority", "Status", "Due Date", "Started At", "Completed At", "Time Taken"], 
                      rows
                    );
                  }}
                >
                  <Download className="mr-2 h-3.5 w-3.5" /> Download My Report
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
              <div className="mt-1 inline-flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {email}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Department</div>
              <div className="mt-1 inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {department}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Joined</div>
              <div className="mt-1 inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /> {me.joined_at ? new Date(me.joined_at).toLocaleDateString() : "—"}</div>
            </div>
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
          {my.map(t => <TaskCard key={t.id} task={t} showAssignee={false} canComplete />)}
          {my.length === 0 && <div className="surface-card p-8 text-center text-muted-foreground sm:col-span-2 xl:col-span-3">No tasks yet.</div>}
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
