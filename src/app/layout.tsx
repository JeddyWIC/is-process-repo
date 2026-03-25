import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Industrial Systems Process Repository",
  description: "Industrial Systems process documentation and lessons learned",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)] transition-colors">
        <AuthenticatedShell>
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IS</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-lg">Industrial Systems</span>
              </Link>
              <nav className="flex items-center gap-4">
                <ThemeToggle />
                <Link
                  href="/search"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
                >
                  Search
                </Link>
                <Link
                  href="/process/new"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  + New Process
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Industrial Systems Group &middot; Process Repository
            </div>
          </footer>
        </AuthenticatedShell>
      </body>
    </html>
  );
}
