import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function CoursesLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Minimal Hero Header Skeleton — matches courses/page.tsx layout */}
        <div className="bg-white border-b border-slate-200 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            {/* Breadcrumb skeleton */}
            <nav className="text-sm text-slate-500 mb-4 font-medium flex flex-wrap gap-2 items-center">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </nav>

            {/* Title with icon */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-10 w-48 rounded-lg" />
            </div>

            {/* Description */}
            <Skeleton className="h-5 w-2/3 mt-3 rounded-md" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse"
              >
                <Skeleton className="h-6 w-1/2 rounded-md mb-2" />
                <Skeleton className="h-4 w-3/4 rounded mb-4" />
                <Skeleton className="h-4 w-full rounded mb-6" />
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-40 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </div>
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
