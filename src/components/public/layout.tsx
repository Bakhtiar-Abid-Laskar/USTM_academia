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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 transition-all">
            <Image
              src="/ustm-logo.png"
              alt="USTM Logo"
              width={40}
              height={40}
              sizes="40px"
              quality={80}
              className="rounded-full bg-white p-0.5 shadow-sm group-hover:shadow-md transition-shadow"
              loading="eager"
            />
            <div className="hidden sm:block">
              <span className="font-extrabold text-base text-slate-900 tracking-tight leading-tight block group-hover:text-blue-700 transition-colors">USTM Academia</span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider leading-tight block">Academic Resource</span>
            </div>
            <span className="sm:hidden font-extrabold text-lg text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">USTM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      pathname === link.href
                        ? "text-blue-700 bg-blue-50 shadow-sm"
                        : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/search"
              className="ml-4 p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search documents"
            >
              <Search className="h-5 w-5" />
            </Link>
          </nav>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/search" className="p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors" aria-label="Search documents">
              <Search className="h-5 w-5" />
            </Link>
            <button
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
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
          <nav id="mobile-nav" className="md:hidden pb-4 border-t border-slate-100 pt-2 animate-slide-up" aria-label="Mobile navigation">
            <ul className="space-y-1">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      pathname === link.href ? "text-blue-700 bg-blue-50" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
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
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 z-0" />
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full">
              <Image
                src="/ustm-logo.png"
                alt="USTM Logo"
                width={32}
                height={32}
                quality={80}
                loading="lazy"
                className="rounded-full"
              />
            </div>
            <div>
              <span className="text-lg font-bold text-white block leading-tight">USTM Academia</span>
              <span className="text-xs text-blue-400 font-medium tracking-wide">Academic Resource Portal</span>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Home</Link>
            <Link href="/courses" className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Courses</Link>
            <Link href="/about" className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">About</Link>
            <Link href="/help" className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Help</Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} USTM Academia. All rights reserved.</p>
          <p>Built for the students of USTM.</p>
        </div>
      </div>
    </footer>
  );
}
