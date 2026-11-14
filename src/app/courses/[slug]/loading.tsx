import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function CourseLoading() {
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
            <Skeleton className="h-9 w-80 rounded-lg bg-[#DBEAFE]/80 mb-2.5" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-24 rounded bg-[#DBEAFE]/60" />
              <Skeleton className="h-5 w-32 rounded bg-[#DBEAFE]/60" />
            </div>
          </div>
        </div>

        {/* Semesters Grid Skeleton */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-[#DCE6F1]">
            <Skeleton className="h-6 w-48 rounded bg-[#DBEAFE]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#DCE6F1] rounded-xl p-5 text-center space-y-3 shadow-fine"
              >
                <Skeleton className="h-10 w-16 rounded mx-auto bg-[#EFF6FF]" />
                <Skeleton className="h-4 w-24 rounded mx-auto bg-[#EFF6FF]" />
                <Skeleton className="h-5 w-20 rounded mx-auto bg-[#EFF6FF]" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
