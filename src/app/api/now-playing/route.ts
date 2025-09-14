import { NextResponse } from "next/server";


const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";


async function getAccessToken() {
const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
const res = await fetch(TOKEN_ENDPOINT, {
method: "POST",
headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${basic}` },
body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
cache: "no-store",
});
if (!res.ok) throw new Error("token fetch failed");
return res.json() as Promise<{ access_token: string }>;
}


export async function GET() {
try {
const { access_token } = await getAccessToken();
const now = await fetch(NOW_PLAYING_ENDPOINT, { headers: { Authorization: `Bearer ${access_token}` }, cache: "no-store" });
if (now.status === 204 || now.status > 400) return NextResponse.json({ isPlaying: false });
const data = await now.json();
const item = data.item;
return NextResponse.json({
isPlaying: data.is_playing,
title: item?.name,
artist: item?.artists?.map((a: any) => a.name).join(", "),
url: item?.external_urls?.spotify,
});
} catch (e) {
return NextResponse.json({ isPlaying: false });
}
}