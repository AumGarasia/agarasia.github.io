import Link from "next/link";
import { getAllProjects } from "@/lib/content";

export const metadata = { title: "Work — Aum Garasia" };

export default function WorkPage() {
  const projects = getAllProjects();
  return (
    <main>
      <h1>Work</h1>
      <p className="mt-2 muted">Case studies written in MDX.</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug} className="card p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold tracking-tight">{p.title}</h3>
              <span className="text-xs muted">{p.year}</span>
            </div>
            <p className="mt-2 text-sm muted">{p.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 text-sm">
              <Link href={`/work/${p.slug}`} className="underline">
                Read case study →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
