"use client";

import { JSX, useEffect, useLayoutEffect, useMemo } from "react";
import { invalidate } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  ClampToEdgeWrapping,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  VideoTexture,
} from "three";

type Props = JSX.IntrinsicElements["group"] & {
  yaw?: number;
  openDeg?: number; // [1..110]
  timeline?: number; // [0..1]
  scaleScalar?: number;

  // screen media
  screenSrc?: string;
  screenType?: "image" | "video";
  screenMaterial?: string | RegExp;
  screenTexture?: string | RegExp;
};

// utils
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  0.5 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t))));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const deg = (d: number) => (d * Math.PI) / 180;

// Heuristic helpers
function findNode(root: Object3D, re: RegExp): Object3D | null {
  let found: Object3D | null = null;
  root.traverse((o) => {
    if (found) return;
    if (re.test(o.name)) found = o;
  });
  return found;
}

type MatRef = { mesh: Mesh; index: number; material: Material };
function findMaterialRefs(
  root: Object3D,
  opts: { materialRE?: RegExp | null; textureRE?: RegExp | null }
): MatRef[] {
  const out: MatRef[] = [];
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as Material | Material[] | undefined;
    if (!mat) return;

    const mats = Array.isArray(mat) ? mat : [mat];
    mats.forEach((m, idx) => {
      const mName = (m.name || "").toString();
      const tName = ((m as any).map?.name || "").toString();
      const matchMat = opts.materialRE?.test(mName) ?? false;
      const matchTex = opts.textureRE?.test(tName) ?? false;
      if (matchMat || matchTex) out.push({ mesh, index: idx, material: m });
    });
  });
  return out;
}

