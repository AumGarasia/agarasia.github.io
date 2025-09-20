// src/components/models/Laptop.tsx
"use client";

import { JSX, useEffect, useLayoutEffect, useMemo } from "react";
import { invalidate } from "@react-three/fiber";
import { Html, useGLTF, ScrollControls, useScroll } from "@react-three/drei";
import {
  ClampToEdgeWrapping,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  VideoTexture,
} from "three";

/* ---------- types & utils ---------- */

type Props = JSX.IntrinsicElements["group"] & {
  /** additional yaw on top of the gallery yaw */
  yaw?: number;
  /** Opening angle in degrees [1..110] (1 ≈ closed, 110 ≈ open) */
  openDeg?: number;
  /** 0..1: 0 offscreen below → 1 fully in place */
  timeline?: number;
  /** Optional uniform scale override */
  scaleScalar?: number;

  /** Optional override for current media instead of slide-driven content */
  screenSrc?: string;
  screenType?: "image" | "video";
  /** Which GLB material should receive the texture (defaults below) */
  screenMaterial?: string | RegExp;
  screenTexture?: string | RegExp;
};

type Slide = {
  side: "left" | "right"; // where the CAPTION sits (opposite the laptop)
  title: string;
  blurb: string;
  media: { type?: "image" | "video"; src: string };
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  0.5 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t))));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const deg = (d: number) => (d * Math.PI) / 180;
const inferType = (src: string): "image" | "video" =>
  /\.(mp4|webm|ogv)$/i.test(src) ? "video" : "image";

/* ---------- tiny helpers to find nodes/materials ---------- */

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

/* ---------- 3 project slides (edit these) ---------- */

const SLIDES: Slide[] = [
  {
    side: "right",
    title: "gud: a soulsborne vcs",
    blurb:
      "A custom Git-inspired version control system built in C++17 with commands like create, add, commit, log, omen, and echo. It implements SHA-1 hashing, object storage, parent commit support, .gudignore, scoped repository access, and poetic log outputs. Designed to be modular, test-driven, and extensible for future branching and diffing features.",
    media: { src: "/images/project-gud.png" }, // type inferred: image
  },
  {
    side: "left",
    title: "software metrics calculator",
    blurb:
      "A full-stack microservice web-app that computes 11 software quality metrics (e.g., Cyclomatic Complexity, LCOM4, Defect Score). Built with Vue.js, FastAPI, MongoDB, Docker, and a gateway service, it provides interactive Chart.js visualizations, benchmark support, and PDF report generation to track code quality trends.",
    media: { src: "/images/2-o.jpg" }, // type inferred: image
  },
  {
    side: "right",
    title: "jeopardy",
    blurb:
      "A multiplayer Jeopardy-style web game using Vue 3 (Options API) that fetches categories and questions dynamically from the OpenTDB API. Features include Double/Final Jeopardy, real-time scoring, category selection, and custom UI interactions, creating a faithful recreation of the classic quiz experience.",
    media: { src: "/images/829589.jpg" }, // type inferred: image
  },
];

/* ---------- component ---------- */

