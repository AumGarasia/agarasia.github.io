import "./globals.css";
import "@/styles/fonts.css";
import Nav from "./components/Nav";
import Terminal from "../components/Terminal";
import Container from "@/components/Container";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh antialiased">
        <Nav />
        <Container>
          {children}
          <footer className="hr mt-16 pt-6 text-sm muted">…</footer>
        </Container>
        <Terminal />
      </body>
    </html>
  );
}
