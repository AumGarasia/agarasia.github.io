// src/lib/spotify.ts
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

async function getAccessToken() {
  if (!SPOTIFY_REFRESH_TOKEN) throw new Error("Missing SPOTIFY_REFRESH_TOKEN");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN, // ← no redirect_uri here
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ access_token: string }>;
}

export async function fetchNowPlayingRaw() {
  const { access_token } = await getAccessToken();
  const r = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: "no-store",
  });
  if (r.status === 204 || r.status === 202) return null; // nothing playing
  if (!r.ok) throw new Error(`Spotify API error: ${r.status} ${await r.text()}`);
  return r.json();
}

export function normalizeNowPlaying(raw: any) {
  if (!raw) return { isPlaying: false } as const;
  const item = raw.item ?? null;
  const title = item?.name ?? undefined;
  const artist =
    item?.artists?.map((a: any) => a?.name).filter(Boolean).join(", ") || undefined;
  const images: Array<{ url: string; width?: number; height?: number }> = item?.album?.images ?? [];
  const albumImageUrl = images[0]?.url ?? undefined; // Spotify returns largest first
  const url = item?.external_urls?.spotify ?? undefined;
  const progressMs = typeof raw?.progress_ms === "number" ? raw.progress_ms : undefined;
  const durationMs = typeof item?.duration_ms === "number" ? item.duration_ms : undefined;

  return { isPlaying: !!raw.is_playing, title, artist, url, albumImageUrl, progressMs, durationMs };
}
