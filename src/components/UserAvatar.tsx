import { cn } from "@/lib/utils";
import { initials } from "@/lib/task-utils";

interface Props {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function UserAvatar({ name, color = "from-indigo-500 to-violet-500", size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full font-semibold text-white shadow-soft bg-gradient-to-br ring-2 ring-background",
        color,
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
