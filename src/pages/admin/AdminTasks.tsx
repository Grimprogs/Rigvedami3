import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ListFilter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminTasks() {
  const { profile } = useApp();
  const { data: tasks = [] } = useTasks({ role: "admin" });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | any>("all");
  const [priority, setPriority] = useState<"all" | any>("all");

  const filtered = useMemo(() => tasks.filter(t =>
    (status === "all" || t.status === status) &&
    (priority === "all" || t.priority === priority) &&
    (q === "" || (t.title && t.title.toLowerCase().includes(q.toLowerCase())) || (t.description && t.description.toLowerCase().includes(q.toLowerCase())))
  ), [tasks, q, status, priority]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">All tasks</h1>
          <p className="text-muted-foreground">Filter, search, and manage every task in the workspace.</p>
        </div>
        <Button asChild className="bg-gradient-primary text-white shadow-glow hover:opacity-95">
          <Link to="/admin/tasks/new"><Plus className="h-4 w-4" /> Create task</Link>
        </Button>
      </div>

      <div className="surface-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tasks…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completion_requested">Completion Requested</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(t => <TaskCard key={t.id} task={t} canManage canApprove canComplete={t.assignee_id === profile?.id} />)}
        {filtered.length === 0 && (
          <div className="surface-card p-10 text-center text-muted-foreground sm:col-span-2 xl:col-span-3">
            No tasks match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
