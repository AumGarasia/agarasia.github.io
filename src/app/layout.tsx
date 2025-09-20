import "./globals.css";
import "@/styles/fonts.css";
import { Analytics } from "@vercel/analytics/next";
import Terminal from "../components/Terminal";
import TopBar from "@/components/TopBar";
import LoadingOverlay from "@/components/LoadingOverlay";
import MouseDot from "@/components/MouseDot";

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
