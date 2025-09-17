"use client";
import Link from "next/link";
import NowPlaying from "./NowPlaying";
import Nav from "@/app/components/Nav";

export default function TopBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <div
        className="
          bg-neutral-900 text-white shadow-md
          pointer-events-auto
          [&_*]:text-white
          [&_a:hover]:underline
          [&_a:hover]:bg-transparent
          h-12 sm:h-14 lg:h-16
        "
        style={{ isolation: "isolate", mixBlendMode: "normal", cursor: "auto" }}
      >
        <div
          className="
            mx-auto max-w-[1600px] h-full
            px-2 sm:px-4 md:px-6 lg:px-8
            grid grid-cols-[1fr_auto_1fr] items-center
            gap-2 sm:gap-4
          "
        >
          {/* Left: icon/name */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white text-black grid place-items-center text-[10px] sm:text-xs font-bold">
                a
              </div>
              <span className="hidden sm:inline text-sm md:text-base leading-none font-medium">
                aum
              </span>
            </Link>
          </div>

          {/* Center: now playing */}
          <div
            className="
              justify-self-center
              text-[11px] sm:text-xs md:text-sm lg:text-base
              leading-none truncate max-w-[50vw] sm:max-w-[40vw] md:max-w-[30vw]
            "
          >
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
