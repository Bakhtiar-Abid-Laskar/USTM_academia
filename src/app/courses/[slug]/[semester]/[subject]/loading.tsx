import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function SubjectLoading() {
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
              <Skeleton className="h-4 w-16 rounded" />
              <span>›</span>
              <Skeleton className="h-4 w-24 rounded" />
            </nav>

            <Skeleton className="h-10 w-1/3 rounded-lg mb-4" />
            <Skeleton className="h-6 w-1/4 rounded-md" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Tabs skeleton */}
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          
          <Skeleton className="h-8 w-48 rounded-lg mb-6" />

          {/* Documents grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
