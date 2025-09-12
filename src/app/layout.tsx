import "./globals.css";
import type { Metadata } from "next";
import Nav from "./components/Nav";
import Terminal from "./components/Terminal";

export const metadata: Metadata = {
  title: "Aum Garasia — Portfolio",
  description:
    "Creative full‑stack engineering, scalable systems, and playful UI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh antialiased">
        <header className="mx-auto max-w-5xl px-6 py-6">
          <Nav />
        </header>
        <main className="mx-auto max-w-5xl px-6 pb-16">{children}</main>
        <Terminal />
      </body>
    </html>
  );
}
