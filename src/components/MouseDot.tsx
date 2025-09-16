"use client";
import { useEffect, useState } from "react";

export default function MouseDot() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: pos.x - 8, // half of size
        top: pos.y - 8,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "white",
        mixBlendMode: "difference", // inverts relative to background
        opacity: 1, // slight visibility, tweak as needed
      }}
    />
  );
}
