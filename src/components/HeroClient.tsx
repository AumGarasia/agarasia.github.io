"use client";
import dynamic from "next/dynamic";
const AsciiHero = dynamic(() => import("@/components/AsciiHero"), {
  ssr: false,
});
export default function HeroClient() {
  return <AsciiHero />;
}
