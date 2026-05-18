import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "USTM Academia — Academic Resource Portal",
  description:
    "The official academic resource portal for University of Science and Technology Meghalaya. Access previous year question papers and syllabus PDFs.",
  keywords: ["USTM", "question papers", "syllabus", "university", "Meghalaya", "academic"],
  icons: {
    icon: "/ustm-logo.png",
    apple: "/ustm-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/ustm-logo.png" type="image/png" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
