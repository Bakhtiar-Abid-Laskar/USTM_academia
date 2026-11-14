import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function SubjectLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-3 w-16 rounded bg-[#DBEAFE]" />
            <span className="text-[#BFD0E2]">/</span>
            <Skeleton className="h-3 w-20 rounded bg-[#DBEAFE]" />
            <span className="text-[#BFD0E2]">/</span>
            <Skeleton className="h-3 w-24 rounded bg-[#DBEAFE]" />
            <span className="text-[#BFD0E2]">/</span>
            <Skeleton className="h-3 w-32 rounded bg-[#DBEAFE]" />
          </div>

          {/* Title + subtitle */}
          <div className="mb-8 pb-3.5 border-b border-[#DCE6F1]">
            <Skeleton className="h-9 w-80 rounded-lg bg-[#DBEAFE]/80 mb-2" />
            <Skeleton className="h-4 w-64 rounded bg-[#DBEAFE]/50" />
          </div>

          {/* Section: Syllabus */}
          <div className="space-y-8">
            <div>
              <Skeleton className="h-5 w-32 rounded bg-[#DBEAFE] mb-3.5" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={`s-${i}`}
                    className="border border-[#DCE6F1] rounded-xl bg-white p-4 flex items-center justify-between shadow-fine"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/2 rounded bg-[#EFF6FF]" />
                      <Skeleton className="h-3.5 w-1/4 rounded bg-[#EFF6FF]" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg bg-[#EFF6FF]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Question Papers */}
            <div>
              <Skeleton className="h-5 w-48 rounded bg-[#DBEAFE] mb-3.5" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`q-${i}`}
                    className="border border-[#DCE6F1] rounded-xl bg-white p-4 flex items-center justify-between shadow-fine"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-2/3 rounded bg-[#EFF6FF]" />
                      <Skeleton className="h-3.5 w-1/3 rounded bg-[#EFF6FF]" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg bg-[#EFF6FF]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
