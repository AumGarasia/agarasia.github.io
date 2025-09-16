"use client";
import Link from "next/link";
import NowPlaying from "./NowPlaying";
import Nav from "@/app/components/Nav";

export default function TopBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50">
      {/* full width, solid bar */}
      <div
        className="
          h-12 md:h-14 bg-neutral-900 text-white shadow-md
          pointer-events-auto
          [&_*]:text-white
          [&_a:hover]:underline
          [&_a:hover]:bg-transparent
        "
        style={{ isolation: "isolate", mixBlendMode: "normal", cursor: "auto" }}
      >
        {/* constrain content but keep bar full-bleed */}
        <div
          className="mx-auto max-w-[1600px] h-full px-4 sm:px-6 md:px-8
                        grid grid-cols-[1fr_auto_1fr] items-center"
        >
          {/* Left: icon/name */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white text-black grid place-items-center text-xs font-bold">
                a
              </div>
              <span className="hidden sm:inline text-sm leading-none font-medium">
                aum
              </span>
            </Link>
          </div>

          {/* Center: now playing */}
          <div className="justify-self-center text-xs md:text-sm leading-none truncate">
            <NowPlaying />
          </div>

          {/* Right: nav */}
          <div className="justify-self-end">
            <Nav />
          </div>
        </div>
      </div>
    </div>
  );
}
