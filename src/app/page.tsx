import Link from "next/link";

const featured = [
  { href: "/work/gud", title: "gud — a C++ VCS" },
  {
    href: "/work/metrics-calculator",
    title: "Software Quality Metrics Calculator",
  },
];

export default function Home() {
  return (
    <main className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Aum Garasia
        </h1>
        <p className="max-w-2xl text-neutral-400">
          Full‑stack engineer obsessed with creative UX and scalable systems.
        </p>
        <div className="flex gap-3">
          <Link
            href="/work"
            className="rounded-xl border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
          >
            View Work
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
          >
            Contact
          </Link>
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Featured</h2>
        <ul className="list-inside list-disc text-neutral-300">
          {featured.map((f) => (
            <li key={f.href}>
              <Link className="underline underline-offset-4" href={f.href}>
                {f.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-neutral-900 pt-6 text-sm text-neutral-500">
        Press <kbd className="rounded bg-neutral-900 px-1.5 py-0.5">`</kbd> for
        the terminal.
      </footer>
    </main>
  );
}
