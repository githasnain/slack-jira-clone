import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Slack + Jira Clone",
  description: "A collaborative workspace platform combining Slack's messaging with Jira's project management",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8C00FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for above-the-fold content */
            body { margin: 0; font-family: var(--font-geist-sans); }
            .min-h-screen { min-height: 100vh; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .animate-spin { animation: spin 1s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
            .bg-gray-50 { background-color: #f9fafb; }
            .text-primary-purple { color: #8C00FF; }
            .border-primary-purple { border-color: #8C00FF; }
            .h-8 { height: 2rem; }
            .w-8 { width: 2rem; }
            .border-2 { border-width: 2px; }
            .border-t-transparent { border-top-color: transparent; }
            .rounded-full { border-radius: 9999px; }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
