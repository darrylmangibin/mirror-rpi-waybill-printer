import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingOverlayProps = React.ComponentProps<"div"> & {
  message?: string;
  spinnerClassName?: string;
  contentClassName?: string;
  textClassName?: string;
};

function LoadingOverlay({
  message = "Loading...",
  className,
  spinnerClassName,
  contentClassName,
  textClassName,
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      data-slot="loading-overlay"
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center bg-white/40",
        className,
      )}
      {...props}
    >
      <div className={cn("flex flex-col items-center gap-2", contentClassName)}>
        <Loader2
          className={cn("h-8 w-8 animate-spin text-violet-600", spinnerClassName)}
        />
        <p
          className={cn(
            "text-sm font-medium tracking-tight text-slate-600",
            textClassName,
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export { LoadingOverlay };
