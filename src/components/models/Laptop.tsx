// src/components/models/Laptop.tsx
"use client";

import { JSX, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { invalidate } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
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
} from "three";

/* ---------- types & utils ---------- */

type Props = JSX.IntrinsicElements["group"] & {
  yaw?: number;
  openDeg?: number; // [1..110]
  timeline?: number; // [0..1]
  scaleScalar?: number; // uniform scale
};

type Slide = {
  side: "left" | "right";
  title: string;
  blurb: string;
  src: string; // image in /public
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  0.5 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t))));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const deg = (d: number) => (d * Math.PI) / 180;

/* ---------- tiny helpers ---------- */

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

/* ---------- slides (edit these paths/titles) ---------- */

const SLIDES: Slide[] = [
  {
    side: "right",
    title: "gud: a soulsborne vcs",
    blurb:
      "A custom Git-inspired version control system built in C++17 with commands like create, add, commit, log, omen, and echo. It implements SHA-1 hashing, object storage, parent commit support, .gudignore, scoped repository access, and poetic log outputs. Designed to be modular, test-driven, and extensible for future branching and diffing features.",
    src: "/images/project-gud.png",
  },
  {
    side: "left",
    title: "software metrics calculator",
    blurb:
      "A full-stack microservice web-app that computes 11 software quality metrics (e.g., Cyclomatic Complexity, LCOM4, Defect Score). Built with Vue.js, FastAPI, MongoDB, Docker, and a gateway service, it provides interactive Chart.js visualizations, benchmark support, and PDF report generation to track code quality trends.",
    src: "/images/2-o.jpg",
  },
  {
    side: "right",
    title: "jeopardy",
    blurb:
      "A multiplayer Jeopardy-style web game using Vue 3 (Options API) that fetches categories and questions dynamically from the OpenTDB API. Features include Double/Final Jeopardy, real-time scoring, category selection, and custom UI interactions, creating a faithful recreation of the classic quiz experience.",
    src: "/images/829589.jpg",
  },
];

/* ---------- component ---------- */

