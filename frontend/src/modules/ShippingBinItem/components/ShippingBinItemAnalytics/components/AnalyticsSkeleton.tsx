import { Skeleton } from "@/components/ui/skeleton";

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-36 rounded-lg" />
      ))}
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-80 rounded-lg" />
      ))}
    </div>
  </div>
);
