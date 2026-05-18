import { PublicHeader, PublicFooter } from "@/components/public/layout";

export default function HelpPage() {
  const faqs = [
    {
      q: "Do I need to log in to access documents?",
      a: "No, all academic resources are freely accessible without any login or registration.",
    },
    {
      q: "How do I find question papers for my subject?",
      a: "Navigate to your course, select the semester, then choose the subject. All available question papers and syllabi will be listed.",
    },
    {
      q: "Can I download the PDFs?",
      a: "Yes, most documents have a download button. Some documents may be view-only as per admin settings.",
    },
    {
      q: "The PDF is not loading. What should I do?",
      a: "Try opening the PDF in a new browser tab using the 'Open in Tab' button. If the issue persists, try a different browser or check your internet connection.",
    },
    {
      q: "I found an incorrect document. How can I report it?",
      a: "Please contact the university IT department with the document details and they will review it.",
    },
    {
      q: "Are the documents official?",
      a: "Yes, all documents are uploaded by authorized university administrators.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-6">Help & FAQ</h1>

          <div className="max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg p-5 bg-white">
                <h3 className="font-semibold text-text-main mb-2">{faq.q}</h3>
                <p className="text-sm text-text-muted">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-primary-50 rounded-lg max-w-3xl">
            <h2 className="font-semibold text-text-main mb-2">Need more help?</h2>
            <p className="text-sm text-text-muted">
              If you have any questions not covered above, please reach out to the USTM IT department for assistance.
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
