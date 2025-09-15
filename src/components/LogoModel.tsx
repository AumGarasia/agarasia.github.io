"use client";
import { useRef } from "react";
import { Group } from "three";
import { Center, Float, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

type Props = { scale?: number; rotationY?: number };

export default function LogoModel({ scale = 1, rotationY = 0 }: Props) {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF("/models/logo.glb"); // place file in public/models/

  // slow idle turn (looks great in ASCII)
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0; // ~15°/s
  });

  return (
    <group ref={ref} rotation-y={rotationY}>
      <Center>
        {/* keep it monochrome so ASCII reads well */}
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

// helps Next/R3F preload
useGLTF.preload("/models/logo.glb");