export default function Laptop({
  yaw = 0,
  openDeg = 1,
  timeline = 1,
  scaleScalar,
  // optional overrides
  screenSrc,
  screenType,
  screenMaterial,
  screenTexture,
  ...props
}: Props) {
  const { scene } = useGLTF("/models/laptop.glb");

  /* sRGB fix for embedded GLB textures */
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

  /* --- lid open (your mapping + 90° offset) --- */
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

  /* --- rise-in --- */
  const RISE_END = 0.3;
  const tRise = easeOutCubic(clamp01(timeline / RISE_END));
  const entryY = lerp(-10, 0, tRise);
  const entryScale = lerp(0.96, 1.0, tRise);

  // --- gallery path (center → left → right → left → center) ---
  const GALLERY_START = 0.3; // begin sweep once mostly open
  const openGate = clamp01((openDeg - 100) / 10);
  const gw =
    clamp01((timeline - GALLERY_START) / (1 - GALLERY_START)) * openGate; // 0..1
  const segF = gw * 4; // 0..4

  // Clamp to the last valid leg and keep a proper 0..1 fraction
  const seg = Math.min(3, Math.floor(segF)); // 0,1,2,3
  const fracRaw = seg === 3 ? Math.min(1, segF - 3) : segF - seg;
  const legT = easeInOut(fracRaw); // eased 0..1 within the current leg

  // poses
  const CENTER_POS: [number, number, number] = [0, 0, 0];
  const LEFT_POS: [number, number, number] = [-7.5, 0, 0];
  const RIGHT_POS: [number, number, number] = [7.5, 0, 0];
  const YAW_CENTER = deg(0);
  const YAW_LEFT = deg(30);
  const YAW_RIGHT = deg(-30);

  let galleryPos: [number, number, number];
  let galleryYaw: number;

  switch (seg) {
    case 0: // center -> left
      galleryPos = [
        lerp(CENTER_POS[0], LEFT_POS[0], legT),
        lerp(CENTER_POS[1], LEFT_POS[1], legT),
        lerp(CENTER_POS[2], LEFT_POS[2], legT),
      ];
      galleryYaw = lerp(YAW_CENTER, YAW_LEFT, legT);
      break;
    case 1: // left -> right
      galleryPos = [
        lerp(LEFT_POS[0], RIGHT_POS[0], legT),
        lerp(LEFT_POS[1], RIGHT_POS[1], legT),
        lerp(LEFT_POS[2], RIGHT_POS[2], legT),
      ];
      galleryYaw = lerp(YAW_LEFT, YAW_RIGHT, legT);
      break;
    case 2: // right -> left
      galleryPos = [
        lerp(RIGHT_POS[0], LEFT_POS[0], legT),
        lerp(RIGHT_POS[1], LEFT_POS[1], legT),
        lerp(RIGHT_POS[2], LEFT_POS[2], legT),
      ];
      galleryYaw = lerp(YAW_RIGHT, YAW_LEFT, legT);
      break;
    default: // 3: left -> center
      galleryPos = [
        lerp(LEFT_POS[0], CENTER_POS[0], legT),
        lerp(LEFT_POS[1], CENTER_POS[1], legT),
        lerp(LEFT_POS[2], CENTER_POS[2], legT),
      ];
      galleryYaw = lerp(YAW_LEFT, YAW_CENTER, legT);
  }

  /* ---------- slide selection & media timing ---------- */

  // Stops we care about for projects are at the *end* of legs 0,1,2.
  const targetSlide = Math.min(2, seg); // 0 (L1), 1 (R), 2 (L2)

  // Swap media slightly before reaching the stop for a nicer feel.
  const SWITCH_EARLY = 0.65;
  const previousSlide = Math.max(0, targetSlide - 1);
  const mediaSlide =
    seg === 0 ? 0 : legT < SWITCH_EARLY ? previousSlide : targetSlide;

  // Pull media + caption from slides unless user overrides via props
  const chosen =
    screenSrc && (screenType || screenSrc)
      ? ({ media: { type: screenType, src: screenSrc } } as Slide)
      : SLIDES[mediaSlide];

  const mediaType = chosen.media.type ?? inferType(chosen.media.src);

  /* ---------- apply screen media (image/video) ---------- */
  useEffect(() => {
    const src = chosen?.media?.src;
    if (!src) return;

    const normalized = src.startsWith("/") ? src : `/${src}`;
    const url = encodeURI(normalized);

    const screenRE =
      typeof screenMaterial === "string"
        ? new RegExp(screenMaterial, "i")
        : screenMaterial ?? /^screen(\.\d+)?$/i;

    const textureRE =
      typeof screenTexture === "string"
        ? new RegExp(screenTexture, "i")
        : screenTexture ?? null;

    const targets = findMaterialRefs(scene, {
      materialRE: screenRE,
      textureRE,
    });

    if (!targets.length) {
      console.warn(
        "[Laptop] No screen materials found. " +
          "Ensure your GLB has a material named like 'screen' or pass screenMaterial={/YourName/i}."
      );
      return;
    }

    // soften glass/matte overlays in front of the panel
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

    const show = (texture: Texture) => {
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

    if (mediaType === "video") {
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

      show(tex);

      const tryPlay = () => {
        videoEl!.play().catch(() => {});
      };
      if (videoEl.readyState >= 2) tryPlay();
      else videoEl.addEventListener("canplay", tryPlay, { once: true });

      // keep invalidating while playing (frameloop="demand")
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
          show(loaded);
        },
        undefined,
        () => {}
      );

      return () => {
        disposed = true;
        tex?.dispose?.();
      };
    }
  }, [scene, chosen?.media?.src, mediaType, screenMaterial, screenTexture]);

  /* ---------- caption (DOM overlay rendered from inside Canvas) ---------- */

  // Which caption to show: the *target* stop for current leg (0,1,2)
  const captionSlide = SLIDES[targetSlide];

  // Side placement (opposite of laptop): left/right
  const captionIsLeft = captionSlide.side === "left";

  // Fade caption in when we’re close to the stop
  const CAPTION_FADE_EARLY = 0.55;
  const captionAlpha =
    seg <= 2
      ? Math.max(0, (legT - CAPTION_FADE_EARLY) / (1 - CAPTION_FADE_EARLY))
      : 0;

  return (
    <group {...props} scale={scaleScalar ?? 1}>
      {/* rise-in container */}
      <group position={[0, entryY, 0]} scale={entryScale}>
        {/* gallery transform on top of rise-in */}
        <group position={galleryPos} rotation={[0, galleryYaw, 0]}>
          <primitive object={scene} />
        </group>
      </group>

      {/* Caption overlay (DOM), kept inside this component via <Html fullscreen> */}
      <Html fullscreen transform={false} zIndexRange={[100, 0]}>
        <div
          className="pointer-events-none absolute top-18 translate-y-1/2 w-[42%] px-6 md:px-10 transition-opacity duration-400 ease-out"
          style={
            {
              opacity: captionAlpha,
              [captionIsLeft ? "left" : "right"]: "8vw",
              textAlign: captionIsLeft ? "left" : "right",
            } as React.CSSProperties
          }
        >
          <h2
            className="text-[clamp(28px,5vw,44px)] font-black tracking-tight text-white"
            style={{
              fontFamily: "Grotesque Sans, Helvetica Neue Black, Inter Black",
              fontSize: "min(5vw, 44px)",
            }}
          >
            {captionSlide.title}
          </h2>
          <p
            className="mt-3 text-white/80 leading-relaxed"
            style={{
              fontFamily: "Helvetica",
              fontSize: "clamp(12px,1.2vw,16px)",
              fontWeight: "bold",
            }}
          >
            {captionSlide.blurb}
          </p>
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload("/models/laptop.glb");
