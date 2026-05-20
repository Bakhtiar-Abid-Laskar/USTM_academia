import { Suspense } from "react";
import { Metadata } from "next";
import GlobalSearch from "@/components/Search/GlobalSearch";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Search USTM Study Materials, PYQs, Syllabi & Academic Resources | USTM Academia",
  description: "Find USTM previous year question papers, syllabi, notes, and academic resources by subject, course, semester, department, and year on USTM Academia.",
  keywords: ["USTM", "previous year papers", "study materials", "syllabus", "notes", "BTech", "USTM resources", "academic portal"],
  openGraph: {
    title: "Search USTM Study Materials | USTM Academia",
    description: "Search previous year question papers, syllabi, notes, and academic resources from USTM in seconds.",
    url: "https://ustm-academia.vercel.app/search",
    siteName: "USTM Academia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search USTM Study Materials | USTM Academia",
    description: "Search previous year question papers, syllabi, notes, and academic resources from USTM in seconds.",
  },
};

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 w-full relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <GlobalSearch />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
