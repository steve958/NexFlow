import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "NexFlow",
  description: "Diagram & animate architectures",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased transition-colors duration-300 ease-in-out">
        <ThemeProvider defaultTheme="system" storageKey="nexflow-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
