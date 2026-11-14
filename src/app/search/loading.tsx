import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function SearchLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Editorial search header skeleton */}
        <section className="border-b border-border bg-surface py-14 sm:py-20 academic-grain">
          <div className="max-w-editorial mx-auto px-4 sm:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="h-6 w-44 rounded-full bg-surface-subtle animate-pulse" />
              <div className="h-12 w-3/4 rounded-xl bg-surface-subtle animate-pulse" />
              <div className="h-5 w-1/2 rounded-md bg-surface-subtle animate-pulse mb-8" />
              <div className="h-14 w-full rounded-2xl bg-surface-subtle animate-pulse" />
            </div>
          </div>
        </section>

        {/* Content & cards skeleton */}
        <div className="max-w-editorial mx-auto px-4 sm:px-8 mt-8">
          <div className="flex gap-3 pb-6 border-b border-border mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-lg bg-surface-subtle animate-pulse" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface p-6 rounded-xl border border-border h-52 flex flex-col justify-between shadow-fine animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-surface-subtle rounded" />
                  <div className="h-6 w-3/4 bg-surface-subtle rounded" />
                  <div className="h-4 w-1/2 bg-surface-subtle rounded" />
                </div>
                <div className="h-4 w-32 bg-surface-subtle rounded pt-3 border-t border-border" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
