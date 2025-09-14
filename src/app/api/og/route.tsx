import { ImageResponse } from "next/og";
export const runtime = "edge";
export async function GET() {
return new ImageResponse(
(
<div style={{ display: "flex", height: "100%", width: "100%", background: "#0a0a0a", color: "#e5e5e5", padding: 64 }}>
<div style={{ fontSize: 72, fontWeight: 700 }}>Aum Garasia</div>
</div>
),
{ width: 1200, height: 630 }
);
}