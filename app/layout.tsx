import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Tracking } from "@/components/tracking";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const TITLE = "Cristian Iordan's Portfolio";
const DESCRIPTION =
  "Product designer portfolio as a 3D open-world game: walk the streets of Design District to explore my case studies, projects and more.";

// The preview image comes from app/opengraph-image.jpg and app/twitter-image.jpg
export const metadata: Metadata = {
  metadataBase: new URL("https://cristianiordan.design"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Cristian Iordan",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@CristianIordan_",
  },
  icons: {
    icon: "/Favicon.png",
    apple: "/Favicon.png",
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
        className="font-sans antialiased bg-black text-white overflow-hidden"
        suppressHydrationWarning
      >
        {/* First, so it's running before the game reports anything */}
        <Tracking />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
