"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type NP = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  url?: string;
  albumImageUrl?: string;
  progressMs?: number;
  durationMs?: number;
};

export default function NowPlaying() {
  const [np, setNp] = useState<NP>({ isPlaying: false });
  const [lastPollAt, setLastPollAt] = useState<number>(Date.now());
  const raf = useRef<number | null>(null);

  // poll every 30s
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        setNp(await res.json());
        setLastPollAt(Date.now());
      } catch {}
      t = setTimeout(tick, 30000);
    };
    tick();
    return () => clearTimeout(t);
  }, []);

  // smooth progress
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const loop = () => {
      setNow(Date.now());
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
    };
  }, []);

  const pct = useMemo(() => {
    if (!np.isPlaying || !np.progressMs || !np.durationMs) return 0;
    const elapsed = Math.max(0, now - lastPollAt);
    const est = Math.min(np.durationMs, np.progressMs + elapsed);
    return Math.max(0, Math.min(1, est / np.durationMs));
  }, [np.isPlaying, np.progressMs, np.durationMs, now, lastPollAt]);

  const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className="
        inline-flex items-center gap-3 rounded-full
        bg-white/6 ring-1 ring-white/15 px-3 py-1.5
        backdrop-blur-[2px] hover:bg-white/10 transition
        w-[320px] md:w-[400px] max-w-full
      "
      style={{ WebkitFontSmoothing: "antialiased" }}
    >
      {children}
    </div>
  );

  if (!np.isPlaying) {
    return (
      <Chip>
        <div className="relative h-7 w-7 overflow-hidden rounded-[4px] ring-1 ring-white/15">
          <div className="h-full w-full bg-white/10" />
        </div>
        <div className="flex min-w-0 flex-col leading-none">
          <span className="text-[13px] text-white/85 tracking-tight">
            sitting
          </span>
          <span className="text-[11px] text-white/55">idle...</span>
        </div>
      </Chip>
    );
  }

  const text = `${np.title ?? "Unknown title"} — ${
    np.artist ?? "Unknown artist"
  }`;

  return (
    <a
      href={np.url}
      target="_blank"
      rel="noreferrer"
      className="block text-white"
      title={text}
    >
      <Chip>
        {/* cover */}
        <div className="relative h-7 w-7 overflow-hidden rounded-[4px] ring-1 ring-white/20 shrink-0">
          {np.albumImageUrl ? (
            <Image
              src={np.albumImageUrl}
              alt=""
              fill
              sizes="28px"
              className="object-cover"
              priority
              style={{ filter: "grayscale(100%)" }}
            />
          ) : (
            <div className="h-full w-full bg-white/10" />
          )}
        </div>

        {/* scrolling line + progress */}
        <div className="min-w-0 flex-1 leading-none">
          <b>
            <center>
              <MarqueeLine text={text.toLowerCase()} />
            </center>
          </b>
          {np.durationMs ? (
            <div className="mt-[6px] h-[2px] w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full bg-white/85"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          ) : null}
        </div>
      </Chip>
    </a>
  );
}

/** Spotify-style marquee that only scrolls if content overflows */
function MarqueeLine({ text }: { text: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState(false);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const prevTsRef = useRef(0);

  // tune speed (px/sec) and gap between duplicates
  const SPEED = 40; // try 30–60
  const GAP_PX = 32;

  // measure on mount / text change / resize / font load
  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const measure = () => {
      wrap.scrollLeft = 0;
      setOverflow(track.scrollWidth > wrap.clientWidth + 1);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(track);
    (document as any).fonts?.ready?.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [text]);

  // scroll loop only when overflowing and motion allowed
  useEffect(() => {
    if (!overflow) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return;

    const wrap = wrapRef.current!;
    const track = trackRef.current!;

    wrap.scrollLeft = 0;
    prevTsRef.current = 0;

    const tick = (ts: number) => {
      const prev = prevTsRef.current || ts;
      const dt = (ts - prev) / 1000;
      prevTsRef.current = ts;

      if (!pausedRef.current) {
        wrap.scrollLeft += SPEED * dt;
        const max = track.scrollWidth - wrap.clientWidth;
        if (wrap.scrollLeft >= max - 1) {
          wrap.scrollLeft = 0;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      prevTsRef.current = 0;
    };
  }, [overflow]);

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden text-[13px] tracking-tight text-white/90 pr-1"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10px, black calc(100% - 10px), transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 10px, black calc(100% - 10px), transparent)",
      }}
    >
      <div
        ref={trackRef}
        className="inline-flex whitespace-nowrap"
        style={{ gap: overflow ? GAP_PX : 0 }}
      >
        <span className="mx-1">{text}</span>
        {overflow && (
          <span aria-hidden className="mx-1">
            {text}
          </span>
        )}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
