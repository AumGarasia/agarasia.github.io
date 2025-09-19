// src/components/models/Laptop.tsx
"use client";

import { useGLTF } from "@react-three/drei";
import {
  SRGBColorSpace,
  Box3,
  Vector3,
  MathUtils,
  type Mesh,
  type Texture,
  type MeshStandardMaterial,
  type MeshPhysicalMaterial,
} from "three";
import { useMemo } from "react";

type Props = JSX.IntrinsicElements["group"] & {
  /** Scene framing; doesn't affect open/close */
  yaw?: number; // default -0.3
  scaleScalar?: number; // default 1
  /** Degrees to open the lid (1..110 typical) */
  openDeg: number;
};

export default function Laptop({
  yaw = -0.3,
  scaleScalar,
  openDeg,
  ...props
}: Props) {
  const { scene } = useGLTF("/models/laptop.glb");

  const { lidClones, baseClones, hingePos } = useMemo(() => {
    const root = scene.clone(true);
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    root.scale.set(1, 1, 1);
    root.updateMatrixWorld(true);

    const lidHints = ["lid", "screen", "display", "monitor"];
    const baseHints = [
      "keyboard",
      "base",
      "body",
      "chassis",
      "bottom",
      "trackpad",
      "palm",
      "touchpad",
    ];

    type Item = { mesh: Mesh; name: string; centerY: number };
    const items: Item[] = [];
    const tmpCenter = new Vector3();
    const tmpBox = new Box3();

    root.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;

      // r152+ color space fix for baseColor
      const mat =
        (mesh.material as
          | MeshStandardMaterial
          | MeshPhysicalMaterial
          | null
          | undefined) ?? null;
      const baseMap = (mat && (mat as any).map) as Texture | undefined;
      if (baseMap && baseMap.colorSpace !== SRGBColorSpace) {
        baseMap.colorSpace = SRGBColorSpace;
        baseMap.needsUpdate = true;
      }

      tmpBox.setFromObject(mesh);
      tmpBox.getCenter(tmpCenter);
      items.push({
        mesh,
        name: (mesh.name || "").toLowerCase(),
        centerY: tmpCenter.y,
      });
    });

    // Name-based split
    const nameMatches = (name: string, pats: string[]) =>
      pats.some((p) => p && name.includes(p.toLowerCase()));
    const lidMeshes: Mesh[] = [];
    const baseMeshes: Mesh[] = [];
    const unknown: Item[] = [];

    for (const it of items) {
      if (nameMatches(it.name, lidHints)) lidMeshes.push(it.mesh);
      else if (nameMatches(it.name, baseHints)) baseMeshes.push(it.mesh);
      else unknown.push(it);
    }

    // Fallback by median Y
    if (unknown.length) {
      const ys = unknown.map((u) => u.centerY).sort((a, b) => a - b);
      const median = ys[Math.floor(ys.length / 2)];
      for (const u of unknown)
        (u.centerY >= median ? lidMeshes : baseMeshes).push(u.mesh);
    }

    const cloneWithWorldXform = (m: Mesh) => {
      m.updateWorldMatrix(true, false);
      const c = m.clone();
      c.geometry = m.geometry;
      c.material = m.material;
      c.matrix.copy(m.matrixWorld);
      c.matrix.decompose(c.position, c.quaternion, c.scale);
      c.matrixAutoUpdate = true;
      c.updateMatrixWorld(true);
      return c;
    };

    const lidClones = lidMeshes.map(cloneWithWorldXform);
    const baseClones = baseMeshes.map(cloneWithWorldXform);

    // Hinge at bottom of lid bbox, centered X/Z
    const lidBox = new Box3();
    const tmp = new Box3();
    for (const c of lidClones) {
      c.updateMatrixWorld(true);
      tmp.setFromObject(c);
      lidBox.union(tmp);
    }
    const hingePos = new Vector3(
      (lidBox.min.x + lidBox.max.x) * 0.5,
      lidBox.min.y,
      (lidBox.min.z + lidBox.max.z) * 0.5
    );

    return { lidClones, baseClones, hingePos };
  }, [scene]);

  // Clamp and map: 0->closed, 90->upright, we use 1..110 range
  const clamped = MathUtils.clamp(openDeg, 1, 110);
  const rad = MathUtils.degToRad(90 - clamped);

  return (
    <group {...props} rotation={[0, yaw, 0]} scale={scaleScalar ?? 1}>
      {/* Lid rotates around hinge (no levitation) */}
      <group
        position={[hingePos.x, hingePos.y, hingePos.z]}
        rotation={[rad, 0, 0]}
      >
        <group position={[-hingePos.x, -hingePos.y, -hingePos.z]}>
          {lidClones.map((obj, i) => (
            <primitive key={`lid-${i}`} object={obj} />
          ))}
        </group>
      </group>

      {/* Base stays fixed */}
      {baseClones.map((obj, i) => (
        <primitive key={`base-${i}`} object={obj} />
      ))}
    </group>
  );
}

useGLTF.preload("/models/laptop.glb");
