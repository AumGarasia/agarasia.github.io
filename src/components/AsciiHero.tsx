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
    <div className="h-[60vh] w-full overflow-hidden rounded-2xl bg-black">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.6} />
        <Float speed={2} floatIntensity={2}>
          <mesh>
            <torusKnotGeometry args={[0.8, 0.28, 128, 32]} />
            <meshStandardMaterial
              metalness={0.4}
              roughness={0.25}
              color="#9AE6B4"
            />
          </mesh>
        </Float>
        <OrbitControls enablePan={false} />
        {ascii && <AsciiRenderer characters=" .:-=+*#%@" />}
      </Canvas>
      <div className="pointer-events-none absolute right-4 top-4 rounded-md border border-neutral-800 bg-neutral-950/80 px-2 py-1 text-xs text-neutral-400">
        Press <kbd className="rounded bg-neutral-900 px-1">A</kbd> for ASCII
      </div>
    </div>
  );
}
