import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton for course detail page
 * Shows while the page is generating or streaming data
 */
export default function CourseLoading() {
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
          </nav>

          {/* Title skeleton */}
          <div className="mb-8">
            <div className="skeleton-shimmer h-8 w-1/3 rounded mb-3" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded" />
          </div>

          {/* Section title skeleton */}
          <div className="mb-6">
            <div className="skeleton-shimmer h-6 w-48 rounded" />
          </div>

          {/* Semesters grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-5 space-y-3"
              >
                {/* Semester number skeleton */}
                <div className="skeleton-shimmer h-12 w-16 rounded mx-auto" />
                {/* Label skeleton */}
                <div className="skeleton-shimmer h-4 w-20 rounded mx-auto" />
                {/* Count skeleton */}
                <div className="skeleton-shimmer h-3 w-24 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
