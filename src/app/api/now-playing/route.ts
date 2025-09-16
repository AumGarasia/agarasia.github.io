import { NextResponse } from "next/server";
import { fetchNowPlayingRaw, normalizeNowPlaying } from "@/lib/spotify";

export const revalidate = 0;

export async function GET() {
  try {
    const raw = await fetchNowPlayingRaw();
    const json = normalizeNowPlaying(raw);
    return NextResponse.json(json, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    // keep widget graceful
    return NextResponse.json({ isPlaying: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
