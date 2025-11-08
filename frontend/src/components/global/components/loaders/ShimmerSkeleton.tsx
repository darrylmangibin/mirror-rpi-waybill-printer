import { cn } from "@/lib/utils"

function ShimmerSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shimmer-skeleton"
      className={cn(
        "rounded-md overflow-hidden",
        "bg-linear-to-r from-gray-200 via-gray-100 to-gray-200",
        "bg-size-[200%_100%]",
        "animate-shimmer",
        className
      )}
      style={{
        animation: "shimmer 15s linear infinite",
      }}
      {...props}
    />
  )
}

export { ShimmerSkeleton }
