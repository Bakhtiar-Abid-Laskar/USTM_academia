import { SkeletonCard } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton for semester subjects page
 * Shows while the page is generating or streaming data
 */
export default function SemesterLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb skeleton */}
          <nav className="text-sm text-text-muted mb-6 flex flex-wrap gap-2">
            <div className="skeleton-shimmer h-4 w-12 rounded" />
            <span>›</span>
            <div className="skeleton-shimmer h-4 w-16 rounded" />
            <span>›</span>
            <div className="skeleton-shimmer h-4 w-20 rounded" />
            <span>›</span>
            <div className="skeleton-shimmer h-4 w-24 rounded" />
          </nav>

          {/* Title skeleton */}
          <div className="mb-8">
            <div className="skeleton-shimmer h-8 w-1/4 rounded mb-3" />
            <div className="skeleton-shimmer h-4 w-1/3 rounded" />
          </div>

          {/* Subjects grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