export default function Laptop({
  yaw = 0,
  openDeg = 1,
  timeline = 1,
  scaleScalar,
  ...props
}: Props) {
  const { scene } = useGLTF("/models/laptop.glb");

  // sRGB for embedded textures
  useEffect(() => {
    scene.traverse((o) => {
      if ((o as Mesh).isMesh) {
        const mat = (o as Mesh).material as any;
        const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
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

  /* --- Lid open (your mapping + 90° offset) --- */
  const lid = useMemo(
    () => findNode(scene, /(lid|screen|display|monitor|top|lid_geo)/i),
    [scene]
  );
  useLayoutEffect(() => {
    if (!lid) return;
    const s = clamp01((openDeg - 1) / 109);
    let radians = -MathUtils.degToRad(110 * s);
    radians += MathUtils.degToRad(90);
    lid.rotation.x = radians;
    invalidate();
  }, [lid, openDeg]);

  /* --- Rise-in --- */
  const RISE_END = 0.3;
  const tRise = easeOutCubic(clamp01(timeline / RISE_END));
  const entryY = lerp(-10, 0, tRise);
  const entryScale = lerp(0.96, 1.0, tRise);

  /* --- Gallery path (center → left → right → left → center) --- */
  const GALLERY_START = 0.3;
  const openGate = clamp01((openDeg - 100) / 10);
  const gw =
    clamp01((timeline - GALLERY_START) / (1 - GALLERY_START)) * openGate;

  const CENTER_POS: [number, number, number] = [0, 0, 0];
  const LEFT_POS: [number, number, number] = [-9.5, 0, 0];
  const RIGHT_POS: [number, number, number] = [9.5, 0, 0];
  const YAW_CENTER = deg(0);
  const YAW_LEFT = deg(30);
  const YAW_RIGHT = deg(-30);

  const segF = gw * 4; // 4 legs total
  const seg = Math.min(3, Math.floor(segF));
  const legT = easeInOut(segF - seg);

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

  /* ---------- Slide selection (images only, switch at mid-leg) ---------- */

  const targetSlide = Math.min(2, seg); // stops after legs 0/1/2
  const MID = 0.5;

  let activeSlideIndex: number;
  if (seg === 0) {
    activeSlideIndex = 0; // center -> left: keep 0
  } else if (seg === 1) {
    activeSlideIndex = legT < MID ? 0 : 1; // switch 0 -> 1 at midpoint
  } else if (seg === 2) {
    activeSlideIndex = legT < MID ? 1 : 2; // switch 1 -> 2 at midpoint
  } else {
    activeSlideIndex = 2; // last leg: keep final slide
  }

  /* ---------- Preload textures & swap map ---------- */

  const loader = useMemo(() => new TextureLoader(), []);
  const textures = useRef<(Texture | null)[]>(
    new Array(SLIDES.length).fill(null)
  );
  const screenTargets = useRef<MatRef[]>([]);

  // collect screen materials once & convert to basic
  useEffect(() => {
    screenTargets.current = findMaterialRefs(scene, {
      materialRE: /^screen(\.\d+)?$/i,
      textureRE: null,
    });
    screenTargets.current.forEach(({ mesh, index }) => {
      const basic = new MeshBasicMaterial({ color: 0xffffff });
      (basic as any).toneMapped = false;
      basic.depthTest = false;
      basic.depthWrite = false;

      if (Array.isArray(mesh.material)) {
        const arr = mesh.material.slice();
        arr[index] = basic;
        mesh.material = arr;
      } else {
        mesh.material = basic;
      }
    });
    invalidate();
  }, [scene]);

  // preload all slide images
  useEffect(() => {
    let cancelled = false;
    SLIDES.forEach((s, i) => {
      const url = encodeURI(s.src.startsWith("/") ? s.src : `/${s.src}`);
      loader.load(
        url,
        (tex) => {
          if (cancelled) return;
          tex.colorSpace = SRGBColorSpace;
          tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
          tex.flipY = false;
          textures.current[i] = tex;

          // apply first loaded if nothing shown yet
          if (i === 0 && screenTargets.current.length) {
            screenTargets.current.forEach(({ mesh, index }) => {
              const mat = Array.isArray(mesh.material)
                ? (mesh.material as MeshBasicMaterial[])[index]
                : (mesh.material as MeshBasicMaterial);
              mat.map = tex;
              mat.needsUpdate = true;
            });
            invalidate();
          }
        },
        undefined,
        () => {}
      );
    });
    return () => {
      cancelled = true;
      textures.current.forEach((t) => t?.dispose?.());
    };
  }, [loader]);

  // swap texture when active slide changes
  useEffect(() => {
    const tex = textures.current[activeSlideIndex];
    if (!tex) return; // not loaded yet
    screenTargets.current.forEach(({ mesh, index }) => {
      const mat = Array.isArray(mesh.material)
        ? (mesh.material as MeshBasicMaterial[])[index]
        : (mesh.material as MeshBasicMaterial);
      mat.map = tex;
      mat.needsUpdate = true;
    });
    invalidate();
  }, [activeSlideIndex]);

  /* ---------- Caption (optional) ---------- */

  const caption = SLIDES[Math.min(targetSlide, SLIDES.length - 1)];
  const captionIsLeft = caption.side === "left";
  const CAPTION_FADE_EARLY = 0.55;
  const captionAlpha =
    seg <= 2
      ? Math.max(0, (legT - CAPTION_FADE_EARLY) / (1 - CAPTION_FADE_EARLY))
      : 0;

  return (
    <group {...props} scale={scaleScalar ?? 1}>
      {/* rise-in */}
      <group position={[0, entryY, 0]} scale={entryScale}>
        {/* gallery sweep */}
        <group position={galleryPos} rotation={[0, galleryYaw + yaw, 0]}>
          <primitive object={scene} />
        </group>
      </group>

      {/* caption */}
      <Html fullscreen transform={false} zIndexRange={[100, 0]}>
        <div
          className="pointer-events-none absolute top-[44%] w-[min(620px,52vw)] px-6 md:px-10 transition-opacity duration-300 ease-out"
          style={
            {
              opacity: captionAlpha,
              [captionIsLeft ? "left" : "right"]: "4vw",
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
            {caption.title}
          </h2>
          <p
            className="mt-3 text-white/80 leading-relaxed"
            style={{
              fontFamily: "Helvetica",
              fontSize: "clamp(12px,1.2vw,16px)",
              fontWeight: "bold",
            }}
          >
            {caption.blurb}
          </p>
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload("/models/laptop.glb");
