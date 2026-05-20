import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton for home page
 * Shows while the page is generating or streaming data
 */
export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 w-full relative">
        {/* Premium Hero skeleton */}
        <section className="bg-[#0f172a] pt-24 pb-32 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-[#0f172a] z-0" />
          <div className="max-w-4xl mx-auto relative z-10">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-8 bg-white/10" />
            <Skeleton className="h-16 w-3/4 rounded-lg mx-auto mb-6 bg-white/10" />
            <Skeleton className="h-6 w-1/2 rounded-md mx-auto mb-10 bg-white/10" />
            <Skeleton className="h-16 w-full max-w-2xl rounded-2xl mx-auto bg-white/10" />
          </div>
        </section>

        {/* Browse courses section skeleton */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 -mt-10 relative z-20">
          <div className="flex items-center justify-between mb-8 bg-white/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>

        {/* Recently added section skeleton */}
        <section className="bg-white border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Skeleton className="h-8 w-48 rounded-lg mb-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
