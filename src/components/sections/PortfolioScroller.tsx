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
import type { WebGLRenderer } from "three"; // ⬅️ add this type
import Laptop from "@/components/models/Laptop";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

// Scroll span for the scroller
const SCROLL_LENGTH_SVH = 800;

// Fade timing (as a fraction of the Intro height scrolled past)
const INTRO_FADE_START = 0.2; // begin fade ~last third of Intro
const INTRO_FADE_END = 0.21; // fully black before Intro finishes
const SCROLLER_FADE_KICKIN = 0.2; // ensure opacity >0 as soon as scroller begins

const easeInOut = (t: number) =>
  0.5 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t))));

function InvalidateOnChange({ value }: { value: unknown }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [value, invalidate]);
  return null;
}

function CenteredLaptop({
  openDeg,
  timeline,
}: {
  openDeg: number;
  timeline: number;
}) {
  const scale = 0.4;
  return (
    <group position={[0, -1, 0]} scale={scale}>
      <Laptop yaw={0} openDeg={openDeg} timeline={timeline} />
    </group>
  );
}

function progressToOpenDeg(progress: number) {
  const min = 1,
    max = 110,
    START = 0.02,
    END = 0.98;
  const p =
    progress <= START
      ? 0
      : progress >= END
      ? 1
      : (progress - START) / (END - START);
  const eased = easeInOut(p);
  return min + (max - min) * eased;
}

export default function PortfolioScroller() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  const measure = useCallback(() => {
    const sec = sectionRef.current;

    // Find the actual Introduction element (skip our own overlay sibling)
    let intro: HTMLElement | null = null;
    if (sec) {
      const prev = sec.previousElementSibling as HTMLElement | null;
      if (prev?.dataset?.portfolioOverlay !== undefined) {
        intro = prev.previousElementSibling as HTMLElement | null;
      } else {
        intro = prev;
      }
      if (!intro)
        intro = sec.parentElement?.previousElementSibling as HTMLElement | null;
    }

    // --- scroller progress ---
    let scrollerProgress = 0;
    let scrollerPinned = false;
    if (sec) {
      const rect = sec.getBoundingClientRect();
      const vh = Math.max(1, window.innerHeight);
      const total = Math.max(1, rect.height - vh);
      scrollerProgress = Math.min(1, Math.max(0, -rect.top / total));
      scrollerPinned = rect.top <= 0 && rect.bottom >= vh;
    }

    // --- how far past the intro we’ve scrolled (0..1) ---
    let introPast = 0;
    if (intro) {
      const r = intro.getBoundingClientRect();
      const h = Math.max(1, r.height);
      introPast = Math.min(1, Math.max(0, -r.top / h));
    }

    return { scrollerProgress, scrollerPinned, introPast };
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      const { scrollerProgress, scrollerPinned, introPast } = measure();
      setProgress(scrollerProgress);

      // Fade from Intro tail (INTRO_FADE_START..END)
      let fadeFromIntro = 0;
      if (introPast >= INTRO_FADE_START) {
        const t =
          (introPast - INTRO_FADE_START) / (INTRO_FADE_END - INTRO_FADE_START);
        fadeFromIntro = Math.min(1, Math.max(0, t));
      }

      // Safety fade as soon as scroller begins
      const fadeFromScroller = Math.min(
        1,
        Math.max(0, scrollerProgress / SCROLLER_FADE_KICKIN)
      );

      const targetOpacity = scrollerPinned
        ? 1
        : Math.max(fadeFromIntro, fadeFromScroller);
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

  const handleCreated = useCallback(({ gl }: { gl: WebGLRenderer }) => {
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMapping = NoToneMapping;
    gl.setPixelRatio(1);
  }, []);

  return (
    <>
      {/* Mark the overlay so we can skip it when searching for the Intro element */}
      <div
        data-portfolio-overlay
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 ease-out will-change-[opacity]"
        style={{ opacity: overlayOpacity }}
      >
        <div className="absolute inset-0 bg-black" />
        <Canvas
          camera={{ position: [0, 0.5, 8], fov: 45 }}
          frameloop="demand"
          dpr={1}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={handleCreated}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 3, 0]} intensity={0.8} />
          <Suspense fallback={null}>
            <InvalidateOnChange value={[openDeg, progress]} />
            <CenteredLaptop openDeg={openDeg} timeline={progress} />
          </Suspense>
        </Canvas>
      </div>

      {/* Scroller driver after Introduction */}
      <section ref={sectionRef} className="relative w-full">
        <div style={{ height: `${SCROLL_LENGTH_SVH}svh` }} />
      </section>
    </>
  );
}
