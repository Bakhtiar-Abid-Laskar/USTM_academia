import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function SearchLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF]">
      <PublicHeader />
      <main className="flex-1 w-full">
        {/* Search header skeleton */}
        <section className="border-b border-[#DCE6F1] bg-[#EFF6FF] py-12 sm:py-16">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3.5">
              <div className="h-6 w-44 rounded-md bg-[#DBEAFE] animate-pulse" />
              <div className="h-10 w-3/4 rounded-lg bg-[#DBEAFE]/70 animate-pulse" />
              <div className="h-5 w-1/2 rounded-md bg-[#DBEAFE]/50 animate-pulse mb-6" />
              <div className="h-12 w-full rounded-xl bg-white border border-[#DCE6F1] animate-pulse" />
            </div>
          </div>
        </section>

        {/* Content & cards skeleton */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex gap-2.5 pb-5 border-b border-[#DCE6F1] mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-lg bg-white border border-[#DCE6F1] animate-pulse" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl border border-[#DCE6F1] h-48 flex flex-col justify-between shadow-fine animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-[#EFF6FF] rounded" />
                  <div className="h-5 w-3/4 bg-[#EFF6FF] rounded" />
                  <div className="h-4 w-1/2 bg-[#EFF6FF] rounded" />
                </div>
                <div className="h-4 w-32 bg-[#EFF6FF] rounded pt-3 border-t border-[#DCE6F1]" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
