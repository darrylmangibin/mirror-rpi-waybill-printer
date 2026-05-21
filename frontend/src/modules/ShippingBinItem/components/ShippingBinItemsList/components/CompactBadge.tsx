import { cn } from "@/lib/utils";
import type { BadgeConfig } from "../types";

export const CompactBadge = ({
  label,
  config,
}: {
  label: string;
  config: BadgeConfig;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
      config.bg,
      config.text,
      config.border,
    )}
  >
    <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
    {label}
  </span>
);
