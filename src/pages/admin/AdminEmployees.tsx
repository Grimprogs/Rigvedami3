import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProfiles, useCreateEmployee, useUpdateProfile, useDeleteEmployee, useDeleteMetadata } from "@/hooks/useProfiles";
import { useTasks } from "@/hooks/useTasks";
import { useRankings, useUpdateRankings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";
import { Search, Plus, Pencil, Trash2, Mail, Building2, Eye, Briefcase, Check, ChevronsUpDown, X, Filter, ListOrdered } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";

const empty = { name: "", username: "", password: "", email: "", jobTitle: "", department: "", role: "employee" };

function getRank(item: string | null | undefined, rankedList: string[]) {
  if (!item) return 9999;
  const idx = rankedList.findIndex(x => x.toLowerCase() === item.toLowerCase());
  return idx >= 0 ? idx : 9998;
}

/** Normalize a job title: trim + Title Case for deduplication display */
function normalize(s: string) {
  return s.trim().replace(/\b\w/g, c => c.toUpperCase());
}

/** 
 * Hierarchical Permission Check:
 * An admin can only manage someone who is BELOW them in the rankings.
 * Priority 1: Department Rank
 * Priority 2: Job Title Rank (within the same department)
 */
function canManage(currentAdmin: any, target: any, rankings: { departments: string[], jobTitles: string[] }) {
  if (!currentAdmin) return false;
  if (currentAdmin.id === target.id) return true; // Can manage yourself

  const adminDeptRank = getRank(currentAdmin.department, rankings.departments);
  const targetDeptRank = getRank(target.department, rankings.departments);
  
  if (adminDeptRank < targetDeptRank) return true;
  if (adminDeptRank > targetDeptRank) return false;
  
  // Same department rank, check job title rank
  const adminJobRank = getRank(currentAdmin.job_title, rankings.jobTitles);
  const targetJobRank = getRank(target.job_title, rankings.jobTitles);
  
  return adminJobRank < targetJobRank;
}

/** Robust Autocomplete that allows typing directly or picking existing items */
function TextAutocomplete({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  options: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full cursor-text" onClick={() => setOpen(true)}>
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!open) setOpen(true);
            }}
            placeholder="Search or type new..."
            className="w-full pr-8"
          />
          <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command>
          <CommandInput 
            placeholder="Search existing..." 
            value={value}
            onValueChange={onChange}
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="py-2 px-4 text-xs text-muted-foreground italic">
              No existing matches. Press Enter or click away to use "{value}"
            </CommandEmpty>
            <CommandGroup heading="Existing Keywords">
              {options.map((t) => (
                <CommandItem
                  key={t}
                  value={t}
                  onSelect={(v) => {
                    onChange(v);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === t.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {t}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function AdminEmployees() {
  const { user } = useApp();
  const isAdmin = user?.role === 'admin';
  const { data: employees = [] } = useProfiles();
  const { data: tasks = [] } = useTasks(isAdmin ? { role: "admin" } : undefined);
  const createEmployee = useCreateEmployee();
  const updateProfile = useUpdateProfile();
  const deleteEmployee = useDeleteEmployee();

  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(empty);

  // ── Job title filter dropdown (list) ─────────────────────────────────────
  const [openTitleFilter, setOpenTitleFilter] = useState(false);
  const [titleFilter, setTitleFilter] = useState<string | null>(null);

  // ── Department filter dropdown (list) ────────────────────────────────────
  const [openDeptFilter, setOpenDeptFilter] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string | null>(null);

  // Deduplicated, normalized, sorted job titles from DB
  const jobTitles = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const e of employees) {
      if (!e.job_title) continue;
      const norm = normalize(e.job_title);
      const key = norm.toLowerCase();
      if (!seen.has(key)) { seen.add(key); result.push(norm); }
    }
    return result.sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // Deduplicated, normalized, sorted departments from DB
  const departments = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const e of employees) {
      if (!e.department) continue;
      const norm = normalize(e.department);
      const key = norm.toLowerCase();
      if (!seen.has(key)) { seen.add(key); result.push(norm); }
    }
    return result.sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // ── Filter & Sort employees ───────────────────────────────────────────────
  const { data: rankings = { departments: [], jobTitles: [] } } = useRankings();
  const updateRankings = useUpdateRankings();
  const deleteMetadata = useDeleteMetadata();
  
  const [openRankings, setOpenRankings] = useState(false);
  const [rankingsForm, setRankingsForm] = useState<{ departments: string[], jobTitles: string[] }>({ departments: [], jobTitles: [] });

  const filteredAndSorted = useMemo(() => {
    const filtered = employees.filter(e => {
      const email = e.email ?? "";
      const dept = e.department ?? "";
      const title = e.job_title ?? "";
      const matchesSearch = [e.name, e.username, email, title, dept]
        .some(v => v.toLowerCase().includes(q.toLowerCase()));
      const matchesTitle = !titleFilter || normalize(title).toLowerCase() === titleFilter.toLowerCase();
      const matchesDept = !deptFilter || normalize(dept).toLowerCase() === deptFilter.toLowerCase();
      return matchesSearch && matchesTitle && matchesDept;
    });

    return filtered.sort((a, b) => {
      const deptA = getRank(a.department, rankings.departments);
      const deptB = getRank(b.department, rankings.departments);
      if (deptA !== deptB) return deptA - deptB;

      const jobA = getRank(a.job_title, rankings.jobTitles);
      const jobB = getRank(b.job_title, rankings.jobTitles);
      if (jobA !== jobB) return jobA - jobB;

      return a.name.localeCompare(b.name);
    });
  }, [employees, q, titleFilter, deptFilter, rankings]);

  const groupedByDept = useMemo(() => {
    const groups: { dept: string, emps: typeof filteredAndSorted }[] = [];
    for (const e of filteredAndSorted) {
      const d = e.department || "Other";
      let group = groups.find(g => g.dept === d);
      if (!group) {
        group = { dept: d, emps: [] };
        groups.push(group);
      }
      group.emps.push(e);
    }
    return groups;
  }, [filteredAndSorted]);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (e: any) => {
    setEditing(e);
    setForm({ name: e.name, username: e.username, password: "", email: e.email || "", jobTitle: e.job_title || "", department: e.department || "", role: e.role || "employee" });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username) { toast.error("Name and username are required."); return; }
    const normalizedJobTitle = form.jobTitle ? normalize(form.jobTitle) : null;
    if (editing) {
      // Detect if email or password changed (for auth sync)
      const emailChanged = form.email && form.email !== (editing.email || '');
      const passwordChanged = form.password && form.password.trim().length > 0;

      updateProfile.mutate({
        id: editing.id,
        patch: {
          name: form.name,
          username: form.username,
          email: form.email || null,
          role: form.role as any,
          job_title: normalizedJobTitle,
          department: form.department || null,
        },
        ...(emailChanged ? { newEmail: form.email } : {}),
        ...(passwordChanged ? { newPassword: form.password } : {}),
      }, {
        onSuccess: () => toast.success("Employee updated" + (emailChanged || passwordChanged ? " (auth credentials synced)" : "")),
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
      });
    } else {
      if (!form.email.trim() || !form.password.trim()) {
        toast.error("Email and password are required to create an employee.");
        return;
      }
      createEmployee.mutate({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        department: form.department || undefined,
        job_title: normalizedJobTitle || undefined,
        role: form.role,
      }, {
        onSuccess: () => toast.success("User added"),
        onError: (err: any) => toast.error(err?.message ?? "Create failed"),
      });
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{isAdmin ? "Employees" : "Team Directory"}</h1>
          <p className="text-muted-foreground">{isAdmin ? "Manage your team, credentials, and roles." : "Find and connect with your colleagues."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Text search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users" className="pl-9 w-52" value={q} onChange={e => setQ(e.target.value)} />
          </div>

          {/* Job title filter */}
          <Popover open={openTitleFilter} onOpenChange={setOpenTitleFilter}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-between font-normal gap-2 min-w-[160px]", titleFilter && "border-primary/60 bg-primary/5")}>
                <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left truncate">{titleFilter ?? "All job titles"}</span>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56" align="start">
              <Command>
                <CommandInput placeholder="Filter by title..." />
                <CommandList>
                  <CommandEmpty>No titles found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__all__"
                      onSelect={() => { setTitleFilter(null); setOpenTitleFilter(false); }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", !titleFilter ? "opacity-100" : "opacity-0")} />
                      All job titles
                    </CommandItem>
                    {jobTitles.map(t => (
                      <CommandItem
                        key={t}
                        value={t}
                        onSelect={() => { setTitleFilter(t); setOpenTitleFilter(false); }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", titleFilter?.toLowerCase() === t.toLowerCase() ? "opacity-100" : "opacity-0")} />
                        {t}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Department filter */}
          <Popover open={openDeptFilter} onOpenChange={setOpenDeptFilter}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-between font-normal gap-2 min-w-[160px]", deptFilter && "border-primary/60 bg-primary/5")}>
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left truncate">{deptFilter ?? "All departments"}</span>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56" align="start">
              <Command>
                <CommandInput placeholder="Filter by department..." />
                <CommandList>
                  <CommandEmpty>No departments found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__all_depts__"
                      onSelect={() => { setDeptFilter(null); setOpenDeptFilter(false); }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", !deptFilter ? "opacity-100" : "opacity-0")} />
                      All departments
                    </CommandItem>
                    {departments.map(d => (
                      <CommandItem
                        key={d}
                        value={d}
                        onSelect={() => { setDeptFilter(d); setOpenDeptFilter(false); }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", deptFilter?.toLowerCase() === d.toLowerCase() ? "opacity-100" : "opacity-0")} />
                        {d}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Clear filter chips */}
          {titleFilter && (
            <button
              onClick={() => setTitleFilter(null)}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              {titleFilter} <X className="h-3 w-3" />
            </button>
          )}
          {deptFilter && (
            <button
              onClick={() => setDeptFilter(null)}
              className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-500/20 transition-colors"
            >
              {deptFilter} <X className="h-3 w-3" />
            </button>
          )}

          {/* Grid / Table toggle */}
          <div className="hidden md:flex rounded-lg border p-0.5 bg-muted/40">
            <button onClick={() => setView("grid")}  className={`px-2.5 py-1 text-xs rounded-md ${view==="grid"?"bg-background shadow-soft":"text-muted-foreground"}`}>Grid</button>
            <button onClick={() => setView("table")} className={`px-2.5 py-1 text-xs rounded-md ${view==="table"?"bg-background shadow-soft":"text-muted-foreground"}`}>Table</button>
          </div>

          {/* Ranking Settings (Admin Only) */}
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => {
                setRankingsForm({
                  departments: [...rankings.departments],
                  jobTitles: [...rankings.jobTitles]
                });
                setOpenRankings(true);
              }}
            >
              <ListOrdered className="h-4 w-4 mr-2" /> Rank Display
            </Button>
          )}

          {/* Add user dialog (Admin only) */}
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={startCreate} className="bg-gradient-primary text-white shadow-glow hover:opacity-95">
                  <Plus className="h-4 w-4" /> Add user
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit user" : "Add new user"}</DialogTitle>
                  <DialogDescription>{editing ? "Update profile and credentials." : "Create a new account with credentials they'll use to sign in."}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>Full name</Label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Username</Label>
                    <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="jane" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" required={!editing} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@ztasks.io" required={!editing} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <select
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* ── Job title creatable combobox ─────────────────────────── */}
                  <div className="space-y-1.5 flex flex-col">
                    <Label>Job title</Label>
                    <TextAutocomplete 
                      value={form.jobTitle} 
                      onChange={v => setForm({ ...form, jobTitle: v })} 
                      options={jobTitles} 
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <Label>Department</Label>
                    <TextAutocomplete 
                      value={form.department} 
                      onChange={v => setForm({ ...form, department: v })} 
                      options={departments} 
                    />
                  </div>

                  <DialogFooter className="sm:col-span-2 mt-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-primary text-white">{editing ? "Save changes" : "Add user"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Dialog open={openRankings} onOpenChange={setOpenRankings}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Display Ranking</DialogTitle>
            <DialogDescription>
              Define the exact priority order for departments and job titles. 
              Items at the top of the list will be ranked higher.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Department Priority</Label>
              <RankListBuilder 
                items={rankingsForm.departments}
                available={departments}
                onChange={v => setRankingsForm({ ...rankingsForm, departments: v })}
                onDeleteGlobal={v => deleteMetadata.mutate({ type: 'department', value: v }, {
                  onSuccess: () => {
                    toast.success(`Department "${v}" deleted globally`);
                    setRankingsForm(prev => ({ ...prev, departments: prev.departments.filter(x => x !== v) }));
                  },
                  onError: (err: any) => toast.error(err.message || "Failed to delete department")
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Job Title Priority</Label>
              <RankListBuilder 
                items={rankingsForm.jobTitles}
                available={jobTitles}
                onChange={v => setRankingsForm({ ...rankingsForm, jobTitles: v })}
                onDeleteGlobal={v => deleteMetadata.mutate({ type: 'job_title', value: v }, {
                  onSuccess: () => {
                    toast.success(`Job Title "${v}" deleted globally`);
                    setRankingsForm(prev => ({ ...prev, jobTitles: prev.jobTitles.filter(x => x !== v) }));
                  },
                  onError: (err: any) => toast.error(err.message || "Failed to delete job title")
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRankings(false)}>Cancel</Button>
            <Button onClick={() => {
              updateRankings.mutate(rankingsForm, {
                onSuccess: () => {
                  setOpenRankings(false);
                  toast.success("Global ranking preferences saved!");
                }
              });
            }} className="bg-gradient-primary text-white" disabled={updateRankings.isPending}>
              {updateRankings.isPending ? "Saving..." : "Save Rankings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active filter summary */}
      {titleFilter && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          Showing <span className="font-medium text-foreground">{filteredAndSorted.length}</span> employee{filteredAndSorted.length !== 1 ? "s" : ""} with job title <span className="font-medium text-foreground">"{titleFilter}"</span>
        </div>
      )}

      {view === "grid" ? (
        <div className="space-y-10">
          {groupedByDept.map(({ dept, emps }) => (
            <div key={dept} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2 border-b pb-2">
                <Building2 className="h-6 w-6 text-primary" /> {dept}
                <span className="ml-2 text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{emps.length}</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {emps.map(e => {
                  const total = tasks.filter(t => t.assignee_id === e.id).length;
                  const done = tasks.filter(t => t.assignee_id === e.id && t.status === "completed").length;
                  const pct = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={e.id} className="surface-card hover-lift p-5">
                      <div className="flex items-start justify-between">
                        <UserAvatar name={e.name} color={e.avatar_color ?? undefined} size="lg" />
                        <div className="flex gap-1">
                          {isAdmin && (
                            <Button asChild size="icon" variant="ghost" className="h-8 w-8" aria-label="View">
                              <Link to={`/admin/employees/${e.id}`}><Eye className="h-4 w-4" /></Link>
                            </Button>
                          )}
                          {isAdmin && canManage(user, e, rankings) && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(e)} aria-label="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <DeleteEmpButton onConfirm={() => { deleteEmployee.mutate(e.id); toast.success("Employee deleted"); }} name={e.name} />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        {isAdmin ? (
                          <Link to={`/admin/employees/${e.id}`} className="font-display text-lg font-semibold leading-tight hover:underline">{e.name}</Link>
                        ) : (
                          <span className="font-display text-lg font-semibold leading-tight">{e.name}</span>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {e.job_title ?? (isAdmin ? "Employee" : "")}
                          {isAdmin && ` • ${e.role === 'admin' ? 'Admin' : 'Employee'}`}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {e.email || "—"}</div>
                        <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {e.department || "—"}</div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Completion</span>
                          <span className="font-semibold tabular-nums">{pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">{done}/{total} tasks completed</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredAndSorted.length === 0 && (
            <div className="surface-card p-10 text-center text-muted-foreground sm:col-span-2 lg:col-span-3 xl:col-span-4">
              No employees match the current filters.
            </div>
          )}
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Job Title</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Tasks</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map(e => {
                  const total = tasks.filter(t => t.assignee_id === e.id).length;
                  const done  = tasks.filter(t => t.assignee_id === e.id && t.status === "completed").length;
                  return (
                    <tr key={e.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={e.name} color={e.avatar_color ?? undefined} size="sm" />
                          <div>
                            {isAdmin ? (
                              <Link to={`/admin/employees/${e.id}`} className="font-medium hover:underline">{e.name}</Link>
                            ) : (
                              <span className="font-medium">{e.name}</span>
                            )}
                            {isAdmin && <div className="text-xs text-muted-foreground">{e.role === 'admin' ? 'Admin' : 'Employee'}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{e.username}</td>
                      <td className="px-4 py-3">{e.job_title ?? "—"}</td>
                      <td className="px-4 py-3">{e.department ?? "—"}</td>
                      <td className="px-4 py-3">{done}/{total}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button asChild size="icon" variant="ghost" className="h-8 w-8"><Link to={`/admin/employees/${e.id}`}><Eye className="h-4 w-4" /></Link></Button>
                            {canManage(user, e, rankings) && (
                              <>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></Button>
                                <DeleteEmpButton onConfirm={() => { deleteEmployee.mutate(e.id); toast.success("Employee deleted"); }} name={e.name} />
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filteredAndSorted.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No employees match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DeleteEmpButton({ onConfirm, name }: { onConfirm: () => void; name: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>This will remove the employee and unassign all their tasks.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Employee
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SortableItem({ 
  id, 
  item, 
  onRemove, 
  onDeleteGlobal 
}: { 
  id: string, 
  item: string, 
  onRemove: () => void, 
  onDeleteGlobal?: (item: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-2.5 shadow-sm transition-shadow",
        isDragging && "shadow-lg ring-1 ring-primary/20 opacity-80"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{item}</span>
      <div className="flex items-center gap-1">
        <button 
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Remove from priority list"
        >
          <X className="h-4 w-4" />
        </button>
        {onDeleteGlobal && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                type="button"
                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                title="Delete keyword globally"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{item}" globally?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove this keyword from EVERY employee profile that currently has it. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDeleteGlobal(item)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Everywhere
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

function RankListBuilder({ 
  items, 
  available, 
  onChange,
  onDeleteGlobal
}: { 
  items: string[], 
  available: string[], 
  onChange: (items: string[]) => void;
  onDeleteGlobal?: (item: string) => void;
}) {
  const unranked = available.filter(a => !items.includes(a));
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority Order</Label>
          <span className="text-[10px] text-muted-foreground italic">Drag to change rankings</span>
        </div>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem 
                  key={item} 
                  id={item} 
                  item={item} 
                  onRemove={() => onChange(items.filter(x => x !== item))}
                  onDeleteGlobal={onDeleteGlobal}
                />
              ))}
              {items.length === 0 && (
                <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg bg-muted/20 text-center">
                  No priority set. Defaults to alphabetical.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available (Unranked)</Label>
        <div className="flex flex-wrap gap-2">
          {unranked.map(u => (
            <button
              key={u}
              type="button"
              onClick={() => onChange([...items, u])}
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Plus className="h-3 w-3" /> {u}
            </button>
          ))}
          {unranked.length === 0 && <div className="text-xs text-muted-foreground">All items are ranked.</div>}
        </div>
      </div>
    </div>
  );
}
