"use client";
import { useEffect, useState } from "react";

type NP = { isPlaying: boolean; title?: string; artist?: string; url?: string };
export default function NowPlaying() {
  const [np, setNp] = useState<NP>({ isPlaying: false });
  useEffect(() => {
    let t: any;
    const tick = async () => {
      const res = await fetch("/api/now-playing", { cache: "no-store" });
      setNp(await res.json());
      t = setTimeout(tick, 30000);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  if (!np.isPlaying)
    return <div className="text-sm text-neutral-500">Not playing</div>;
  return (
    <a
      href={np.url}
      target="_blank"
      className="text-sm text-neutral-300 underline underline-offset-4"
    >
      Currently Listening: {np.title} — {np.artist}
    </a>
  );
}
