import "./globals.css";
import "@/styles/fonts.css";
import { Analytics } from "@vercel/analytics/next";
import Terminal from "../components/Terminal";
import TopBar from "@/components/TopBar";
import LoadingOverlay from "@/components/LoadingOverlay";
import MouseDot from "@/components/MouseDot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aum Garasia",
  description: "…",
  icons: {
    icon: [
      { url: "/favicon.ico" }, // fallback
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  // Optional (Android status bar color / PWA):
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <title>Aum Garasia</title>
      <body className="min-h-screen antialiased">
        <Analytics />
        <LoadingOverlay />
        <MouseDot />
        <TopBar />
        {children}
        {/*<Terminal />*/}
      </body>
    </html>
  );
}
