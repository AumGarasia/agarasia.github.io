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

const SCROLL_LENGTH_SVH = 1200;

const easeInOut = (t: number) =>
  0.5 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t))));

function InvalidateOnChange({ value }: { value: unknown }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [value, invalidate]);
  return null;
}

function CenteredLaptop({ openDeg }: { openDeg: number }) {
  const scale = 0.4;
  return (
    <group position={[0, -1, 0]} scale={scale}>
      <Laptop yaw={0} openDeg={openDeg} />
    </group>
  );
}

function progressToOpenDeg(progress: number) {
  const min = 1;
  const max = 110;
  const START = 0.02;
  const END = 0.98;
  const p =
    progress <= START
      ? 0
      : progress >= END
      ? 1
      : (progress - START) / (END - START);
  const eased = easeInOut(p);
  return min + (max - min) * eased;
}

function visibleRatio(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const vh = Math.max(1, window.innerHeight);
  const visible = Math.max(
    0,
    Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
  );
  return Math.min(1, Math.max(0, visible / Math.max(1, rect.height)));
}

export default function PortfolioScroller() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0); // animate this only

  const measure = useCallback(() => {
    const sec = sectionRef.current;
    const intro = sec?.previousElementSibling as HTMLElement | null;

    let progress = 0;
    let scrollerPinned = false;
    let introRatio = 0;

    if (sec) {
      const rect = sec.getBoundingClientRect();
      const vh = Math.max(1, window.innerHeight);
      const total = Math.max(1, rect.height - vh);
      progress = Math.min(1, Math.max(0, -rect.top / total));
      scrollerPinned = rect.top <= 0 && rect.bottom >= vh;
    }
    if (intro) introRatio = visibleRatio(intro);

    return { progress, scrollerPinned, introRatio };
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      const { progress, scrollerPinned, introRatio } = measure();
      setProgress(progress);

      // Fade-in near end of Introduction; stay opaque while scroller is pinned.
      const START = 0.5; // begin fade (intro ≤ 50% visible)
      const END = 1 / 3; // fully black by one-third left

      let fadeFromIntro = 0;
      if (introRatio <= START) {
        fadeFromIntro = Math.min(
          1,
          Math.max(0, (START - introRatio) / (START - END))
        );
      }

      // If scroller is pinned, force opacity=1; otherwise use fadeFromIntro
      const targetOpacity = scrollerPinned ? 1 : fadeFromIntro;

      setOverlayOpacity(targetOpacity);
    };

    onUpdate();
    window.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate);
    return () => {
      window.removeEventListener("scroll", onUpdate);
      window.removeEventListener("resize", onUpdate);
    };
  }, [measure]);

  const openDeg = useMemo(() => progressToOpenDeg(progress), [progress]);

  const handleCreated = useCallback(({ gl }) => {
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMapping = NoToneMapping;
    gl.setPixelRatio(1);
  }, []);

  return (
    <>
      {/* Always mounted; we only animate opacity. No visibility toggles. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 ease-out will-change-[opacity]"
        style={{ opacity: overlayOpacity }}
      >
        {/* Black HTML fade under the transparent Canvas */}
        <div className="absolute inset-0 bg-black" />

        <Canvas
          camera={{ position: [0, 0.5, 8], fov: 45 }}
          frameloop="demand"
          dpr={1}
          gl={{
            antialias: true,
            alpha: true, // keep transparent so the HTML black layer shows
            //powerPreference: "low-power",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={handleCreated}
        >
          {/* No <color attach="background" /> so the black layer can show */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 3, 0]} intensity={0.8} />
          <Suspense fallback={null}>
            <InvalidateOnChange value={openDeg} />
            <CenteredLaptop openDeg={openDeg} />
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll driver lives in normal flow after Introduction */}
      <section ref={sectionRef} className="relative w-full">
        <div style={{ height: `${SCROLL_LENGTH_SVH}svh` }} />
      </section>
    </>
  );
}
