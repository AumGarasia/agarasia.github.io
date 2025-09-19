"use client";

import { JSX, useEffect, useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
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
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

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

function cloneOrCreateMaterial(src?: Material): Material {
  if (src && typeof (src as any).clone === "function") return src.clone();
  return new MeshStandardMaterial({ color: 0xffffff });
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
  const invalidate = useThree((s) => s.invalidate);

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

  // Yaw
  useEffect(() => {
    scene.rotation.y = yaw;
  }, [scene, yaw]);

  // Lid (keep your mapping and +90° offset)
  const lid = useMemo(
    () => findNode(scene, /(lid|screen|display|monitor|top|lid_geo)/i),
    [scene]
  );
  useLayoutEffect(() => {
    if (!lid) return;
    const s = clamp01((openDeg - 1) / 109); // 0 at 1°, 1 at 110°
    let radians = -MathUtils.degToRad(110 * s); // negative X opens lid
    radians += MathUtils.degToRad(90); // your +90° offset
    lid.rotation.x = radians;
    invalidate();
  }, [lid, openDeg, invalidate]);

  // Rise-in (keep your pacing)
  const RISE_END = 0.4;
  const t = easeOutCubic(clamp01(timeline / RISE_END));
  const entryY = lerp(-10, 0, t);
  const entryScale = lerp(0.96, 1.0, t);

  // --- Swap the *image component* (material.map) by targeting names ---
  useEffect(() => {
    if (!screenSrc) return;

    // 1) Normalize + encode path from /public
    const normalizedSrc = screenSrc.startsWith("/")
      ? screenSrc
      : `/${screenSrc}`;
    const url = encodeURI(normalizedSrc);

    // 2) Match the screen material precisely; fall back to your props
    const screenRE = screenMaterial
      ? typeof screenMaterial === "string"
        ? new RegExp(screenMaterial, "i")
        : screenMaterial
      : /^screen(\.\d+)?$/i; // <-- matches "screen", "screen.001", etc.

    const textureRE =
      typeof screenTexture === "string"
        ? new RegExp(screenTexture, "i")
        : screenTexture ?? null;

    // Find materials that match by name or texture name
    const targets = (function findMaterialRefs(
      root: Object3D,
      opts: { materialRE?: RegExp | null; textureRE?: RegExp | null }
    ) {
      const out: { mesh: Mesh; index: number; material: Material }[] = [];
      root.traverse((o) => {
        const mesh = o as Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as Material | Material[] | undefined;
        if (!mat) return;
        const mats = Array.isArray(mat) ? mat : [mat];
        mats.forEach((m, idx) => {
          const mName = (m?.name || "").toString();
          const tName = ((m as any)?.map?.name || "").toString();
          const matchMat = opts.materialRE?.test(mName) ?? false;
          const matchTex = opts.textureRE?.test(tName) ?? false;
          if (matchMat || matchTex) out.push({ mesh, index: idx, material: m });
        });
      });
      return out;
    })(scene, { materialRE: screenRE, textureRE });

    if (!targets.length) {
      console.warn("[Laptop] No screen materials matched.", { screenRE });
      return;
    }

    // Also catch a potential overlay ("matte"/"glass") and make it non-blocking
    const overlayMats: { mesh: Mesh; index: number; material: Material }[] = [];
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

      // 1) Put the bitmap on the screen and make sure it actually draws
      targets.forEach(({ mesh, index }) => {
        const basic = new MeshBasicMaterial({ color: 0xffffff });
        (basic as any).toneMapped = false;
        (basic as any).map = texture;
        (basic as any).needsUpdate = true;

        // Make sure it renders in front and isn’t culled by depth
        basic.depthTest = false;
        basic.depthWrite = false;

        if (Array.isArray(mesh.material)) {
          const arr = mesh.material.slice();
          arr[index] = basic;
          mesh.material = arr;
        } else {
          mesh.material = basic;
        }
        mesh.renderOrder = 20; // in front of most things
      });

      // 2) Soften / un-block any matte overlay in front
      overlayMats.forEach(({ mesh, index, material }) => {
        const m = material as any;
        m.transparent = true;
        m.opacity = Math.min(0.25, m.opacity ?? 1); // faint
        m.depthWrite = false; // don’t occlude the screen
        m.needsUpdate = true;

        if (Array.isArray(mesh.material)) {
          const arr = mesh.material.slice();
          arr[index] = m;
          mesh.material = arr;
        } else {
          mesh.material = m;
        }
        // ensure overlay still draws after screen if needed
        mesh.renderOrder = Math.max(mesh.renderOrder ?? 0, 21);
      });

      invalidate();
    };

    if (screenType === "video") {
      videoEl = document.createElement("video");
      videoEl.src = url;
      videoEl.crossOrigin = "anonymous";
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl
        .play()
        .catch((e) => console.warn("[Laptop] video autoplay failed:", e));
      tex = new VideoTexture(videoEl);
      showScreenTexture(tex);
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
    }

    return () => {
      disposed = true;
      try {
        if (videoEl) {
          videoEl.pause();
          videoEl.src = "";
          videoEl.load?.();
        }
      } catch {}
      if (tex) tex.dispose?.();
    };
  }, [scene, screenSrc, screenType, screenMaterial, screenTexture, invalidate]);

  return (
    <group {...props} scale={scaleScalar ?? 1}>
      <group position={[0, entryY, 0]} scale={entryScale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/laptop.glb");
