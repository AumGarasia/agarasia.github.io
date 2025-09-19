"use client";
import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";
import { AsciiRenderer } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import LogoModel from "@/components/LogoModel";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

function ResponsiveAscii() {
  const { size } = useThree();
  // So the AsciiRenderer remounts cleanly when the canvas size changes
  const key = `${Math.floor(size.width)}x${Math.floor(size.height)}`;

  // Slightly adapt resolution with width (clamped)
  const res = useMemo(() => {
    const base = (size.width / 1440) * 0.18;
    return Math.max(0.12, Math.min(0.26, base));
  }, [size.width]);

  return (
    <AsciiRenderer
      key={key}
      fgColor="#000000"
      bgColor="transparent"
      characters="#&%=*+-:."
      resolution={res}
    />
  );
}

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

function ResponsiveLogo() {
  const group = useRef<THREE.Group>(null!);

  // Subscribe to viewport so it updates when size/aspect/camera change
  const viewport = useThree((state) => state.viewport); // reactive
  const cameraZ = useThree((state) => state.camera.position.z); // in case you change it

  useFrame(() => {
    const vw = viewport.width; // world units across @ z=0
    const vh = viewport.height; // world units tall @ z=0

    // --- preferred placement (percentage of viewport) ---
    const prefX = vw * 0.3; // right ~30% from center
    const prefY = vh * 0.28; // a slight lift
    const prefS = Math.max(vw, vh) * 0.6;

    // --- margins from edges (world units) ---
    const mx = vw * 0.04; // 4% horizontal margin

    // --- clamp to *current* viewport so it never leaves screen ---
    const x = clamp(-1, prefX, vw - mx * 2);
    const y = prefY;

    // apply
    if (group.current) {
      group.current.position.set(x, y, 0);
      group.current.scale.setScalar(prefS);
      // keep your slight left turn
      group.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={group}>
      <LogoModel maxTilt={0.2} followSpeed={3.5} />
    </group>
  );
}

export default function AsciiHero() {
  return (
    <div
      className="ascii-root absolute inset-0 -z-10"
      style={{
        width: "100%",
        height: "100%",
        background: "#F9F9F9",
        pointerEvents: "none", // keeps it purely decorative
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2], fov: 50 }}
        style={{
          width: "100%",
          height: "100%",
          fontSize: "2rem",
          fontFamily: "helvetica",
          fontWeight: 800,
        }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[1.18, 0.1, -2]} intensity={0.95} />

        <Suspense fallback={null}>
          <ResponsiveLogo />
        </Suspense>

        <ResponsiveAscii />
      </Canvas>
    </div>
  );
}
