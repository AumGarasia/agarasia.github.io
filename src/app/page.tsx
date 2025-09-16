// page.tsx
import AsciiHero from "@/components/AsciiHero";
import MouseDot from "@/components/MouseDot";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/*ASCII background*/}
      <AsciiHero />
      {/* custom cursor */}
      <MouseDot />
      <div className="absolute z-10 flex min-h-screen w-full top-[20%] bottom-[20%] ">
        {/*<h1>Hello</h1>*/}
        <h1
          className="pointer-events-none absolute left-0 font-black tracking-tight select-none leading-none"
          style={{
            fontSize: "20vw",
            fontFamily: "Grotesque Sans, Helvetica Neue Black, Inter Black",
          }}
        >
          aum
        </h1>

        <h1
          className="pointer-events-none absolute left-0 font-black tracking-tight select-none leading-none"
          style={{
            fontSize: "21vw",
            top: "10.5vw",
            fontFamily: "Grotesque Sans, Helvetica Neue Black, Inter Black",
          }}
        >
          garasia
        </h1>
      </div>

      {/* small bio aligned to top-right */}
      <div
        className="absolute z-30 pointer-events-none select-none"
        style={{
          right: "4.5vw",
          top: "clamp(30vh, calc(20vh + 20vw), 61vh)",
          fontSize: "1.28vw ",
          lineHeight: 1.4,
          maxWidth: "42ch",
          textAlign: "center",
        }}
      >
        {/* 61vh */}
        <p>
          <mark id="text">full-stack engineer who loves creative UX, </mark>
          <br />
          <mark id="text">scalable systems, and building tools</mark>
          <br />
          <mark id="text">
            that feel fast and thoughtful and <u>a little human.</u>
          </mark>
          <br />
          <mark id="text">
            based in <b>az</b>
          </mark>
        </p>
      </div>
    </main>
  );
}
