"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { AsciiRenderer } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import LogoModel from "@/components/LogoModel";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

function SafeAscii() {
  const { size } = useThree();
  const w = Math.floor(size.width);
  const h = Math.floor(size.height);

  if (!(w > 0 && h > 0 && Number.isFinite(w) && Number.isFinite(h)))
    return null;

  return (
    <AsciiRenderer
      fgColor="#000000"
      bgColor="transparent"
      characters="&%*+=-:."
      resolution={0.2}
      key={`${w}x${h}`} // remount cleanly on resize
    />
  );
}

export default function AsciiHero() {
  const [ascii, setAscii] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "a") setAscii((v) => !v);
    };
    // window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="ascii-root fixed inset-0 z-0"
      style={{
        width: "100dvw",
        height: "100dvh",
        background: "#F9F9F9",
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 1] }}
        style={{
          width: "100%",
          height: "100%",
          fontSize: "2rem",
          fontFamily: "helvetica",
          fontWeight: 800,
        }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[1.6, 0, 5]} intensity={0.35} />

        {/* Logo */}
        <Suspense fallback={null}>
          <group position={[0.8, 0.07, 0]}>
            <LogoModel scale={2.4} maxTilt={0.1} followSpeed={3.5} />
          </group>
        </Suspense>

        {ascii && <SafeAscii />}
      </Canvas>
    </div>
  );
}
