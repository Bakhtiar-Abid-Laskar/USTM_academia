import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function ViewLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1 flex flex-col">
        {/* Masthead Bar Skeleton */}
        <section className="bg-white border-b border-[#DCE6F1] sticky top-16 z-20">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                {/* Breadcrumb skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24 rounded bg-[#DBEAFE]/60" />
                  <span className="text-[#BFD0E2]">/</span>
                  <Skeleton className="h-3 w-16 rounded bg-[#DBEAFE]/60" />
                  <span className="text-[#BFD0E2]">/</span>
                  <Skeleton className="h-3 w-32 rounded bg-[#DBEAFE]/60" />
                </div>

                {/* Primary Document Title skeleton */}
                <Skeleton className="h-7 w-3/4 max-w-md rounded-md bg-[#DBEAFE]/80" />

                {/* Specification Chips skeleton */}
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-5 w-24 rounded-md bg-[#EFF6FF]" />
                  <Skeleton className="h-5 w-16 rounded-md bg-[#EFF6FF]" />
                  <Skeleton className="h-5 w-28 rounded-md bg-[#EFF6FF]" />
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <Skeleton className="h-9 w-32 rounded-lg bg-[#DBEAFE]" />
                <Skeleton className="h-9 w-28 rounded-lg bg-[#F8FBFF] border border-[#DCE6F1]" />
              </div>
            </div>
          </div>
        </section>

        {/* Reader Canvas Skeleton */}
        <section className="flex-1 bg-[#EFF6FF] py-4 sm:py-6 px-3 sm:px-6">
          <div className="max-w-6xl mx-auto h-full">
            <div className="bg-white rounded-xl border border-[#DCE6F1] shadow-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 190px)", minHeight: "580px" }}>
              <div className="px-4 py-2.5 bg-[#F8FBFF] border-b border-[#DCE6F1] flex items-center justify-between">
                <Skeleton className="h-4 w-48 rounded bg-[#EFF6FF]" />
                <Skeleton className="h-3 w-32 rounded bg-[#EFF6FF]" />
              </div>
              <div className="flex-1 w-full bg-[#F8FBFF] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#BFD0E2] border-t-[#1D4ED8] animate-spin mx-auto" />
                  <p className="text-xs font-medium text-[#64748B]">Loading document preview...</p>
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
