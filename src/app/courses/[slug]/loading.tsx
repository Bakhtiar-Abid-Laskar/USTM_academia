import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function CourseLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Minimal Hero Header Skeleton */}
        <div className="bg-white border-b border-slate-200 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            {/* Breadcrumb skeleton */}
            <nav className="text-sm text-slate-500 mb-4 flex flex-wrap gap-2 items-center">
              <Skeleton className="h-4 w-12 rounded" />
              <span>›</span>
              <Skeleton className="h-4 w-16 rounded" />
              <span>›</span>
              <Skeleton className="h-4 w-20 rounded" />
            </nav>

            <Skeleton className="h-10 w-1/3 rounded-lg mb-4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            
            <Skeleton className="h-4 w-2/3 mt-6 rounded" />
            <Skeleton className="h-4 w-1/2 mt-2 rounded" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Skeleton className="h-8 w-48 rounded-lg mb-8" />

          {/* Semesters grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm"
              >
                <Skeleton className="h-12 w-16 rounded mx-auto mb-2" />
                <Skeleton className="h-4 w-20 rounded mx-auto mb-4" />
                <Skeleton className="h-6 w-24 rounded-lg mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
