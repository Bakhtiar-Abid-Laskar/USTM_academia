import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton for the semester subjects page.
 * Matches the actual page layout: simple max-w-content container
 * with breadcrumb, heading, and subject card grid.
 */
export default function SemesterLoading() {
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
          </nav>

          {/* Title + subtitle */}
          <div className="mb-8">
            <Skeleton className="h-8 w-48 rounded-lg mb-1" />
            <Skeleton className="h-5 w-64 rounded-md" />
          </div>

          {/* Subject cards grid — matches grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-xl bg-white shadow-sm p-5 animate-pulse"
              >
                <Skeleton className="h-5 w-3/4 rounded mb-1" />
                <Skeleton className="h-3 w-24 rounded mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
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
