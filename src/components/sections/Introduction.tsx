// components/Introduction.tsx
import AsciiHero from "../AsciiHero";
import ScrollHint from "../ScrollHint";

export default function Introduction() {
  return (
    <section
      className="
        relative isolate
        w-full min-h-[100svh]
        overflow-hidden
      "
    >
      {/* ASCII background, sits behind */}
      <AsciiHero />

      {/* Name Headings */}
      <div className="absolute inset-0 z-10">
        <div className="absolute left-0 top-[20%] w-full min-h-[100svh]">
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
      </div>

      {/* Tagline (still absolute, but now relative to this section) */}
      <div
        className="absolute z-20 pointer-events-none select-none"
        style={{
          right: "4.5vw",
          top: "61vh",
          fontSize: "1.28vw",
          lineHeight: 1.4,
          maxWidth: "42ch",
          textAlign: "center",
          border: "1px solid transparent",
        }}
      >
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

      <ScrollHint />
    </section>
  );
}
