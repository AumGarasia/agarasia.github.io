// components/Introduction.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AsciiHero from "../AsciiHero";
import ScrollHint from "../ScrollHint";

// tweak these to taste
const INVERT_START = 0.01; // start inverting when 50% of the section has been scrolled
const INVERT_END = 0.1; // fully inverted by 90%

export default function Introduction() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [invertAmt, setInvertAmt] = useState(0); // 0..1

  const measure = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;

    const rect = el.getBoundingClientRect();
    const h = Math.max(1, rect.height);

    // progress through this section: 0 when top hits viewport top, 1 after one full section height
    const p = Math.min(1, Math.max(0, -rect.top / h));

    // map p in [INVERT_START, INVERT_END] -> [0, 1]
    if (p <= INVERT_START) return 0;
    if (p >= INVERT_END) return 1;
    return (p - INVERT_START) / (INVERT_END - INVERT_START);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setInvertAmt(measure()));
    };

    onUpdate();
    window.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onUpdate);
      window.removeEventListener("resize", onUpdate);
    };
  }, [measure]);

  // Gradual invert + hue-rotate for pleasant color inversion
  const hue = invertAmt * 180; // 0..180deg
  const filter = `invert(${invertAmt}) hue-rotate(${hue}deg)`;

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full min-h-[200svh] overflow-hidden"
      style={{
        filter,
        transition: "filter 120ms linear",
        willChange: "filter",
      }}
    >
      {/* ASCII background, sits behind */}
      <AsciiHero />

      {/* Name Headings */}
      <div className="absolute inset-0 z-10">
        <div className="absolute left-0 top-[10%] w-full min-h-[100svh]">
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

      {/* Tagline */}
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
