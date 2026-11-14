import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md mx-auto bg-white p-8 sm:p-10 rounded-xl border border-[#DCE6F1] shadow-card">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-base font-bold mb-4">
            404
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#172554] font-bold tracking-tight mb-2">
            Record Not Found
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed mb-6 font-sans">
            The document, course, or archival record you requested could not be located. It may have been updated or relocated.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold hover:bg-[#1E40AF] transition-all shadow-fine"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#DCE6F1] bg-white hover:bg-[#F8FBFF] text-[#172B4D] text-xs sm:text-sm font-medium transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search Repository</span>
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
