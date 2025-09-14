// src/components/AsciiHero.tsx
"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OrbitControls, Float, AsciiRenderer } from "@react-three/drei";

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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0"
      style={{ width: "100dvw", height: "100dvh" }}
    >
      <Canvas
        camera={{ position: [0, 0, 3] }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.9} />
        <Float speed={2} floatIntensity={1.2}>
          <mesh>
            <torusGeometry args={[1.1, 0.35, 32, 128]} />
            <meshStandardMaterial
              color="#111111"
              metalness={0.1}
              roughness={0.85}
            />
          </mesh>
        </Float>
        <OrbitControls enablePan={false} enableZoom={false} />
        {ascii && (
          <AsciiRenderer
            fgColor="#111111" // or "#ffffff" if you're on a dark bg
            bgColor="transparent" // keep page background
            characters="&%*+=-:."
            resolution={0.18}
          />
        )}
      </Canvas>
    </div>
  );
}
