import { Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScannerStatus = ({ isLoading }: { isLoading?: boolean }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full border px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-300",
          isLoading
            ? "border-violet-200 bg-violet-50/90 shadow-violet-100"
            : "border-slate-200 bg-white/90 hover:shadow-xl",
        )}
      >
        <div className="relative flex h-2 w-2">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
          ) : (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 border-l pl-2.5 ml-1 transition-colors duration-300",
            isLoading ? "border-violet-200" : "border-slate-100",
          )}
        >
          <Zap
            className={cn(
              "h-3.5 w-3.5 transition-colors duration-300",
              isLoading
                ? "fill-violet-600 text-violet-600"
                : "fill-violet-500 text-violet-500",
            )}
          />
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-wider transition-colors duration-300",
              isLoading ? "text-violet-700" : "text-slate-600",
            )}
          >
            {isLoading ? "Processing..." : "Scanner Ready"}
          </span>
        </div>
      </div>
    </div>
  );
};
