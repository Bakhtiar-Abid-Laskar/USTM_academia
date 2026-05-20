"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
  ];

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-primary shadow-md">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary rounded">
            <Image
              src="/ustm-logo.png"
              alt="USTM Logo"
              width={36}
              height={36}
              sizes="36px"
              quality={60}
              className="rounded-full bg-white p-0.5"
              loading="eager"
            />
            <div className="hidden sm:block">
              <span className="font-bold text-sm leading-tight block">USTM Academia</span>
              <span className="text-[10px] text-primary-200 leading-tight block">Academic Resource Portal</span>
            </div>
            <span className="sm:hidden font-bold text-sm">USTM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary ${
                      pathname === link.href
                        ? "text-white bg-white/15"
                        : "text-primary-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/search"
              className="ml-2 p-2 text-primary-200 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
              aria-label="Search documents"
            >
              <Search className="h-5 w-5" />
            </Link>
          </nav>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/search" className="p-2 text-white focus:outline-none focus:ring-2 focus:ring-white rounded-md" aria-label="Search documents">
              <Search className="h-5 w-5" />
            </Link>
            <button
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary rounded-md"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav id="mobile-nav" className="md:hidden pb-4 border-t border-white/10 pt-2" aria-label="Mobile navigation">
            <ul className="space-y-1">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary ${
                      pathname === link.href ? "text-white bg-white/15" : "text-primary-200 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}


export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-main">
            <Image
              src="/ustm-logo.png"
              alt="USTM Logo"
              width={24}
              height={24}
              quality={60}
              loading="lazy"
              className="rounded-full"
            />
            <span className="text-sm font-semibold">USTM Academia</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-text-muted">
            <Link href="/about" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1">About</Link>
            <Link href="/help" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1">Help</Link>
            <Link href="/courses" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1">Courses</Link>
          </nav>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} USTM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
