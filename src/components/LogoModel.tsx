"use client";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import { Group } from "three";
import { Center, useGLTF } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";

type Props = {
  scale?: number;
  /** limit how far it can tilt (radians). e.g. 0.6 ≈ 34° */
  maxTilt?: number;
  /** how quickly it follows the cursor (higher = snappier) */
  followSpeed?: number;
  /** adjust if your model’s “front” isn’t +Z (in radians) */
  yawFix?: number; // rotate around Y
  pitchFix?: number; // rotate around X
};

export default function LogoModel({
  scale = 1,
  maxTilt = 0.6,
  followSpeed = 6,
  yawFix = Math.PI, // because three.js lookAt points -Z toward target; 180° yaw flips to +Z
  pitchFix = 0,
}: Props) {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF("/models/logo.glb");

  const { camera, pointer } = useThree();
  const tmp = useMemo(
    () => ({
      objPos: new THREE.Vector3(),
      worldPoint: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      qTarget: new THREE.Quaternion(),
      qFix: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(pitchFix, yawFix, 0)
      ),
      eul: new THREE.Euler(),
    }),
    [pitchFix, yawFix]
  );

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;

    // Project a point in front of the camera using the normalized pointer (-1..1)
    // Move it a few units away so small mouse motions produce nice rotations
    const depth = 5;
    tmp.worldPoint
      .set(pointer.x, pointer.y, 0.5) // NDC
      .unproject(camera)
      .sub(camera.position)
      .normalize()
      .multiplyScalar(depth)
      .add(camera.position);

    // Build a lookAt matrix from object to that point
    g.getWorldPosition(tmp.objPos);
    tmp.m.lookAt(tmp.objPos, tmp.worldPoint, g.up); // aligns -Z toward target
    tmp.qTarget.setFromRotationMatrix(tmp.m).multiply(tmp.qFix); // fix forward axis

    // OPTIONAL: clamp tilt so it never flips too far
    tmp.eul.setFromQuaternion(tmp.qTarget, "YXZ");
    tmp.eul.x = THREE.MathUtils.clamp(tmp.eul.x, -maxTilt, maxTilt);
    tmp.eul.y = THREE.MathUtils.clamp(tmp.eul.y, -maxTilt, maxTilt);
    tmp.qTarget.setFromEuler(tmp.eul);

    // Smoothly slerp toward target
    g.quaternion.slerp(tmp.qTarget, Math.min(1, dt * followSpeed));
  });

  return (
    <group ref={ref}>
      <Center>
        {/* Keep materials simple/monochrome so ASCII reads well */}
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

useGLTF.preload("/models/logo.glb");
