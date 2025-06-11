import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
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
    icon: "/icon.svg",
    apple: "/icon.svg",
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
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
