import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

const metadataBase = new URL(getSiteUrl());

export const metadata: Metadata = {
  metadataBase,
  title: "Ghazal Tech",
  description: "Web, BMS, and dashboard solutions built as full-stack digital products.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Ghazal Tech",
    description: "Web, BMS, and dashboard solutions built as full-stack digital products.",
    url: "/",
    siteName: "Ghazal Tech",
    type: "website",
    images: [
      {
        url: "/og-en.jpg",
        width: 1200,
        height: 630,
        alt: "Ghazal Tech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghazal Tech",
    description: "Web, BMS, and dashboard solutions built as full-stack digital products.",
    images: ["/og-en.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
