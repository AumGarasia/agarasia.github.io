import "./globals.css";
import "@/styles/fonts.css";
import Terminal from "../components/Terminal";
import TopBar from "@/components/TopBar";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <LoadingOverlay />
        <TopBar />
        {children}
        <Terminal />
      </body>
    </html>
  );
}
