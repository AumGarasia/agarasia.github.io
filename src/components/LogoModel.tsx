"use client";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";

type Props = {
  scale?: number;
  maxTilt?: number; // radians, e.g. 0.55
  followSpeed?: number; // 3..10
  yawFix?: number; // adjust if your model's +Z isn't the "front"
  pitchFix?: number;
  position?: [number, number, number]; // allow XY shift of the logo
};

export default function LogoModel({
  scale = 1,
  maxTilt = 0.55,
  followSpeed = 7,
  yawFix = Math.PI, // drei/three: lookAt points -Z to target; flip to +Z
  pitchFix = 0,
  position = [0, 0, 0],
}: Props) {
  const root = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/logo.glb");

  const { camera, pointer, size } = useThree();

  const tmp = useMemo(
    () => ({
      plane: new THREE.Plane(),
      ray: new THREE.Ray(),
      hit: new THREE.Vector3(),
      worldCenter: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      lookMat: new THREE.Matrix4(),
      qTarget: new THREE.Quaternion(),
      qFix: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(pitchFix, yawFix, 0)
      ),
      eul: new THREE.Euler(),
    }),
    [pitchFix, yawFix]
  );

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;

    // 1) Get the model's world center
    g.getWorldPosition(tmp.worldCenter);

    // 2) Build a plane through the model, perpendicular to camera direction
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir); // normalized
    tmp.plane.setFromNormalAndCoplanarPoint(camDir, tmp.worldCenter);

    // 3) From normalized device coords -> world ray -> plane intersection
    // pointer.x/y are already -1..1 in R3F
    tmp.ray.origin.copy(camera.position);
    tmp.ray.direction
      .set(pointer.x, pointer.y, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();

    tmp.ray.intersectPlane(tmp.plane, tmp.hit);
    if (!tmp.hit) return;

    // 4) Look from model to hit point (aligns -Z to target), then fix forward axis
    tmp.lookMat.lookAt(tmp.worldCenter, tmp.hit, tmp.up);
    tmp.qTarget.setFromRotationMatrix(tmp.lookMat).multiply(tmp.qFix);

    // 5) Optional symmetric clamp of pitch/yaw
    tmp.eul.setFromQuaternion(tmp.qTarget, "YXZ");
    tmp.eul.x = THREE.MathUtils.clamp(tmp.eul.x, -maxTilt, maxTilt);
    tmp.eul.y = THREE.MathUtils.clamp(tmp.eul.y, -maxTilt, maxTilt);
    tmp.qTarget.setFromEuler(tmp.eul);

    // 6) Smoothly slerp
    g.quaternion.slerp(tmp.qTarget, Math.min(1, dt * followSpeed));
  });

  return (
    <group ref={root} position={position}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

useGLTF.preload("/models/logo.glb");
