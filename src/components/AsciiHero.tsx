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
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.35} />
        {/*<directionalLight position={[0, 0, 0]} intensity={0.95} />*/}
        <directionalLight position={[0, 0, 5]} intensity={0.35} />

        {/* Your logo */}
        <Suspense fallback={null}>
          <LogoModel scale={4.5} maxTilt={0.4} followSpeed={3.5} />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} />

        {ascii && (
          <AsciiRenderer
            fgColor="#111111" // or "#ffffff" if you're on a dark bg
            bgColor="transparent" // keep page background
            characters="#@&%*+=-:."
            resolution={0.12}
          />
        )}
      </Canvas>
    </div>
  );
}
