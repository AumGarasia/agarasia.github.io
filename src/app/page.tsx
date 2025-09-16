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
          absolute -top-19 left-0
          font-black tracking-tight select-none
          leading-none
        "
        style={{
          fontSize: "clamp(20rem, 14vw, 100rem)",
        }}
      >
        aum
      </h1>

      {/* bottom-right name */}
      <h1
        className="
          pointer-events-none
          absolute -bottom-3 right-0
          font-black tracking-tight select-none
          leading-none
        "
        style={{
          fontSize: "clamp(20rem, 14vw, 100rem)",
        }}
      >
        garasia
      </h1>

      {/* small bio aligned to top-right */}
      <div className="absolute right-12 top-11 z-30 text-md">
        <p className="text-right font-weight-bold">
          <mark>full‑stack engineer who loves creative UX, </mark>
          <br />
          <mark>scalable systems, and building tools</mark>
          <br />
          <mark> that feel fast and thoughtful</mark>
          <br />
          <mark>based in az</mark>
        </p>
      </div>
    </main>
  );
}
