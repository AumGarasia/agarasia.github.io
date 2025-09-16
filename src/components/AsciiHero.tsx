"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { OrbitControls, AsciiRenderer } from "@react-three/drei";
import LogoModel from "@/components/LogoModel";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

export default function AsciiHero() {
  const [ascii, setAscii] = useState(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "a") setAscii((v) => !v);
    };
    //window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0"
      style={{ width: "100dvw", height: "100dvh" }}
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
        {/*<directionalLight position={[0, 0, 0]} intensity={0.95} />*/}
        <directionalLight position={[1.6, 0, 5]} intensity={0.35} />

        {/* Your logo */}
        <Suspense fallback={null}>
          <group position={[0.7, 0.2, 0]}>
            <LogoModel scale={2.4} maxTilt={0.1} followSpeed={3.5} />
          </group>
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} />

        {ascii && (
          <AsciiRenderer
            fgColor="#000000" // or "#ffffff" if you're on a dark bg
            bgColor="transparent" // keep page background
            characters="&%*+=-:."
            resolution={0.13}
          />
        )}
      </Canvas>
    </div>
  );
}
