import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Industrial Systems — Moved to Dashboard",
  description: "The Industrial Systems Process Repository has moved to the Industrial Systems Dashboard.",
};

// The IS site is now a redirect shell. UI routes redirect via
// next.config.ts; only the homepage shows a "we've moved" notice.
// /api/* routes remain unchanged — the Dashboard depends on them.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
        {children}
      </body>
    </html>
  );
}
