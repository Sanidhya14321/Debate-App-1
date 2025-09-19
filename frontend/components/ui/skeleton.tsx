import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10 backdrop-blur-sm", className)}
      {...props}
    />
  )
}

export { Skeleton }