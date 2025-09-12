import "./globals.css";
import type { Metadata } from "next";
import Terminal from "../components/Terminal";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "Aum Garasia — Portfolio",
  description:
    "Creative full‑stack engineering, scalable systems, and playful UI.",
  metadataBase: new URL("https://example.com"), // update after deploy
  openGraph: {
    title: "Aum Garasia",
    description: "Creative full‑stack engineering",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Aum Garasia" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh antialiased">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Nav />
          {children}
        </div>
        <Terminal />
      </body>
    </html>
  );
}
