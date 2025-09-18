// src/components/sections/PortfolioScroller.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { SRGBColorSpace, NoToneMapping } from "three";
import Laptop from "@/components/models/Laptop";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

/** Scales the model relative to viewport so it feels consistent across sizes */
function CenteredLaptop({ open }: { open: number }) {
  const scale = 0.4; // tweak to taste

  return (
    <group position={[0, -1.2, 0]} scale={scale}>
      <Laptop yaw={0} levitateGap={0} openDeg={90} />
    </group>
  );
}

/** Get scroll progress (0..1) for a sticky section */
function useStickyProgress(sectionRef: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // When the sticky fills the viewport, we treat progress by how far the section’s
      // total height (including the driver div) has been traversed.
      // rect.top goes from 0 (top pinned) to -sectionHeight as we scroll past.
      const sectionHeight = el.scrollHeight; // includes sticky + driver
      const traveled = Math.min(Math.max(-rect.top, 0), sectionHeight - vh);
      const denom = Math.max(sectionHeight - vh, 1);
      const p = traveled / denom;
      setProgress(Math.min(Math.max(p, 0), 1));
    };

    // Initial + listeners
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionRef]);

  return progress;
}

export default function PortfolioScroller() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useStickyProgress(sectionRef);

  const handleCreated = useCallback(({ gl }) => {
    // Minimal, stable GL settings
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMapping = NoToneMapping; // cheapest pipeline
    gl.setPixelRatio(1); // DPR=1 for stability
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* sticky/pinned canvas */}
      <div className="sticky top-0 h-[100svh]">
        <Canvas
          camera={{ position: [0, 0.5, 8], fov: 45 }}
          dpr={1}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
          }}
          frameloop="always"
          onCreated={handleCreated}
        >
          {/* simple background + lights */}
          <color attach="background" args={["#f6f6f6"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 3, 0]} intensity={0.8} />
          <Suspense fallback={null}>
            <CenteredLaptop open={progress} />
          </Suspense>
        </Canvas>
      </div>

      {/* driver height → how long the scroll animation lasts */}
      <div style={{ height: "140vh" }} />
    </section>
  );
}
