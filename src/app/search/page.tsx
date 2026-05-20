import { Suspense } from "react";
import { Metadata } from "next";
import GlobalSearch from "@/components/Search/GlobalSearch";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Search - USTM Academia",
  description: "Search for question papers and syllabi by course, subject, or keyword. Find study materials for all USTM courses.",
  keywords: ["search", "USTM", "question papers", "syllabi", "courses"],
  openGraph: {
    title: "Search Documents - USTM Academia",
    description: "Search for question papers and syllabi across all USTM courses",
    url: "https://ustm-academia.vercel.app/search",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Search Documents",
    description: "Find question papers and syllabi",
  },
};

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 py-8">
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
