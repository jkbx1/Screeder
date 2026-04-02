import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GlobalErrorFilter from "@/components/GlobalErrorFilter";
import InteractiveBackground from "@/components/InteractiveBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
// @ts-ignore
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Screeder — Record, Share & Analyze Your Screen",
  description:
    "Capture your screen with instant AI transcripts, high-performance playback, and one-click sharing. Built for teams and creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <InteractiveBackground />
          <GlobalErrorFilter />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
