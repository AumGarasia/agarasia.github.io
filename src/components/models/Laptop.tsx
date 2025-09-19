// src/components/models/Laptop.tsx
"use client";

import { JSX, useEffect, useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
} from "three";

type Props = JSX.IntrinsicElements["group"] & {
  /** Face the viewer a bit */
  yaw?: number;
  /** Opening angle in degrees [1..110] (1 ≈ closed, 110 ≈ open) */
  openDeg?: number;
  /** 0..1: 0 offscreen below → 1 fully in place (rise-in) */
  timeline?: number;
  /** Optional uniform scale override (world units) */
  scaleScalar?: number;
};

// utils
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/** Heuristic: try to find a lid/screen node */
function findLidNode(root: Object3D): Object3D | null {
  const NAME_RE = /(lid|screen|display|monitor|top|lid_geo)/i;
  let found: Object3D | null = null;
  root.traverse((o) => {
    if (found) return;
    if (NAME_RE.test(o.name)) found = o;
  });
  return found;
}

export default function Laptop({
  yaw = 0,
  openDeg = 1,
  timeline = 1,
  scaleScalar,
  ...props
}: Props) {
  // recommended path: /public/models/laptop.glb
  const { scene } = useGLTF("/models/laptop.glb");
  const invalidate = useThree((s) => s.invalidate);

  // sRGB textures
  useEffect(() => {
    scene.traverse((o) => {
      if ((o as Mesh).isMesh) {
        const m = (o as Mesh).material as MeshStandardMaterial;
        if (m && "map" in m && m.map) {
          // modern three: use colorSpace
          m.map.colorSpace = SRGBColorSpace;
          m.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  // Yaw
  useEffect(() => {
    scene.rotation.y = yaw;
  }, [scene, yaw]);

  // Find the lid once
  const lid = useMemo(() => findLidNode(scene), [scene]);

  // Apply opening angle BEFORE paint so initial frame is correct.
  useLayoutEffect(() => {
    if (!lid) return;

    // Keep your existing mapping…
    const s = clamp01((openDeg - 1) / 109); // 0 at 1°, 1 at 110°
    let radians = -MathUtils.degToRad(110 * s); // negative X opens the lid

    // …then just decrease by 90° to offset the GLB’s rest pose (~90° open)
    const HINGE_OFFSET_DEG = 90;
    radians += MathUtils.degToRad(HINGE_OFFSET_DEG);

    lid.rotation.x = radians;
    invalidate(); // frameloop="demand" → re-render
  }, [lid, openDeg, invalidate]);

  // Rise-in: first ~35% of timeline
  const RISE_END = 0.1;
  const t = easeOutCubic(clamp01(timeline / RISE_END));
  const entryY = lerp(-6, 0, t);
  const entryScale = lerp(0.96, 1.0, t);

  return (
    <group {...props} scale={scaleScalar ?? 1}>
      <group position={[0, entryY, 0]} scale={entryScale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/laptop.glb");
