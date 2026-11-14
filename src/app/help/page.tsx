import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { HelpCircle, Search, Mail, BookOpen } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archival Inquiries & FAQ — USTM Academia",
  description:
    "Frequently asked questions and guidance for accessing previous year question papers (PYQs) and syllabi on USTM Academia.",
  keywords: ["USTM Academia", "Help", "FAQ", "Inquiries", "Question Papers", "Support"],
  openGraph: {
    title: "Help & FAQ — USTM Academia",
    description: "Guidance for accessing academic resources on USTM Academia",
    url: "https://ustm-academia.vercel.app/help",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Help & FAQ — USTM Academia",
    description: "Find answers regarding academic papers, syllabi, and downloads",
  },
};

const faqs = [
  {
    category: "Access & Authentication",
    q: "Do I need to sign in or create an account to access papers?",
    a: "No. All documents in the USTM Academia repository are open-access for students and faculty. There are no logins, passwords, or registration walls.",
  },
  {
    category: "Finding Documents",
    q: "What is the quickest way to find a specific past question paper?",
    a: "Press '/' on any page (or tap Search in the navigation bar) to launch global search. You can search by subject name (e.g., 'Operating Systems'), course acronym (e.g., 'BCA', 'MCA'), semester, or year.",
  },
  {
    category: "Offline Study",
    q: "Can I download PDFs for offline examination preparation?",
    a: "Yes. Every published paper has a direct 'Download Archive' button on its document page. You can also preview the paper immediately in the browser without downloading.",
  },
  {
    category: "Mobile & Connectivity",
    q: "The PDF viewer is slow or not rendering on my mobile browser. What can I do?",
    a: "Tap the 'Open in Tab' or 'Full Screen' button on the document masthead. This opens the PDF directly via the document CDN or Google Drive viewer, bypassing mobile browser iframe constraints.",
  },
  {
    category: "Data Accuracy",
    q: "Are the question papers and syllabi official university documents?",
    a: "Yes. Every record is archived from authorized University of Science and Technology Meghalaya departmental submissions and examination cell records.",
  },
  {
    category: "Corrections & Submissions",
    q: "How can I report a missing semester paper or incorrect syllabus version?",
    a: "Notify your department student representative or write to the university IT & Academic Affairs cell with the subject code and semester details so our archival team can upload the updated record.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1">
        {/* Editorial Masthead */}
        <section className="border-b border-border bg-surface py-14 sm:py-20 academic-grain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold-bg text-accent-gold border border-accent-gold/30 text-xs font-mono font-medium mb-4">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Student Support & Repository Guide</span>
              </div>
              <h1 className="font-editorial-heading text-3xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight leading-[1.08] mb-6">
                Archival Inquiries & <span className="font-editorial-serif italic font-medium text-accent-gold">FAQ</span>.
              </h1>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans font-normal">
                Everything you need to know about searching, downloading, and verifying academic materials on USTM Academia.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Grid */}
        <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-surface rounded-xl border border-border p-6 sm:p-7 flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-medium text-accent-gold uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <span className="text-xs font-mono text-ink-faint">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-editorial-heading text-lg sm:text-xl font-semibold text-ink mb-3 leading-snug">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Support / Contact Card */}
          <div className="mt-14 bg-surface rounded-xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-accent-gold font-semibold mb-2">
                <Mail className="w-4 h-4" />
                <span>Academic Affairs & IT Desk</span>
              </div>
              <h3 className="font-editorial-heading text-xl font-semibold text-ink mb-2">
                Need archival assistance or spotted an error?
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Reach out to the University IT administration or your department examination coordinator with your course, semester, and subject code.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-paper text-xs sm:text-sm font-semibold hover:bg-ink/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Courses</span>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-paper hover:bg-surface-subtle text-ink text-xs sm:text-sm font-medium transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Instant Search</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
