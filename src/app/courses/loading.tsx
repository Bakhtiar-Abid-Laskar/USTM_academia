import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function CoursesLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Header Skeleton */}
        <div className="bg-[#EFF6FF] border-b border-[#DCE6F1] py-12">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-3 w-16 rounded bg-[#DBEAFE]" />
              <span className="text-[#BFD0E2]">/</span>
              <Skeleton className="h-3 w-28 rounded bg-[#DBEAFE]" />
            </div>
            <Skeleton className="h-9 w-64 rounded-lg bg-[#DBEAFE]/80 mb-2" />
            <Skeleton className="h-4 w-96 rounded bg-[#DBEAFE]/50" />
          </div>
        </div>

        {/* Courses Grid Skeleton */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#DCE6F1] rounded-xl p-5 space-y-3.5 shadow-fine"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded bg-[#EFF6FF]" />
                  <Skeleton className="h-4 w-16 rounded bg-[#EFF6FF]" />
                </div>
                <Skeleton className="h-5 w-3/4 rounded bg-[#EFF6FF]" />
                <Skeleton className="h-3.5 w-1/2 rounded bg-[#EFF6FF]" />
                <div className="flex gap-2 pt-3 border-t border-[#DCE6F1]">
                  <Skeleton className="h-5 w-24 rounded bg-[#EFF6FF]" />
                  <Skeleton className="h-5 w-20 rounded bg-[#EFF6FF]" />
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
