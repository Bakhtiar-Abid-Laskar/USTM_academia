import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function ViewLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1 flex flex-col">
        {/* Archival Masthead Bar Skeleton */}
        <section className="bg-surface border-b border-border/80 sticky top-16 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2.5">
                {/* Breadcrumb skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24 rounded bg-surface-subtle" />
                  <span className="text-border">/</span>
                  <Skeleton className="h-3 w-16 rounded bg-surface-subtle" />
                  <span className="text-border">/</span>
                  <Skeleton className="h-3 w-32 rounded bg-surface-subtle" />
                </div>

                {/* Primary Document Title skeleton */}
                <Skeleton className="h-7 w-3/4 max-w-md rounded-md bg-surface-subtle" />

                {/* Archival Specification Chips skeleton */}
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-5 w-24 rounded-md bg-surface-subtle" />
                  <Skeleton className="h-5 w-16 rounded-md bg-surface-subtle" />
                  <Skeleton className="h-5 w-28 rounded-md bg-surface-subtle" />
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <Skeleton className="h-9 w-32 rounded-lg bg-surface-subtle" />
                <Skeleton className="h-9 w-28 rounded-lg bg-surface-subtle" />
              </div>
            </div>
          </div>
        </section>

        {/* Reader Canvas Skeleton */}
        <section className="flex-1 bg-surface-subtle/40 academic-grain py-4 sm:py-6 px-2 sm:px-6">
          <div className="max-w-6xl mx-auto h-full">
            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 190px)", minHeight: "580px" }}>
              <div className="px-4 py-2.5 bg-surface-subtle/80 border-b border-border flex items-center justify-between">
                <Skeleton className="h-4 w-48 rounded bg-border/40" />
                <Skeleton className="h-3 w-32 rounded bg-border/40" />
              </div>
              <div className="flex-1 w-full bg-surface-subtle/30 animate-pulse flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-border-strong border-t-accent-gold animate-spin mx-auto" />
                  <p className="text-xs font-mono text-ink-muted">Retrieving document from archive...</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
