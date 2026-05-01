import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { UserAvatar } from "./UserAvatar";
import { NotificationsPanel } from "./NotificationsPanel";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, profile, logout, theme, toggleTheme, unreadCount } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 sm:px-6 backdrop-blur-xl">
      <Button variant="ghost" size="icon" onClick={onMenu} className="md:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks, people, projects…" className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground ring-2 ring-background animate-scale-in">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0">
            <NotificationsPanel onItemClick={() => setOpen(false)} />
          </PopoverContent>
        </Popover>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-muted transition-colors">
                <UserAvatar name={user.name} size="sm" color="from-indigo-500 to-violet-500" />
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium leading-none">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{profile?.job_title ?? ""}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
