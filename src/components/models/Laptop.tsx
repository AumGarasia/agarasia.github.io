// src/components/sections/PortfolioScroller.tsx
"use client";

import dynamic from "next/dynamic";
import { useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SRGBColorSpace, NoToneMapping } from "three";
import Laptop from "@/components/models/Laptop";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

/** Triggers a render when `value` changes (works with frameloop="demand") */
function InvalidateOnChange({ value }: { value: unknown }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [value, invalidate]);
  return null;
}

/** Scales the model relative to viewport so it feels consistent across sizes */
function CenteredLaptop({ openDeg }: { openDeg: number }) {
  const viewport = useThree((s) => s.viewport);
  const base = Math.max(viewport.width, viewport.height);
  const scale = base * 0.55; // tweak to taste

  return (
    <group position={[0, -0.2, 0]} scale={scale}>
      <Laptop yaw={-0.32} openDeg={openDeg} />
    </group>
  );
}

/** Map section scroll progress (0..1) -> degrees [1..110] */
function progressToOpenDeg(progress: number) {
  const min = 1;
  const max = 110;
  const p = Math.min(1, Math.max(0, progress));
  return min + (max - min) * p;
}

export default function PortfolioScroller() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  const measure = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // Sticky top:0 → progress goes 0 when section top hits viewport top,
    // and 1 when section bottom hits viewport bottom.
    const total = Math.max(1, rect.height - vh);
    const raw = -rect.top / total;
    return Math.min(1, Math.max(0, raw));
  }, []);

  useEffect(() => {
    const onScroll = () => setProgress(measure());
    const onResize = () => setProgress(measure());

    // Initialize once mounted
    setProgress(measure());

    // Passive listeners for perf
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [measure]);

  const openDeg = useMemo(() => progressToOpenDeg(progress), [progress]);

  const handleCreated = useCallback(({ gl }) => {
    // Minimal, stable GL defaults (safe mode)
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMapping = NoToneMapping;
    gl.setPixelRatio(1);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* sticky/pinned canvas */}
      <div className="sticky top-0 h-[100svh]">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          frameloop="demand"
          dpr={1}
          gl={{
            antialias: true,
            alpha: true,
            // keep memory pressure low
            powerPreference: "low-power",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={handleCreated}
        >
          <color attach="background" args={["#f6f6f6"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={0.8} />
          <Suspense fallback={null}>
            <InvalidateOnChange value={openDeg} />
            <CenteredLaptop openDeg={openDeg} />
          </Suspense>
        </Canvas>
      </div>

      {/* Extended driver height for easy testing */}
      <div style={{ height: "300vh" }} />
    </section>
  );
}
