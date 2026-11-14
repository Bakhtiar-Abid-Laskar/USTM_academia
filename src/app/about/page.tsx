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
      "Built with minimal asset overhead and aggressive caching so students on campus cellular networks can retrieve documents without delays.",
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
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1">
        {/* Masthead Section */}
        <section className="border-b border-[#DCE6F1] bg-[#EFF6FF] py-12 sm:py-16">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold mb-4">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Institutional Academic Repository</span>
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-[#172554] font-bold tracking-tight leading-[1.15] mb-4">
                Preserving Academic Rigor for Every Student.
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-sans font-normal">
                USTM Academia is the centralized digital repository for the University of Science and Technology Meghalaya (USTM),
                providing open, unencumbered access to verified past examination papers and syllabi across all departments.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Core Pillars */}
        <section className="py-12 sm:py-16 max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#DCE6F1]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                Archival Philosophy
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl text-[#172554] mt-1 font-bold">
                Designed for speed, verified for authenticity.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mt-2 md:mt-0">
              Every detail is calibrated to eliminate friction between a student and the paper they need before an examination.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-[#DCE6F1] p-5 sm:p-6 flex flex-col justify-between hover:border-[#2563EB] hover:shadow-card transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1D4ED8]">
                        <Icon className="w-5 h-5 text-[#1D4ED8]" />
                      </div>
                      <span className="text-[11px] font-mono font-medium text-[#64748B] px-2 py-0.5 rounded bg-[#F8FBFF] border border-[#DCE6F1]">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-sans text-base sm:text-lg font-bold text-[#172554] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* The 4-Step How It Works Section */}
        <section className="py-12 sm:py-16 bg-[#F8FBFF] border-y border-[#DCE6F1]">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                Student Workflow
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl text-[#172554] mt-1 font-bold">
                How to navigate the archive
              </h2>
              <p className="text-sm text-[#64748B] mt-1.5">
                Four clear steps from course selection to offline study.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((st) => (
                <div
                  key={st.num}
                  className="bg-white rounded-xl border border-[#DCE6F1] p-5 sm:p-6 flex flex-col justify-between shadow-fine"
                >
                  <div>
                    <div className="font-sans text-2xl sm:text-3xl font-bold text-[#BFD0E2] mb-3">
                      {st.num}
                    </div>
                    <h3 className="font-sans text-base font-bold text-[#172554] mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-[#DCE6F1]">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold hover:bg-[#1E40AF] transition-all shadow-fine"
              >
                <span>Browse Academic Programs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#F8FBFF] text-[#172B4D] border border-[#DCE6F1] text-xs sm:text-sm font-medium transition-all"
              >
                <span>Open Instant Search</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Institutional Assurance / Governance */}
        <section className="py-12 sm:py-16 max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-fine">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Official University Administration</span>
              </div>
              <h3 className="font-sans text-xl font-bold text-[#172554] mb-2">
                Questions, syllabus revisions, or contributions?
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Repository holdings are maintained in coordination with university faculty and academic coordinators.
                If you detect a missing paper or outdated syllabus code, reach out through the academic help desk.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/help"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DCE6F1] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-xs sm:text-sm font-semibold transition-all"
              >
                <span>Visit Help & FAQ</span>
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
