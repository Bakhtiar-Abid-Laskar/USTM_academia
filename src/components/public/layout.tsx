"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ArrowUpRight, ShieldCheck, Heart } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const navLinks = [
    { label: "Archive", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
  ];

  // Scroll direction detection: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 12);

      if (currentScrollY > 120 && currentScrollY > lastScrollY.current + 8) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current - 4) {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut listener ('/' or Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        router.push("/search");
      }
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, router]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled
            ? "bg-paper/85 backdrop-blur-md border-b border-border shadow-fine"
            : "bg-paper/60 backdrop-blur-xs border-b border-transparent"
        }`}
      >
        <div className="max-w-editorial mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* ── Brand Logo & University Press Identity ────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-lg p-1 transition-all"
            >
              <div className="relative">
                <Image
                  src="/ustm-logo.png"
                  alt="USTM Crest - University of Science and Technology Meghalaya"
                  width={38}
                  height={38}
                  sizes="38px"
                  quality={85}
                  className="rounded-full bg-surface p-0.5 border border-border shadow-fine group-hover:scale-105 transition-transform"
                  loading="eager"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-paper" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-editorial-heading font-semibold text-lg sm:text-xl text-ink tracking-tight leading-tight group-hover:text-accent-gold transition-colors">
                    USTM Academia
                  </span>
                  <span className="hidden md:inline-flex items-center px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider rounded border border-border bg-surface-subtle text-ink-muted">
                    Archive
                  </span>
                </div>
                <span className="text-[11px] font-sans font-medium text-ink-muted tracking-normal leading-none hidden sm:block">
                  University of Science & Technology Meghalaya
                </span>
              </div>
            </Link>

            {/* ── Desktop Navigation ───────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
              <ul className="flex items-center p-1 rounded-full bg-surface/70 border border-border shadow-fine">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href} className="relative">
                      <Link
                        href={link.href}
                        className={`relative z-10 block px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                          isActive ? "text-ink font-bold" : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        {link.label}
                      </Link>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill-indicator"
                          className="absolute inset-0 bg-surface-subtle border border-border rounded-full shadow-fine"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Instant Search Bar Trigger */}
              <Link
                href="/search"
                className="ml-3 inline-flex items-center gap-2.5 px-3.5 py-1.5 text-xs font-medium text-ink-muted bg-surface/80 hover:bg-surface hover:text-ink border border-border rounded-full shadow-fine transition-all group"
                aria-label="Search study materials"
              >
                <Search size={14} className="text-accent-gold group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline text-ink-faint">Search PYQs & syllabi...</span>
                <span className="lg:hidden">Search</span>
                <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-surface-subtle border border-border text-ink-muted rounded">
                  /
                </kbd>
              </Link>
            </nav>

            {/* ── Mobile Action Buttons ────────────────────────────────────── */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/search"
                className="p-2 text-ink-muted hover:text-ink hover:bg-surface rounded-lg border border-border/80 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-ink hover:bg-surface rounded-lg border border-border transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ─────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-border bg-paper/95 backdrop-blur-xl px-4 py-6 shadow-editorial"
            >
              <div className="flex flex-col gap-2">
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border text-sm font-semibold text-ink shadow-fine mb-2"
                >
                  <span className="flex items-center gap-2.5">
                    <Search size={16} className="text-accent-gold" />
                    Quick Search Archive
                  </span>
                  <span className="text-[10px] text-accent-gold font-bold bg-accent-gold-bg px-2 py-0.5 rounded">
                    Instant
                  </span>
                </Link>

                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-surface text-ink border border-border shadow-fine font-bold"
                          : "text-ink-muted hover:text-ink hover:bg-surface/50"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface text-ink-muted relative overflow-hidden">
      {/* Editorial top accent rule */}
      <div className="h-0.5 w-full bg-gradient-to-r from-accent-gold via-accent-crimson to-accent-navy opacity-70" />

      <div className="max-w-editorial mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-border">
          {/* Colophon & Institutional Crest */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/ustm-logo.png"
                alt="USTM Emblem"
                width={36}
                height={36}
                quality={85}
                className="rounded-full bg-surface p-0.5 border border-border shadow-fine"
              />
              <div>
                <span className="font-editorial-heading font-semibold text-lg text-ink block leading-tight">
                  USTM Academia
                </span>
                <span className="text-xs text-ink-faint font-medium">
                  Central Academic Paper & Syllabus Repository
                </span>
              </div>
            </div>

            <p className="text-sm text-ink-muted leading-relaxed max-w-md">
              A curated digital archive built specifically for students and faculty of the University
              of Science and Technology Meghalaya. Facilitating fast, verified access to previous year
              examination question papers and official curricula.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-ink-faint">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                <ShieldCheck size={14} /> Official Student Portal
              </span>
              <span>·</span>
              <span>Updated {currentYear}</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink font-sans">
              Archive Catalog
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/courses" className="hover:text-accent-gold transition-colors flex items-center justify-between group">
                  <span>Browse All Courses</span>
                  <ArrowUpRight size={13} className="text-ink-faint group-hover:text-accent-gold transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/search?type=question-paper" className="hover:text-accent-gold transition-colors flex items-center justify-between group">
                  <span>Question Papers (PYQs)</span>
                  <ArrowUpRight size={13} className="text-ink-faint group-hover:text-accent-gold transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/search?type=syllabus" className="hover:text-accent-gold transition-colors flex items-center justify-between group">
                  <span>Course Syllabi</span>
                  <ArrowUpRight size={13} className="text-ink-faint group-hover:text-accent-gold transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-accent-gold transition-colors flex items-center justify-between group">
                  <span>Direct Search Engine</span>
                  <ArrowUpRight size={13} className="text-ink-faint group-hover:text-accent-gold transition-colors" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Information */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink font-sans">
              Institutional Context
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              University of Science and Technology Meghalaya (USTM), Techno City, Killing Road, Baridua,
              9th Mile, Ri-Bhoi, Meghalaya 793101.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium">
              <Link href="/about" className="hover:text-ink transition-colors underline underline-offset-4">
                About the Archive
              </Link>
              <Link href="/help" className="hover:text-ink transition-colors underline underline-offset-4">
                Student Help Guide
              </Link>
              <a
                href="https://github.com/Bakhtiar-Abid-Laskar/USTM_academia"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors inline-flex items-center gap-1 underline underline-offset-4"
              >
                Open Source <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-faint">
          <p>© {currentYear} USTM Academia. Free and open access for students.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart size={12} className="text-accent-crimson fill-accent-crimson" /> for the students of USTM
          </p>
        </div>
      </div>
    </footer>
  );
}
