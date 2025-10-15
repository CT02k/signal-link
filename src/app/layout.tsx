import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
//@ts-expect-error TODO: Find a way to resolve this warning
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
  title: "Signal Link",
  description:
    "Real-time multiplayer sound and visual effects powered by WebSockets - no database, fully local.",
  openGraph: {
    title: "Signal Link",
    description:
      "Real-time multiplayer sound and visual effects powered by WebSockets - no database, fully local.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        {children}
      </body>
    </html>
  );
}
