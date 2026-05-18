import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function AdminBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6 flex-wrap">
      <Link href="/admin/dashboard" className="hover:text-primary flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary truncate max-w-[200px]">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-main font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
