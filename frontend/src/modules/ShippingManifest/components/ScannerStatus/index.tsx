import { Loader2, Zap, ZapOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScannerStatusProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

export const ScannerStatus = ({ isLoading, isDisabled, onClick }: ScannerStatusProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="group outline-none"
    >
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full border px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-300",
          isLoading && "border-violet-200 bg-violet-50/90 shadow-violet-100",
          isDisabled && !isLoading && "border-slate-200 bg-slate-50/90 opacity-80 grayscale-[0.5]",
          !isLoading && !isDisabled && "border-emerald-200 bg-emerald-50/90 shadow-emerald-100/50 hover:shadow-xl hover:scale-105 active:scale-95",
        )}
      >
        <div className="relative flex h-2 w-2 items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
          ) : isDisabled ? (
            <div className="h-2 w-2 rounded-full bg-slate-300" />
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
            isLoading ? "border-violet-200" : isDisabled ? "border-slate-200" : "border-emerald-200",
          )}
        >
          {isDisabled && !isLoading ? (
            <ZapOff className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <Zap
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-300",
                isLoading
                  ? "fill-violet-600 text-violet-600"
                  : "fill-emerald-600 text-emerald-600",
              )}
            />
          )}
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-wider transition-colors duration-300",
              isLoading ? "text-violet-700" : isDisabled ? "text-slate-500" : "text-emerald-700",
            )}
          >
            {isLoading ? "Processing..." : isDisabled ? "Offline" : "Online"}
          </span>
        </div>
      </div>
    </button>
  );
};
