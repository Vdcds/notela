import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#22d3ee",
};

export const metadata: Metadata = {
  title: "Notela - Digital Markdown Vault",
  description:
    "A sleek terminal-inspired markdown editor and vault for your thoughts, notes, and ideas. The 'I Swear I'll Be Organized This Time' solution.",
  keywords: [
    "markdown",
    "editor",
    "notes",
    "vault",
    "terminal",
    "productivity",
  ],
  authors: [{ name: "Vedant" }],
  creator: "Vedant",
  publisher: "Notela",
  applicationName: "Notela",
  generator: "Next.js",
  category: "productivity",
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Notela",
  },
  openGraph: {
    title: "Notela - Digital Markdown Vault",
    description:
      "Terminal-inspired markdown editor and secure vault for your digital thoughts",
    siteName: "Notela",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Notela - Digital Markdown Vault",
    description: "Terminal-inspired markdown editor and secure vault",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/apple-touch-icon.png" },
    ],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistration />
        <Navbar />
        <main className="pt-16">{children}</main>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
