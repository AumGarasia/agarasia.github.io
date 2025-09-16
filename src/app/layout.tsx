import "./globals.css";
import "@/styles/fonts.css";
import Nav from "./components/Nav";
import Terminal from "../components/Terminal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {/*<Nav />*/}
        {children}
        <Terminal />
      </body>
    </html>
  );
}
