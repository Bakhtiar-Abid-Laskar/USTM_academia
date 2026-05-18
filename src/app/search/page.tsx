import { Suspense } from "react";
import SearchContent from "./search-content";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
