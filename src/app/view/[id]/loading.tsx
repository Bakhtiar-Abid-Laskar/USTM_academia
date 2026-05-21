import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton for the document view page.
 * Prevents the root loading.tsx (home page skeleton) from showing
 * when navigating to /view/[id] from search results.
 */
export default function ViewLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        {/* Info Bar skeleton */}
        <div className="bg-white border-b border-border">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Skeleton className="h-8 w-20 rounded-md" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-2/3 rounded-md" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* PDF viewer skeleton */}
        <div className="flex-1 bg-gray-100">
          <div className="max-w-5xl mx-auto px-0 sm:px-4 py-0 sm:py-4">
            <Skeleton
              className="w-full sm:rounded-lg"
              style={{ height: "calc(100vh - 200px)" }}
            />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
