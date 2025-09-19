"use client";

import { useEffect, useState } from "react";

const HINT_FADE_VH = 0.23; // fully gone after scrolling 23% of the viewport

export default function ScrollHint() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      const vh = Math.max(1, window.innerHeight);
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      // progress through first 23% of a viewport
      const p = y / (vh * HINT_FADE_VH);
      const o = Math.max(0, Math.min(1, 1 - p));
      setOpacity(o);
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    // initial calc + listeners
    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <div
      className="fixed bottom-[51%] inset-x-0 z-40 flex justify-center"
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        opacity,
        transition: "opacity 140ms linear",
        willChange: "opacity",
      }}
    >
      {/* group so hover propagates */}
      <div className="group bg-white rounded-full px-3 py-2 shadow-sm ring-1 ring-black/10 flex flex-col items-center gap-2 pointer-events-auto">
        {/* mouse outline */}
        <div className="relative w-6 h-10 border-2 border-black rounded-full">
          {/* inner wheel */}
          <div className="absolute left-3.5 -translate-x-1 top-1 w-2 h-3 bg-black rounded-full wheel" />
        </div>

        {/* label only on hover */}
        <span className="hidden group-hover:inline bg-white text-[10px] uppercase tracking-wider text-black fade font-mono">
          <mark id="text" className="bg-transparent">
            scroll
          </mark>
        </span>
      </div>

      <style jsx global>{`
        @keyframes wheel-bounce {
          0% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          60% {
            transform: translate(-50%, 14px);
            opacity: 0.65;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .wheel {
          animation: wheel-bounce 1.25s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @keyframes fade-breathe {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }
        .fade {
          animation: fade-breathe 2.2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .wheel,
          .fade {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