export default function Laptop({
  yaw = 0,
  openDeg = 1,
  timeline = 1,
  scaleScalar,
  screenSrc,
  screenType = "image",
  screenMaterial,
  screenTexture,
  ...props
}: Props) {
  const { scene } = useGLTF("/models/laptop.glb");

  // Ensure GLB textures render in sRGB
  useEffect(() => {
    scene.traverse((o) => {
      if ((o as Mesh).isMesh) {
        const mat = (o as Mesh).material as any;
        const mats: Material[] = Array.isArray(mat) ? mat : mat ? [mat] : [];
        mats.forEach((m) => {
          const map = (m as any).map;
          if (map) {
            map.colorSpace = SRGBColorSpace;
            m.needsUpdate = true;
          }
        });
      }
    });
  }, [scene]);

  // === Lid open (your mapping + 90° offset) ===
  const lid = useMemo(
    () => findNode(scene, /(lid|screen|display|monitor|top|lid_geo)/i),
    [scene]
  );
  useLayoutEffect(() => {
    if (!lid) return;
    const s = clamp01((openDeg - 1) / 109); // 0 at 1°, 1 at 110°
    let radians = -MathUtils.degToRad(110 * s); // negative X opens the lid
    radians += MathUtils.degToRad(90); // GLB rest pose ~90° open
    lid.rotation.x = radians;
    invalidate();
  }, [lid, openDeg]);

  // === Rise-in (unchanged) ===
  const RISE_END = 0.3;
  const tRise = easeOutCubic(clamp01(timeline / RISE_END));
  const entryY = lerp(-10, 0, tRise);
  const entryScale = lerp(0.96, 1.0, tRise);

  // === Gallery path (center → left → right → left → center) ===
  const GALLERY_START = 0.3; // start when opening is essentially done
  const openGate = clamp01((openDeg - 100) / 10);

  const galleryLinear = clamp01(
    (timeline - GALLERY_START) / (1 - GALLERY_START)
  );
  const galleryT = easeInOut(galleryLinear * openGate); // 0..1

  // Key poses
  const CENTER_POS: [number, number, number] = [0, 0, 0];
  const LEFT_POS: [number, number, number] = [-9.5, 0, 0];
  const RIGHT_POS: [number, number, number] = [9.5, 0, 0];
  const YAW_CENTER = deg(0);
  const YAW_LEFT = deg(30);
  const YAW_RIGHT = deg(-30);

  // Break 0..1 into 4 equal segments (0..4), but never let it reach 4 exactly
  const SEGMENTS = 4;
  const seg = Math.min(galleryT * SEGMENTS, SEGMENTS - 1e-6); // <-- key line
  const phase = Math.floor(seg); // 0,1,2,3
  const s = easeInOut(seg - phase); // 0..1 within the phase

  let galleryPos: [number, number, number];
  let galleryYaw: number;

  switch (phase) {
    case 0: // center -> left
      galleryPos = [
        lerp(CENTER_POS[0], LEFT_POS[0], s),
        lerp(CENTER_POS[1], LEFT_POS[1], s),
        lerp(CENTER_POS[2], LEFT_POS[2], s),
      ];
      galleryYaw = lerp(YAW_CENTER, YAW_LEFT, s);
      break;
    case 1: // left -> right
      galleryPos = [
        lerp(LEFT_POS[0], RIGHT_POS[0], s),
        lerp(LEFT_POS[1], RIGHT_POS[1], s),
        lerp(LEFT_POS[2], RIGHT_POS[2], s),
      ];
      galleryYaw = lerp(YAW_LEFT, YAW_RIGHT, s);
      break;
    case 2: // right -> left
      galleryPos = [
        lerp(RIGHT_POS[0], LEFT_POS[0], s),
        lerp(RIGHT_POS[1], LEFT_POS[1], s),
        lerp(RIGHT_POS[2], LEFT_POS[2], s),
      ];
      galleryYaw = lerp(YAW_RIGHT, YAW_LEFT, s);
      break;
    default: // 3: left -> center
      galleryPos = [
        lerp(LEFT_POS[0], CENTER_POS[0], s),
        lerp(LEFT_POS[1], CENTER_POS[1], s),
        lerp(LEFT_POS[2], CENTER_POS[2], s),
      ];
      galleryYaw = lerp(YAW_LEFT, YAW_CENTER, s);
  }

  //galleryYaw += yaw; // keep external yaw ability

  // === Screen swap (image / video) ===
  useEffect(() => {
    if (!screenSrc) return;

    const normalizedSrc = screenSrc.startsWith("/")
      ? screenSrc
      : `/${screenSrc}`;
    const url = encodeURI(normalizedSrc);

    const screenRE = screenMaterial
      ? typeof screenMaterial === "string"
        ? new RegExp(screenMaterial, "i")
        : screenMaterial
      : /^screen(\.\d+)?$/i;

    const textureRE =
      typeof screenTexture === "string"
        ? new RegExp(screenTexture, "i")
        : screenTexture ?? null;

    const targets = findMaterialRefs(scene, {
      materialRE: screenRE,
      textureRE,
    });

    if (!targets.length) {
      console.warn("[Laptop] No screen materials matched.", { screenRE });
      return;
    }

    // Try to loosen any “glass/matte” overlay in front of the panel
    const overlayMats: MatRef[] = [];
    scene.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as Material | Material[] | undefined;
      const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
      mats.forEach((m, idx) => {
        const name = (m?.name || "").toString();
        if (/^(matte|glass)/i.test(name))
          overlayMats.push({ mesh, index: idx, material: m });
      });
    });

    let disposed = false;
    let tex: Texture | undefined;
    let videoEl: HTMLVideoElement | undefined;

    const showScreenTexture = (texture: Texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
      texture.flipY = false;
      texture.needsUpdate = true;

      targets.forEach(({ mesh, index }) => {
        const basic = new MeshBasicMaterial({ color: 0xffffff });
        (basic as any).toneMapped = false;
        (basic as any).map = texture;
        (basic as any).needsUpdate = true;
        basic.depthTest = false;
        basic.depthWrite = false;

        if (Array.isArray(mesh.material)) {
          const arr = mesh.material.slice();
          arr[index] = basic;
          mesh.material = arr;
        } else {
          mesh.material = basic;
        }
        mesh.renderOrder = 20;
      });

      overlayMats.forEach(({ mesh, index, material }) => {
        const m = material as any;
        m.transparent = true;
        m.opacity = Math.min(0.25, m.opacity ?? 1);
        m.depthWrite = false;
        m.needsUpdate = true;

        if (Array.isArray(mesh.material)) {
          const arr = mesh.material.slice();
          arr[index] = m;
          mesh.material = arr;
        } else {
          mesh.material = m;
        }
        mesh.renderOrder = Math.max(mesh.renderOrder ?? 0, 21);
      });

      invalidate();
    };

    if (screenType === "video") {
      videoEl = document.createElement("video");
      videoEl.muted = true;
      videoEl.setAttribute("muted", "");
      videoEl.playsInline = true;
      videoEl.setAttribute("playsinline", "");
      videoEl.loop = true;
      videoEl.preload = "auto";
      videoEl.src = url;

      tex = new VideoTexture(videoEl);
      tex.colorSpace = SRGBColorSpace;
      tex.flipY = false;
      tex.generateMipmaps = false;

      showScreenTexture(tex);

      const tryPlay = () => {
        videoEl!.play().catch(() => {});
      };
      if (videoEl.readyState >= 2) tryPlay();
      else videoEl.addEventListener("canplay", tryPlay, { once: true });

      // While the video is playing, keep invalidating (frameloop="demand")
      let rafId: number | null = null;
      const tick = () => {
        if (disposed) return;
        invalidate();
        rafId = requestAnimationFrame(tick);
      };
      const onPlay = () => {
        if (rafId == null) rafId = requestAnimationFrame(tick);
      };
      const onPause = () => {
        if (rafId != null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };
      videoEl.addEventListener("play", onPlay);
      videoEl.addEventListener("pause", onPause);
      videoEl.addEventListener("ended", onPause);
      if (!videoEl.paused) onPlay();

      return () => {
        disposed = true;
        if (rafId != null) cancelAnimationFrame(rafId);
        videoEl?.removeEventListener("play", onPlay);
        videoEl?.removeEventListener("pause", onPause);
        videoEl?.removeEventListener("ended", onPause);
        try {
          videoEl?.pause();
          if (videoEl) {
            videoEl.src = "";
            videoEl.load?.();
          }
        } catch {}
        tex?.dispose?.();
      };
    } else {
      const loader = new TextureLoader();
      loader.load(
        url,
        (loaded) => {
          if (disposed) return;
          tex = loaded;
          showScreenTexture(loaded);
        },
        undefined,
        (err) => {
          console.error("[Laptop] Failed to load texture:", url, err);
        }
      );

      return () => {
        disposed = true;
        tex?.dispose?.();
      };
    }
  }, [scene, screenSrc, screenType, screenMaterial, screenTexture]);

  return (
    <group {...props} scale={scaleScalar ?? 1}>
      {/* rise-in container */}
      <group position={[0, entryY, 0]} scale={entryScale}>
        {/* gallery transform on top of rise-in */}
        <group position={galleryPos} rotation={[0, galleryYaw, 0]}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/laptop.glb");
