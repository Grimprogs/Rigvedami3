import { useApp } from "@/context/AppContext";
import { useTasks } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfiles";
import { TaskCard } from "@/components/TaskCard";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export default function EmployeeDashboard() {
  const { user } = useApp();
  const { data: me } = useProfile(user?.employeeId);
  const { data: my = [] } = useTasks({ role: "employee", userId: user?.employeeId });
  const total = my.length;
  const done = my.filter(t => t.status === "completed").length;
  const inprog = my.filter(t => t.status === "in_progress").length;
  const pending = my.filter(t => t.status === "pending").length;
  const overdue = my.filter(t => t.status === "overdue").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const upcoming = [...my]
    .filter(t => t.status !== "completed")
    .sort((a, b) => (a.due_date + a.due_time).localeCompare(b.due_date + b.due_time))
    .slice(0, 4);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  // Mini timeline: next 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: d.getDate(),
      isToday: i === 0,
      tasks: my.filter(t => t.due_date === key),
    };
  });

  return (
    <div className="space-y-6">
      <div className="surface-card relative overflow-hidden p-6 hero-bg">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold">{greeting}, {me?.name.split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground">You have {pending + inprog} active tasks and {overdue} overdue.</p>
          </div>
          <div className="min-w-[220px] rounded-2xl border bg-background/70 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="font-semibold tabular-nums">{pct}%</span>
            </div>
            <Progress value={pct} className="mt-2 h-2" />
            <div className="mt-1.5 text-xs text-muted-foreground">{done} of {total} tasks completed</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={ListTodo}      tone="primary"     label="Total tasks" value={total} />
        <Stat icon={CheckCircle2}  tone="success"     label="Completed"   value={done} />
        <Stat icon={Clock}         tone="warning"     label="Pending"     value={pending + inprog} />
        <Stat icon={AlertTriangle} tone="destructive" label="Overdue"     value={overdue} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Upcoming deadlines</h2>
            <Link to="/me/tasks" className="story-link text-sm text-primary font-medium">View all</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map(t => <TaskCard key={t.id} task={t} showAssignee={false} canComplete compact />)}
            {upcoming.length === 0 && <div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground sm:col-span-2">All caught up. 🎉</div>}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="font-display text-lg font-semibold mb-3">This week</h2>
          <ul className="space-y-2">
            {days.map(d => (
              <li key={d.key} className={`flex items-center justify-between rounded-xl border p-2.5 ${d.isToday ? "bg-accent/60 border-primary/30" : "bg-background"}`}>
                <div className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold ${d.isToday ? "bg-gradient-primary text-white" : "bg-muted"}`}>
                    <div className="leading-none">{d.day}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{d.label}{d.isToday ? " · Today" : ""}</div>
                    <div className="text-xs text-muted-foreground">{d.tasks.length} task{d.tasks.length === 1 ? "" : "s"}</div>
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {d.tasks.slice(0, 3).map(t => (
                    <span key={t.id} className={`h-2 w-2 rounded-full ring-2 ring-background ${
                      t.status === "completed" ? "bg-success" :
                      t.status === "overdue" ? "bg-destructive" :
                      t.status === "in_progress" ? "bg-info" : "bg-warning"}`} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: any) {
  const tones: Record<string, string> = {
    primary: "bg-gradient-primary text-white",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="surface-card hover-lift p-5 flex items-center gap-4 animate-fade-in">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
