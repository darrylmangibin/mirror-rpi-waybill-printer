import { Skeleton } from "@/components/ui/skeleton";

export const LoadingState = () => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-3 h-9 w-64" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-4 h-48 rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
