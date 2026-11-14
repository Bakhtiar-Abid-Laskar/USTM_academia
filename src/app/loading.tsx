import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Hero Skeleton */}
        <section className="bg-[#EFF6FF] border-b border-[#DCE6F1] py-12 sm:py-16">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7 space-y-4">
                <Skeleton className="h-6 w-48 rounded-md bg-[#DBEAFE]" />
                <Skeleton className="h-10 w-full max-w-lg rounded-lg bg-[#DBEAFE]/70" />
                <Skeleton className="h-5 w-3/4 rounded-md bg-[#DBEAFE]/50" />
                <div className="pt-2">
                  <Skeleton className="h-12 w-full rounded-xl bg-white border border-[#DCE6F1]" />
                </div>
              </div>
              <div className="lg:col-span-5 hidden lg:block">
                <div className="bg-white rounded-xl border border-[#DCE6F1] p-6 space-y-4 shadow-card">
                  <Skeleton className="h-4 w-32 rounded bg-[#EFF6FF]" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-14 rounded-lg bg-[#EFF6FF]" />
                    <Skeleton className="h-14 rounded-lg bg-[#EFF6FF]" />
                    <Skeleton className="h-14 rounded-lg bg-[#EFF6FF]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Program Grid Skeleton */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#DCE6F1]">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded bg-[#DBEAFE]" />
              <Skeleton className="h-7 w-56 rounded bg-[#DBEAFE]" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg bg-white border border-[#DCE6F1]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#DCE6F1] p-5 space-y-3.5 shadow-fine">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded bg-[#EFF6FF]" />
                  <Skeleton className="h-4 w-16 rounded bg-[#EFF6FF]" />
                </div>
                <Skeleton className="h-5 w-3/4 rounded bg-[#EFF6FF]" />
                <Skeleton className="h-3.5 w-1/2 rounded bg-[#EFF6FF]" />
                <div className="pt-3 border-t border-[#DCE6F1] flex justify-between">
                  <Skeleton className="h-3.5 w-24 rounded bg-[#EFF6FF]" />
                  <Skeleton className="h-3.5 w-16 rounded bg-[#EFF6FF]" />
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
