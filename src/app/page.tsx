// page.tsx
import AsciiHero from "@/components/AsciiHero";
import MouseDot from "@/components/MouseDot";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* ASCII background */}
      <AsciiHero />
      {/* custom cursor */}
      <MouseDot />

      {/* top-left name */}
      <h1
        className="
          pointer-events-none
          absolute top-35 left-0
          font-black tracking-tight select-none
          leading-none
        "
        style={{
          fontSize: "clamp(20rem, 14vw, 100rem)",
          fontFamily: "Grotesque Sans, Helvetica Neue Black, Inter Black",
        }}
      >
        aum
      </h1>

      {/* bottom-right name */}
      <h1
        className="
          pointer-events-none
          absolute bottom-50 left-0
          font-black tracking-tight select-none
          leading-none
        "
        style={{
          fontSize: "clamp(20rem, 14vw, 100rem)",
          fontFamily: "Grotesque Sans, Helvetica Neue Black, Inter Black",
        }}
      >
        garasia
      </h1>

      {/* small bio aligned to top-right */}
      <div className="absolute right-25 bottom-41 z-30 text-lg">
        <p className="text-center font-weight-bold">
          <mark id="text">full‑stack engineer who loves creative UX, </mark>
          <br />
          <mark id="text">scalable systems, and building tools</mark>
          <br />
          <mark id="text"> that feel fast and thoughtful</mark>
          <br />
          <mark id="text">
            based in <b>az</b>
          </mark>
        </p>
      </div>
    </main>
  );
}
