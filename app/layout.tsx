import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '../components/Providers';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VertexAi Tec - Project Management",
  description: "Modern project management and team collaboration platform by VertexAi Tec",
  icons: {
    icon: '/vertexai-favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="slack-jira-theme">
          <Providers>
            {children}
            <PerformanceMonitor />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
