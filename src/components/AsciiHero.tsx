"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { useEffect, useRef } from "react";

/** Minimal placeholder: floating torus + high-contrast for ASCII overlay later */
export default function AsciiHero() {
  return (
    <div className="h-[60vh] w-full bg-black rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
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
      </Canvas>
    </div>
  );
}
