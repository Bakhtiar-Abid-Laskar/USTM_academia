import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function CoursesLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Header Skeleton */}
        <div className="bg-surface border-b border-border py-12 academic-grain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-3 w-16 rounded bg-surface-subtle" />
              <span className="text-border">/</span>
              <Skeleton className="h-3 w-28 rounded bg-surface-subtle" />
            </div>
            <Skeleton className="h-10 w-64 rounded-lg bg-surface-subtle mb-3" />
            <Skeleton className="h-4 w-96 rounded bg-surface-subtle" />
          </div>
        </div>

        {/* Courses Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-20 rounded bg-surface-subtle" />
                  <Skeleton className="h-5 w-16 rounded bg-surface-subtle" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded bg-surface-subtle" />
                <Skeleton className="h-4 w-1/2 rounded bg-surface-subtle" />
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Skeleton className="h-6 w-24 rounded bg-surface-subtle" />
                  <Skeleton className="h-6 w-20 rounded bg-surface-subtle" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
