import { Zap } from "lucide-react";

export const ScannerStatus = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-all hover:shadow-xl">
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2.5 ml-1">
          <Zap className="h-3.5 w-3.5 text-violet-500 fill-violet-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Scanner Ready
          </span>
        </div>
      </div>
    </div>
  );
};
