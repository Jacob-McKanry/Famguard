import type { Metadata, Viewport } from "next";
import "./globals.css";
import Tracking from "@/components/Tracking";
import AttributionCapture from "@/components/AttributionCapture";

export const metadata: Metadata = {
  title: "Family Guardian | Early access",
  description:
    "Scam protection for your aging parent, paid for by the family. Join the free early-access list.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Source Serif 4 (weights 400, 600, 700), same as the reference design */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        {children}
        <AttributionCapture />
        <Tracking />
      </body>
    </html>
  );
}
