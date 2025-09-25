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
  Object3D,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  ShaderMaterial,
  Vector2,
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
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

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

/* ---------- pixelate + crossfade shader ---------- */

function makePixelateBlendMaterial(tex: Texture) {
  const size = new Vector2(
    (tex.image as any)?.width || 1024,
    (tex.image as any)?.height || 1024
  );

  const mat = new ShaderMaterial({
    uniforms: {
      uMapA: { value: tex }, // previous
      uMapB: { value: tex }, // next
      uMix: { value: 0 }, // 0..1 crossfade
      uAmount: { value: 0 }, // 0..1 pixelation strength
      uTexSize: { value: size },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uMapA;
      uniform sampler2D uMapB;
      uniform float uMix;
      uniform float uAmount;
      uniform vec2 uTexSize;

      void main() {
        float maxBlock = 150.0;
        float amt = clamp(uAmount, 0.0, 1.0);
        float block = mix(1.0, maxBlock, amt);
        vec2 grid = uTexSize / block;

        vec2 uvq = floor(vUv * grid) / grid + 0.5 / grid;
        vec2 uvp = mix(vUv, uvq, amt);

        vec4 a = texture2D(uMapA, uvp);
        vec4 b = texture2D(uMapB, uvp);
        gl_FragColor = mix(a, b, clamp(uMix, 0.0, 1.0));
      }
    `,
    depthTest: false,
    depthWrite: false,
    transparent: false,
  });
  (mat as any).toneMapped = false;
  return mat;
}

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
  const LEFT_POS: [number, number, number] = [-8, 0, 0];
  const RIGHT_POS: [number, number, number] = [8, 0, 0];
  const YAW_CENTER = deg(0);
  const YAW_LEFT = deg(30);
  const YAW_RIGHT = deg(-30);

  const segF = gw * 4; // 4 legs total
  const seg = Math.min(3, Math.floor(segF)); // 0..3
  const legT = easeInOut(segF - seg); // eased progress within leg

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

  /* ---------- Screen crossfade + pixelation (unchanged from your version) ---------- */

  const MID = 0.5;
  const WINDOW = 0.4;
  const HALF = WINDOW / 2;

  let prevIdx = 0,
    nextIdx = 0,
    mix = 0;
  if (seg === 1) {
    prevIdx = 0;
    nextIdx = 1;
    mix = smoothstep(MID - HALF, MID + HALF, legT);
  } else if (seg === 2) {
    prevIdx = 1;
    nextIdx = 2;
    mix = smoothstep(MID - HALF, MID + HALF, legT);
  } else {
    prevIdx = nextIdx = seg === 0 ? 0 : 2;
    mix = 0;
  }

  const pixelAmount = useMemo(() => {
    let raw = 0;
    if (seg === 1 || seg === 2) {
      raw = 1 - Math.abs(legT - MID) * 2; // 0 at edges, 1 at center
    } else {
      raw = 0;
    }
    return easeInOut(clamp01(raw));
  }, [seg, legT]);

  const loader = useMemo(() => new TextureLoader(), []);
  const textures = useRef<(Texture | null)[]>(
    new Array(SLIDES.length).fill(null)
  );
  const screenTargets = useRef<MatRef[]>([]);
  const screenMats = useRef<ShaderMaterial[] | null>(null);

  // collect screen materials once
  useEffect(() => {
    screenTargets.current = findMaterialRefs(scene, {
      materialRE: /^screen(\.\d+)?$/i,
      textureRE: null,
    });
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
          tex.anisotropy = 16;
          tex.needsUpdate = true;
          textures.current[i] = tex;

          if (!screenMats.current && textures.current[0]) {
            screenMats.current = screenTargets.current.map(
              ({ mesh, index }) => {
                const m = makePixelateBlendMaterial(textures.current[0]!);
                if (Array.isArray(mesh.material)) {
                  const arr = mesh.material.slice();
                  arr[index] = m;
                  mesh.material = arr;
                } else {
                  mesh.material = m;
                }
                return m;
              }
            );
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

  // feed textures & crossfade amount whenever leg or loads change
  useEffect(() => {
    if (!screenMats.current) return;
    const texA = textures.current[prevIdx] || textures.current[0];
    const texB = textures.current[nextIdx] || texA;
    if (!texA) return;

    screenMats.current.forEach((m) => {
      m.uniforms.uMapA.value = texA;
      m.uniforms.uMapB.value = texB;
      const w = (texA.image as any)?.width || 1024;
      const h = (texA.image as any)?.height || 1024;
      (m.uniforms.uTexSize.value as Vector2).set(w, h);
      m.uniforms.uMix.value = mix;
      m.uniforms.uAmount.value = pixelAmount;
      m.needsUpdate = true;
    });
    invalidate();
  }, [prevIdx, nextIdx, mix, pixelAmount]);

  /* ---------- Caption crossfade (two layers, no flicker) ---------- */

  // Define which caption we are leaving and which we are approaching
  const captionFromIdx = seg === 1 ? 0 : seg === 2 ? 1 : seg === 3 ? 2 : 0;
  const captionToIdx = seg === 0 ? 0 : seg === 1 ? 1 : seg === 2 ? 2 : 2;

  // Outgoing fades in the first 20% of a leg; incoming fades between 72%..95%
  const CAPTION_OUT_END = 0.2; // 0 → 20% of leg
  const CAPTION_IN_START = 0.72; // start late
  const CAPTION_IN_END = 0.95; // fully visible near the stop

  const captionOutAlpha =
    seg === 1 || seg === 2 || seg === 3
      ? 1 - smoothstep(0.0, CAPTION_OUT_END, legT)
      : 0;

  const captionInAlpha =
    seg === 0 || seg === 1 || seg === 2
      ? smoothstep(CAPTION_IN_START, CAPTION_IN_END, legT)
      : 0;

  const captionFrom = SLIDES[Math.min(captionFromIdx, SLIDES.length - 1)];
  const captionTo = SLIDES[Math.min(captionToIdx, SLIDES.length - 1)];

  // Skip rendering layers when they are basically invisible (less layout churn)
  const showFrom =
    captionOutAlpha > 0.02 && (seg === 1 || seg === 2 || seg === 3);
  const showTo = captionInAlpha > 0.02 && (seg === 0 || seg === 1 || seg === 2);

  return (
    <group {...props} scale={scaleScalar ?? 1}>
      {/* rise-in */}
      <group position={[0, entryY, 0]} scale={entryScale}>
        {/* gallery sweep */}
        <group position={galleryPos} rotation={[0, galleryYaw + yaw, 0]}>
          <primitive object={scene} />
        </group>
      </group>

      {/* CAPTION: outgoing */}
      {showFrom && (
        <Html fullscreen transform={false} zIndexRange={[100, 0]}>
          <div
            className="pointer-events-none absolute top-[22%] w-[min(620px,52vw)] px-6 md:px-10 transition-opacity duration-200 ease-linear"
            style={
              {
                opacity: captionOutAlpha,
                [captionFrom.side === "left" ? "left" : "right"]: "7vw",
                textAlign: captionFrom.side === "left" ? "left" : "right",
                willChange: "opacity",
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
              {captionFrom.title}
            </h2>
            <p
              className="mt-3 text-white/80 leading-relaxed"
              style={{
                fontFamily: "Helvetica",
                fontSize: "clamp(12px,1.2vw,16px)",
                fontWeight: "bold",
                maxWidth: "60ch",
              }}
            >
              {captionFrom.blurb}
            </p>
          </div>
        </Html>
      )}

      {/* CAPTION: incoming */}
      {showTo && (
        <Html fullscreen transform={false} zIndexRange={[101, 1]}>
          <div
            className="pointer-events-none absolute top-[22%] w-[min(620px,52vw)] px-6 md:px-10 transition-opacity duration-300 ease-out"
            style={
              {
                opacity: captionInAlpha,
                [captionTo.side === "left" ? "left" : "right"]: "7vw",
                textAlign: captionTo.side === "left" ? "left" : "right",
                willChange: "opacity",
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
              {captionTo.title}
            </h2>
            <p
              className="mt-3 text-white/80 leading-relaxed"
              style={{
                fontFamily: "Helvetica",
                fontSize: "clamp(12px,1.2vw,16px)",
                fontWeight: "bold",
                maxWidth: "60ch",
              }}
            >
              {captionTo.blurb}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload("/models/laptop.glb");
