import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function SubjectLoading() {
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
            <Skeleton className="h-3 w-24 rounded bg-surface-subtle" />
            <span className="text-border">/</span>
            <Skeleton className="h-3 w-32 rounded bg-surface-subtle" />
          </div>

          {/* Title + subtitle */}
          <div className="mb-10 pb-4 border-b border-border">
            <Skeleton className="h-10 w-80 rounded-lg bg-surface-subtle mb-2" />
            <Skeleton className="h-4 w-64 rounded bg-surface-subtle" />
          </div>

          {/* Section: Syllabus */}
          <div className="space-y-10">
            <div>
              <Skeleton className="h-6 w-32 rounded bg-surface-subtle mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={`s-${i}`}
                    className="border border-border rounded-xl bg-surface p-5 flex items-center justify-between"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/2 rounded bg-surface-subtle" />
                      <Skeleton className="h-4 w-1/4 rounded bg-surface-subtle" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-lg bg-surface-subtle" />
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Question Papers */}
            <div>
              <Skeleton className="h-6 w-48 rounded bg-surface-subtle mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`q-${i}`}
                    className="border border-border rounded-xl bg-surface p-5 flex items-center justify-between"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-2/3 rounded bg-surface-subtle" />
                      <Skeleton className="h-4 w-1/3 rounded bg-surface-subtle" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-lg bg-surface-subtle" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
