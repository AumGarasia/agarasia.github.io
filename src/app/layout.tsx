import "./globals.css";
import "@/styles/fonts.css";
import Terminal from "../components/Terminal";
import TopBar from "@/components/TopBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <TopBar />
        {children}
        <Terminal />
      </body>
    </html>
  );
}
