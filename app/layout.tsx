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
  title: "PersonaBots — Create AI chatbots that sound like you",
  description:
    "Build personal AI chatbots for hiring, networking, investor outreach, and more. Powered by your memory, voice, and style.",
  openGraph: {
    title: "PersonaBots",
    description: "Create AI chatbots that sound like you",
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
