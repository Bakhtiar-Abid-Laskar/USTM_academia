import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton specifically for the search page.
 * Prevents the root loading.tsx (home page skeleton) from showing
 * when navigating to /search, which caused a jittery flash.
 */
export default function SearchLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 w-full relative">
        {/* Search Hero skeleton - matches GlobalSearch hero */}
        <section className="bg-[#0f172a] pt-20 pb-36 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-[#0f172a] z-0" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <Skeleton className="h-14 w-3/4 rounded-lg mx-auto mb-6 bg-white/10" />
            <Skeleton className="h-6 w-1/2 rounded-md mx-auto mb-10 bg-white/10" />
          </div>
          {/* Search bar skeleton */}
          <div className="w-full -mt-0 z-20 relative max-w-4xl mx-auto px-4">
            <Skeleton className="h-16 w-full rounded-2xl bg-white/10" />
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full bg-white/10" />
              ))}
            </div>
          </div>
        </section>

        {/* Filters skeleton */}
        <div className="w-full max-w-7xl mx-auto px-4 mt-12">
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-slate-200">
            <Skeleton className="h-5 w-16 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-lg" />
            ))}
          </div>

          {/* Results skeleton */}
          <Skeleton className="h-5 w-40 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-56 flex flex-col justify-between animate-pulse">
                <div>
                  <Skeleton className="h-6 w-3/4 rounded-md mb-5" />
                  <Skeleton className="h-4 w-1/2 rounded-md mb-3" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-50 mt-4">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
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
