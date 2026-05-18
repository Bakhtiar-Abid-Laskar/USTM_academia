import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

/** Card skeleton for loading states */
function SkeletonCard() {
  return (
    <div className="space-y-3 p-4 border border-border rounded-lg">
      <div className="skeleton-shimmer h-40 rounded-md" />
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton-shimmer h-6 w-20 rounded" />
        <div className="skeleton-shimmer h-6 w-24 rounded" />
      </div>
    </div>
  );
}

/** Text skeleton for paragraphs */
function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn(
          "skeleton-shimmer h-4 rounded",
          i === lines - 1 ? "w-2/3" : "w-full"
        )} />
      ))}
    </div>
  );
}

/** Avatar skeleton */
function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };
  
  return (
    <div className={cn(
      "skeleton-shimmer rounded-full",
      sizeClasses[size]
    )} />
  );
}

/** Grid skeleton for lists */
function SkeletonGrid({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };
  
  return (
    <div className={cn("grid gap-4", colClasses[cols as keyof typeof colClasses] || "grid-cols-3")}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonGrid };
