import { SkeletonCard } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

/**
 * Loading skeleton for home page
 * Shows while the page is generating or streaming data
 */
export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero skeleton */}
        <section className="bg-primary text-white">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
            <div className="skeleton-shimmer h-20 w-20 rounded-full mx-auto mb-4" />
            <div className="skeleton-shimmer h-10 w-2/3 rounded mx-auto mb-3" />
            <div className="skeleton-shimmer h-6 w-3/4 rounded mx-auto mb-8" />
            <div className="skeleton-shimmer h-12 w-48 rounded mx-auto" />
          </div>
        </section>

        {/* Browse courses section skeleton */}
        <section className="py-12 sm:py-16">
          <div className="max-w-content mx-auto px-4 sm:px-6">
            <div className="skeleton-shimmer h-8 w-1/4 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Recently added section skeleton */}
        <section className="bg-white border-t border-border">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <div className="skeleton-shimmer h-8 w-1/4 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[250px]">
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
