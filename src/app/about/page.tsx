import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, FileText, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-6">About USTM Academia</h1>

          <div className="prose prose-sm max-w-3xl text-text-main">
            <p className="text-text-muted mb-6">
              USTM Academia is the official academic resource portal for the University of Science and Technology Meghalaya (USTM). 
              This platform provides students with easy access to previous year question papers and syllabi across all courses and departments.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Course Materials</h3>
                    <p className="text-sm text-text-muted">Browse syllabi for all courses organized by semester and subject.</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Question Papers</h3>
                    <p className="text-sm text-text-muted">Access previous year question papers to prepare for exams.</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <GraduationCap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Free Access</h3>
                    <p className="text-sm text-text-muted">No login required. All resources are freely accessible to students.</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Official Content</h3>
                    <p className="text-sm text-text-muted">All documents are uploaded by authorized administrators.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-lg font-semibold text-text-main mb-3">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-text-muted mb-6">
              <li>Select your <strong>course</strong> from the home page or courses listing.</li>
              <li>Choose the <strong>semester</strong> you need resources for.</li>
              <li>Select the <strong>subject</strong> to see available documents.</li>
              <li>View the PDF directly or download it for offline access.</li>
            </ol>

            <p className="text-text-muted text-sm">
              For questions or feedback, please contact the university IT department.
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
