"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#DCE6F1] shadow-fine"
            : "bg-white border-b border-[#DCE6F1]"
        }`}
      >
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* ── LEFT: Logo & Institutional Brand ────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg p-1 transition-all"
            >
              <div className="relative shrink-0">
                <Image
                  src="/ustm-logo.png"
                  alt="USTM Crest - University of Science and Technology Meghalaya"
                  width={38}
                  height={38}
                  sizes="38px"
                  quality={90}
                  className="rounded-full bg-white p-0.5 border border-[#DCE6F1] shadow-fine group-hover:scale-105 transition-transform"
                  priority
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="flex flex-col">
                {/* Brand Name - NO ARCHIVE BADGE */}
                <span className="font-sans font-bold text-base sm:text-lg text-brand-navy tracking-tight leading-tight group-hover:text-brand-primary transition-colors">
                  USTM Academia
                </span>
                <span className="text-[11px] font-sans font-medium text-brand-muted tracking-normal leading-none hidden sm:block">
                  University of Science & Technology Meghalaya
                </span>
              </div>
            </Link>

            {/* ── RIGHT: Desktop Navigation Links & Integrated Search ─────────── */}
            <div className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
              <nav className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "text-brand-primary font-semibold bg-[#EFF6FF]"
                          : "text-brand-muted hover:text-brand-navy hover:bg-[#F8FBFF]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Header Integrated Search Affordance */}
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-muted bg-[#F8FBFF] hover:bg-white hover:text-brand-navy border border-[#DCE6F1] hover:border-brand-secondary rounded-lg shadow-fine transition-all group"
                aria-label="Search study materials"
              >
                <Search size={14} className="text-brand-primary group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-brand-faint">Search repository...</span>
                <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white border border-[#DCE6F1] text-brand-muted rounded">
                  /
                </kbd>
              </Link>
            </div>

            {/* ── Mobile Header Actions ─────────────────────────────────────── */}
            <div className="flex items-center gap-1.5 md:hidden">
              <Link
                href="/search"
                className="p-2 text-brand-muted hover:text-brand-navy hover:bg-[#F8FBFF] rounded-lg border border-[#DCE6F1] transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-brand-navy hover:bg-[#F8FBFF] rounded-lg border border-[#DCE6F1] transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile Navigation Drawer ───────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#DCE6F1] bg-white px-4 py-4 shadow-card"
            >
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-sm font-semibold text-brand-primary mb-2"
                >
                  <span className="flex items-center gap-2">
                    <Search size={16} />
                    Search Question Papers & Syllabi
                  </span>
                  <kbd className="text-[10px] bg-white border border-[#BFDBFE] px-1.5 py-0.5 rounded font-mono">
                    /
                  </kbd>
                </Link>

                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#EFF6FF] text-brand-primary font-semibold"
                          : "text-brand-muted hover:text-brand-navy hover:bg-[#F8FBFF]"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
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
    <footer className="mt-auto border-t border-[#DCE6F1] bg-white text-brand-muted relative overflow-hidden">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#DCE6F1]">
          
          {/* Colophon & Institutional Crest */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <Image
                src="/ustm-logo.png"
                alt="USTM Crest"
                width={36}
                height={36}
                quality={90}
                className="rounded-full bg-white p-0.5 border border-[#DCE6F1] shadow-fine"
              />
              <div>
                <span className="font-sans font-bold text-base text-brand-navy block leading-tight">
                  USTM Academia
                </span>
                <span className="text-xs text-brand-faint font-medium">
                  Central Academic Paper & Syllabus Repository
                </span>
              </div>
            </div>

            <p className="text-sm text-brand-muted leading-relaxed max-w-md font-sans">
              An open, centralized academic repository for students and faculty of the University
              of Science and Technology Meghalaya. Facilitating fast, verified access to previous year
              examination question papers and official curricula.
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-brand-faint">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-[#DCFCE7] px-2.5 py-1 rounded-md border border-emerald-200">
                <ShieldCheck size={14} /> Verified Student Portal
              </span>
              <span>·</span>
              <span>USTM Academic Repository {currentYear}</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy font-sans">
              Academic Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="hover:text-brand-primary transition-colors flex items-center justify-between group">
                  <span>Browse All Courses</span>
                  <ArrowUpRight size={13} className="text-brand-faint group-hover:text-brand-primary transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/search?type=question-paper" className="hover:text-brand-primary transition-colors flex items-center justify-between group">
                  <span>Question Papers (PYQs)</span>
                  <ArrowUpRight size={13} className="text-brand-faint group-hover:text-brand-primary transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/search?type=syllabus" className="hover:text-brand-primary transition-colors flex items-center justify-between group">
                  <span>Semester Syllabi</span>
                  <ArrowUpRight size={13} className="text-brand-faint group-hover:text-brand-primary transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-brand-primary transition-colors flex items-center justify-between group">
                  <span>Global Search</span>
                  <ArrowUpRight size={13} className="text-brand-faint group-hover:text-brand-primary transition-colors" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Information */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy font-sans">
              University Information
            </h4>
            <p className="text-xs text-brand-muted leading-relaxed font-sans">
              University of Science and Technology Meghalaya (USTM), Techno City, Killing Road, Baridua,
              9th Mile, Ri-Bhoi, Meghalaya 793101.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium">
              <Link href="/about" className="hover:text-brand-primary transition-colors underline underline-offset-4">
                About the Repository
              </Link>
              <Link href="/help" className="hover:text-brand-primary transition-colors underline underline-offset-4">
                Help & FAQ
              </Link>
              <a
                href="https://github.com/Bakhtiar-Abid-Laskar/USTM_academia"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-primary transition-colors inline-flex items-center gap-1 underline underline-offset-4"
              >
                GitHub Repository <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-faint">
          <p>© {currentYear} USTM Academia. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart size={12} className="text-brand-secondary fill-brand-secondary" /> for USTM students
          </p>
        </div>
      </div>
    </footer>
  );
}
