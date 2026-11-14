import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { GraduationCap, ShieldCheck, Zap, ArrowRight, Library, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Repository — USTM Academia",
  description:
    "Learn about USTM Academia, the official academic resource and institutional archive for the University of Science and Technology Meghalaya. Open, high-speed access to university question papers and syllabi.",
  keywords: ["USTM Academia", "About", "Academic Repository", "Question Papers", "Syllabi", "Meghalaya"],
  openGraph: {
    title: "About the Repository — USTM Academia",
    description: "The official academic resource repository for University of Science and Technology Meghalaya",
    url: "https://ustm-academia.vercel.app/about",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About USTM Academia",
    description: "Verified academic question papers and syllabi for USTM courses",
  },
};

const pillars = [
  {
    icon: Zap,
    tag: "High Velocity",
    title: "Zero-Barrier Access",
    description:
      "Engineered specifically for students during demanding exam periods. No mandatory logins, passwords, or paywalls—search, find, and download in seconds.",
  },
  {
    icon: ShieldCheck,
    tag: "Archival Quality",
    title: "Verified Course Materials",
    description:
      "All question papers (PYQs) and syllabus records are cataloged from official university examinations across all faculties and departments.",
  },
  {
    icon: Library,
    tag: "Taxonomy",
    title: "Systematic Academic Structure",
    description:
      "Organized strictly by Academic School, Program, Semester, and Subject code, guaranteeing consistent navigation from year to year.",
  },
  {
    icon: FileText,
    tag: "Resilience",
    title: "Low-Bandwidth Optimization",
    description:
      "Built with minimal asset overhead and aggressive caching so students on 3G/4G campus cellular networks can retrieve documents without delays.",
  },
];

const steps = [
  {
    num: "01",
    title: "Search or Select Program",
    description: "Use global search (or tap '/') for instant subject matching, or select your degree from the Academic Programs directory.",
  },
  {
    num: "02",
    title: "Select Academic Semester",
    description: "Pick your specific semester (from Sem 1 through Sem 8) to view active curriculum subjects.",
  },
  {
    num: "03",
    title: "Choose Subject & Paper",
    description: "Inspect subject files categorized into Official Syllabi and Past Examination Papers.",
  },
  {
    num: "04",
    title: "Study Online or Download",
    description: "Read documents immediately inside the interactive reader or save PDFs offline for study without internet.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1">
        {/* Editorial Masthead */}
        <section className="border-b border-border bg-surface py-14 sm:py-20 academic-grain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold-bg text-accent-gold border border-accent-gold/30 text-xs font-mono font-medium mb-4">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Institutional Academic Repository</span>
              </div>
              <h1 className="font-editorial-heading text-3xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight leading-[1.08] mb-6">
                Preserving <span className="font-editorial-serif italic font-medium text-accent-gold">academic rigor</span> for every student.
              </h1>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans font-normal">
                USTM Academia is the centralized digital repository for the University of Science and Technology Meghalaya (USTM),
                providing open, unencumbered access to verified past examination papers and syllabi across all departments.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Core Pillars */}
        <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-accent-gold font-semibold">
                Archival Philosophy
              </span>
              <h2 className="font-editorial-heading text-2xl sm:text-3xl text-ink mt-1 font-semibold">
                Designed for speed, verified for authenticity.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted max-w-md mt-3 md:mt-0 font-sans">
              Every detail is calibrated to eliminate friction between a student and the paper they need before an examination.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-surface rounded-xl border border-border p-6 flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-ink">
                        <Icon className="w-5 h-5 text-accent-gold" />
                      </div>
                      <span className="text-[11px] font-mono font-medium text-ink-faint px-2 py-0.5 rounded bg-surface-subtle border border-border/50">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-editorial-heading text-lg font-semibold text-ink mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* The 4-Step How It Works Section */}
        <section className="py-14 sm:py-20 bg-surface border-y border-border academic-grain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-mono uppercase tracking-wider text-accent-gold font-semibold">
                Student Workflow
              </span>
              <h2 className="font-editorial-heading text-2xl sm:text-3xl text-ink mt-1 font-semibold">
                How to navigate the archive
              </h2>
              <p className="text-sm text-ink-muted mt-2">
                Four clear steps from course selection to offline study.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((st) => (
                <div
                  key={st.num}
                  className="bg-paper rounded-xl border border-border p-6 flex flex-col justify-between relative"
                >
                  <div>
                    <div className="font-editorial-heading text-3xl font-normal text-border-strong mb-3">
                      {st.num}
                    </div>
                    <h3 className="font-sans text-base font-semibold text-ink mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4 pt-6 border-t border-border/70">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-xs sm:text-sm font-semibold hover:bg-ink/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <span>Browse Academic Programs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface hover:bg-surface-subtle text-ink border border-border text-xs sm:text-sm font-medium transition-all"
              >
                <span>Open Instant Search</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Institutional Colophon / Governance */}
        <section className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Official University Administration</span>
              </div>
              <h3 className="font-editorial-heading text-xl font-semibold text-ink mb-2">
                Questions, syllabus revisions, or contributions?
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Repository holdings are maintained in coordination with university faculty and academic coordinators.
                If you detect a missing paper or outdated syllabus code, reach out through the academic help desk.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/help"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-paper hover:bg-surface-subtle text-ink text-xs sm:text-sm font-medium transition-all"
              >
                <span>Visit Help & Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
