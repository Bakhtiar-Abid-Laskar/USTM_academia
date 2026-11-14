import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { HelpCircle, Search, Mail, BookOpen } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQ — USTM Academia",
  description:
    "Frequently asked questions and guidance for accessing previous year question papers (PYQs) and syllabi on USTM Academia.",
  keywords: ["USTM Academia", "Help", "FAQ", "Inquiries", "Question Papers", "Support"],
  openGraph: {
    title: "Help & FAQ — USTM Academia",
    description: "Guidance for accessing academic resources on USTM Academia",
    url: "https://ustm-academia.vercel.app/help",
    type: "website",
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
    a: "Yes. Every published paper has a direct 'Download Paper' button on its document page. You can also preview the paper immediately in the browser without downloading.",
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
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-[#DCE6F1] bg-[#EFF6FF] py-12 sm:py-16">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold mb-4">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Student Support & Repository Guide</span>
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-[#172554] font-bold tracking-tight leading-[1.15] mb-3">
                Frequently Asked Questions
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-normal">
                Everything you need to know about searching, downloading, and verifying academic materials on USTM Academia.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Grid */}
        <section className="py-12 sm:py-16 max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#DCE6F1] p-5 sm:p-6 flex flex-col justify-between hover:border-[#2563EB] hover:shadow-card transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono font-semibold text-[#1D4ED8] uppercase tracking-wider bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                      {faq.category}
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-[#172554] mb-2 leading-snug">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Support / Contact Card */}
          <div className="mt-12 bg-white rounded-xl border border-[#DCE6F1] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-fine">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1D4ED8] mb-1.5">
                <Mail className="w-4 h-4" />
                <span>Academic Affairs & IT Desk</span>
              </div>
              <h3 className="font-sans text-lg sm:text-xl font-bold text-[#172554] mb-1.5">
                Need archival assistance or spotted an error?
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Reach out to the University IT administration or your department examination coordinator with your course, semester, and subject code.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold hover:bg-[#1E40AF] transition-all shadow-fine"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Courses</span>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#DCE6F1] bg-white hover:bg-[#F8FBFF] text-[#172B4D] text-xs sm:text-sm font-medium transition-all"
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
