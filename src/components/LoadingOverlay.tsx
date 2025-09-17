"use client";
import { useEffect, useRef, useState } from "react";

export default function LoadingOverlay() {
  const [percent, setPercent] = useState(0);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);
  const raf = useRef<number | null>(null);
  const startedAt = useRef<number>(performance.now());
  const finished = useRef(false);
  const messages = [
    "Spinning up the pixels…",
    "Feeding ASCII hamsters…",
    "Compiling vibes…",
    "Aligning divs to the stars…",
    "Almost human, hold tight…",
  ];

  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [done]);

  // Smooth fake progress to ~90%
  useEffect(() => {
    const tick = (t: number) => {
      if (finished.current) return;
      const elapsed = (t - startedAt.current) / 1000; // seconds
      // ease toward 90%
      const target = Math.min(90, 100 * (1 - Math.exp(-1.6 * elapsed)));
      setPercent((p) => (p < target ? target : p));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, []);

  // Complete on window.load (or after 5s fallback)
  useEffect(() => {
    const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
    const complete = () => {
      if (finished.current) return;
      finished.current = true;

      // animate current percent -> 100 over ~300ms
      const start = performance.now();
      const startVal = percent;
      const dur = 300;

      const ramp = (ts: number) => {
        const t = Math.min(1, (ts - start) / dur);
        const v = startVal + (100 - startVal) * easeOut(t);
        setPercent(v);
        if (t < 1) {
          requestAnimationFrame(ramp);
        } else {
          setPercent(100);
          setFading(true);
          setTimeout(() => setDone(true), 350); // allow fade-out
        }
      };
      requestAnimationFrame(ramp);
    };

    window.addEventListener("load", complete);
    const to = setTimeout(complete, 2500); // safety in dev/cached

    return () => {
      window.removeEventListener("load", complete);
      clearTimeout(to);
    };
  }, [percent]);

  if (done) return null;

  // Inline styles only — no global classes needed
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0 as any,
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    background: "#0b0b0b",
    color: "#fff",
    opacity: fading ? 0 : 1,
    transition: "opacity 320ms ease",
    pointerEvents: fading ? "none" : "auto",
  };

  const percentStyle: React.CSSProperties = {
    fontSize: "clamp(3rem, 10vw, 10rem)",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.04em",
    fontFamily: "Helvetica Neue Black, Inter Black",
  };

  const barWrapStyle: React.CSSProperties = {
    height: 3,
    width: "60vw",
    maxWidth: 560,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    overflow: "hidden",
  };

  const barStyle: React.CSSProperties = {
    height: "100%",
    width: `${Math.round(percent)}%`,
    background: "#fff",
    transition: "width 180ms linear",
  };

  const captionStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    letterSpacing: "0.02em",
  };

  return (
    <div style={overlayStyle} aria-hidden="true">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={percentStyle}>{Math.round(percent)}%</div>
        <div style={barWrapStyle}>
          <div style={barStyle} />
        </div>
        <div style={captionStyle}>{messages[msgIndex]}</div>
      </div>
    </div>
  );
}
