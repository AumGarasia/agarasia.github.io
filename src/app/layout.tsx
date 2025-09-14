import "./globals.css";
import "@/styles/fonts.css";
import Terminal from "../components/Terminal";
import Nav from "./components/Nav";
import Container from "@/components/Container";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh antialiased">
        <Container>
          <Nav />
          {children}
          <footer className="hr mt-16 pt-6 text-sm muted">
            Press <kbd className="rounded bg-neutral-900 px-1.5">`</kbd> for the
            terminal.
          </footer>
        </Container>
        <Terminal />
      </body>
    </html>
  );
}
