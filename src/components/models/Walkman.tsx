// src/components/models/Walkman.tsx
"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Walkman({ scale = 1 }: { scale?: number }) {
  const { scene } = useGLTF("/models/walkman.glb");
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.5; // idle
  });
  return (
    <group ref={ref} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
