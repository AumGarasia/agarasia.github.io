export default function Home() {
  return (
    <main className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Aum Garasia
        </h1>
        <p className="max-w-2xl text-neutral-400">
          Full‑stack engineer obsessed with creative UX and scalable systems. I
          build tools, visuals, and infrastructure that feel fast, considerate,
          and a little bit magical.
        </p>
        <div className="flex gap-3">
          <a
            href="/work"
            className="rounded-xl border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
          >
            View Work
          </a>
          <a
            href="/contact"
            className="rounded-xl border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
          >
            Contact
          </a>
        </div>
      </header>

      <section id="work" className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Featured</h2>
        <p className="text-neutral-500">
          We’ll wire this to MDX case studies in Step 3.
        </p>
      </section>

      <footer className="border-t border-neutral-900 pt-6 text-sm text-neutral-500">
        Press <kbd className="rounded bg-neutral-900 px-1.5 py-0.5">`</kbd> for
        the terminal.
      </footer>
    </main>
  );
}
