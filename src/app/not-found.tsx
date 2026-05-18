import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-xl font-semibold text-text-main mb-2">Page Not Found</h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/"><Button>Go Home</Button></Link>
            <Link href="/courses"><Button variant="outline">Browse Courses</Button></Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
