import { cn } from "@/lib/utils"

function ShimmerSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shimmer-skeleton"
      className={cn(
        "rounded-md overflow-hidden",
        "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200",
        "bg-[length:200%_100%]",
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
