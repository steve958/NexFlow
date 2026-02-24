import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "NexFlow",
  description: "Diagram & animate architectures",
  icons: {
    icon: [
      { url: '/nexflow.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '64x64' }
    ],
    shortcut: '/nexflow.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="system" storageKey="nexflow-theme">
            {children}
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
