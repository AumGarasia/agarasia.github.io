export const metadata = { title: "About — Aum Garasia" };

export default function AboutPage() {
  return (
    <main className="prose prose-invert max-w-none">
      <h1>About</h1>
      <p>
        I’m Aum Garasia — a full‑stack engineer who loves creative UX, scalable
        systems, and building tools that feel fast and thoughtful. I enjoy art,
        music (Interpol/Radiohead), and Soulsborne games.
      </p>
      <h2>Philosophy</h2>
      <ul>
        <li>
          <strong>Creativity × Engineering:</strong> polish and playfulness
          without sacrificing performance.
        </li>
        <li>
          <strong>Scale‑minded:</strong> simple architectures that grow
          gracefully.
        </li>
        <li>
          <strong>UX as systems thinking:</strong> latency, accessibility, DX.
        </li>
      </ul>
      <h2>Elsewhere</h2>
      <p>LinkedIn • GitHub • Resume (we’ll wire links later).</p>
    </main>
  );
}
