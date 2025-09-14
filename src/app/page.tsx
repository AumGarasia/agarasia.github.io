// page.tsx
import AsciiHero from "@/components/AsciiHero";
import MouseDot from "@/components/MouseDot";

export default function Home() {
  return (
    <main className="relative">
      {/* ASCII background */}
      <AsciiHero />
      {/* custom cursor */}
      <MouseDot />

      {/* giant name overlay */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="select-none" style={{ marginTop: "8vh" }}>
            aum
          </h1>
          <h1 className="select-none -mt-8">garasia</h1>
        </div>
      </div>

      {/* small bio */}
      <div className="absolute right-6 top-24 z-30 text-sm">
        <p className="text-right">
          senior frontend engineer at{" "}
          <a className="hover:underline" href="#" target="_blank">
            sigma computing
          </a>
          <br />
          based in nyc
        </p>
      </div>
    </main>
  );
}
