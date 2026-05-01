import type { Task, TaskStatus, TaskPriority } from "@/integrations/supabase/types";

export function statusMeta(status: TaskStatus) {
  switch (status) {
    case "completed":             return { label: "Completed",            cls: "bg-success/15 text-success border-success/30" };
    case "in_progress":           return { label: "In Progress",          cls: "bg-info/15 text-info border-info/30" };
    case "completion_requested":  return { label: "Completion Requested", cls: "bg-primary/15 text-primary border-primary/30" };
    case "pending":               return { label: "Pending",              cls: "bg-warning/15 text-warning border-warning/30" };
    case "overdue":               return { label: "Overdue",              cls: "bg-destructive/15 text-destructive border-destructive/40" };
  }
}

export function priorityMeta(p: TaskPriority) {
  switch (p) {
    case "urgent": return { label: "Urgent", cls: "bg-destructive/15 text-destructive border-destructive/30" };
    case "high":   return { label: "High",   cls: "bg-warning/15 text-warning border-warning/30" };
    case "medium": return { label: "Medium", cls: "bg-info/15 text-info border-info/30" };
    case "low":    return { label: "Low",    cls: "bg-muted text-muted-foreground border-border" };
  }
}

export function formatDue(t: Task) {
  return new Date(`${t.due_date}T${t.due_time}:00`);
}

export function timeRemaining(t: Task) {
  const due = formatDue(t);
  const now = new Date();
  const ms = due.getTime() - now.getTime();
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  const sign = ms < 0 ? "overdue by" : "in";
  if (days >= 1) return `${sign} ${days}d ${hours}h`;
  if (hours >= 1) return `${sign} ${hours}h ${mins}m`;
  return `${sign} ${mins}m`;
}

export function initials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}
