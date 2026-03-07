import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal — Let recruiters chat with your resume",
  description:
    "Upload your resume, get a personal AI bot, and share the link. Recruiters and anyone can chat with your bot about your work, skills, and experience.",
  openGraph: {
    title: "Personal — Let recruiters chat with your resume",
    description:
      "Upload your resume. Get an AI bot. Share the link. Anyone can now chat with your experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans min-h-screen bg-bg text-text">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
