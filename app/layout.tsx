import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Pixel Portfolio",
  description: "A gamified portfolio experience",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} font-pixel antialiased bg-zinc-900 text-white overflow-hidden`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
