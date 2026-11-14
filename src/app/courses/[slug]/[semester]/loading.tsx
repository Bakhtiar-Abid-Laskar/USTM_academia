import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function SemesterLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-3 w-16 rounded bg-surface-subtle" />
            <span className="text-border">/</span>
            <Skeleton className="h-3 w-20 rounded bg-surface-subtle" />
            <span className="text-border">/</span>
            <Skeleton className="h-3 w-28 rounded bg-surface-subtle" />
          </div>

          {/* Title + subtitle */}
          <div className="mb-10 pb-4 border-b border-border">
            <Skeleton className="h-10 w-64 rounded-lg bg-surface-subtle mb-2" />
            <Skeleton className="h-4 w-80 rounded bg-surface-subtle" />
          </div>

          {/* Subject cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-border rounded-xl bg-surface p-6 space-y-4"
              >
                <Skeleton className="h-6 w-3/4 rounded bg-surface-subtle" />
                <Skeleton className="h-4 w-1/3 rounded bg-surface-subtle" />
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Skeleton className="h-6 w-20 rounded bg-surface-subtle" />
                  <Skeleton className="h-6 w-24 rounded bg-surface-subtle" />
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
