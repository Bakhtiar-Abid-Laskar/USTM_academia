import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton for the subject documents page.
 * Matches the actual page layout: simple max-w-content container
 * with breadcrumb, heading, and stacked document card list.
 */
export default function SubjectLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb skeleton */}
          <nav className="text-sm text-slate-500 mb-6 font-medium flex items-center flex-wrap gap-2">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </nav>

          {/* Title + subtitle */}
          <div className="mb-8">
            <Skeleton className="h-8 w-56 rounded-lg mb-1" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>

          {/* Section: Syllabus */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={`s-${i}`}
                    className="border border-slate-200 rounded-xl bg-white shadow-sm p-4 animate-pulse"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-3/4 rounded mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Question Papers */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`q-${i}`}
                    className="border border-slate-200 rounded-xl bg-white shadow-sm p-4 animate-pulse"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-2/3 rounded mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-6 w-14 rounded-full" />
                          <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
