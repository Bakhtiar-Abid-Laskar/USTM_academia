import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Modern Academic Hero Skeleton */}
        <section className="bg-surface border-b border-border py-12 sm:py-16 academic-grain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <Skeleton className="h-6 w-48 rounded-full bg-surface-subtle" />
                <Skeleton className="h-12 w-full max-w-lg rounded-lg bg-surface-subtle" />
                <Skeleton className="h-6 w-3/4 rounded-md bg-surface-subtle" />
                <div className="pt-2">
                  <Skeleton className="h-12 w-full rounded-xl bg-surface-subtle" />
                </div>
              </div>
              <div className="lg:col-span-5 hidden lg:block">
                <div className="bg-paper rounded-xl border border-border p-6 space-y-4">
                  <Skeleton className="h-4 w-32 rounded bg-surface-subtle" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-14 rounded-lg bg-surface-subtle" />
                    <Skeleton className="h-14 rounded-lg bg-surface-subtle" />
                    <Skeleton className="h-14 rounded-lg bg-surface-subtle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Program Grid Skeleton */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded bg-surface-subtle" />
              <Skeleton className="h-7 w-56 rounded bg-surface-subtle" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg bg-surface-subtle" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-20 rounded bg-surface-subtle" />
                  <Skeleton className="h-5 w-16 rounded bg-surface-subtle" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded bg-surface-subtle" />
                <Skeleton className="h-4 w-1/2 rounded bg-surface-subtle" />
                <div className="pt-3 border-t border-border flex justify-between">
                  <Skeleton className="h-4 w-24 rounded bg-surface-subtle" />
                  <Skeleton className="h-4 w-16 rounded bg-surface-subtle" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
