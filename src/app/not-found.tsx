import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { ArrowLeft, BookOpen, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16 academic-grain">
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-subtle border border-border text-accent-gold font-mono text-sm font-semibold mb-6">
            404
          </div>
          <h1 className="font-editorial-heading text-3xl sm:text-4xl text-ink font-semibold tracking-tight mb-3">
            Record Not Found in Archive
          </h1>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-8 font-sans">
            The document, course, or archival record you requested could not be located. It may have been updated, relocated, or withdrawn.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-xs sm:text-sm font-semibold hover:bg-ink/90 active:scale-[0.98] transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Archive Home</span>
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-ink text-xs sm:text-sm font-medium transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Open Search</span>
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-ink text-xs sm:text-sm font-medium transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Programs</span>
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
