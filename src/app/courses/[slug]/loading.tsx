import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function CourseLoading() {
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
            <Skeleton className="h-10 w-80 rounded-lg bg-surface-subtle mb-3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded bg-surface-subtle" />
              <Skeleton className="h-6 w-32 rounded bg-surface-subtle" />
            </div>
          </div>
        </div>

        {/* Semesters Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <Skeleton className="h-7 w-48 rounded bg-surface-subtle" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-6 text-center space-y-3"
              >
                <Skeleton className="h-12 w-16 rounded mx-auto bg-surface-subtle" />
                <Skeleton className="h-4 w-24 rounded mx-auto bg-surface-subtle" />
                <Skeleton className="h-6 w-20 rounded mx-auto bg-surface-subtle" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
