import "./globals.css";
import "@/styles/fonts.css";
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
      <body className="min-h-screen antialiased">
        <LoadingOverlay />
        <MouseDot />
        <TopBar />
        {children}
        {/*<Terminal />*/}
      </body>
    </html>
  );
}
