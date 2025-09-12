import Link from "next/link";
import { getAllWork } from "@/lib/mdx";

export const metadata = { title: "Work — Aum Garasia" };

export default function WorkPage() {
  const works = getAllWork();
  return (
    <main>
      <h1 className="text-2xl font-semibold mb-4">Work</h1>
      <ul className="grid gap-4 md:grid-cols-2">
        {works.map((p) => (
          <li
            key={p.slug}
            className="rounded-2xl border border-neutral-900 p-4 hover:bg-neutral-950"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold">{p.frontmatter.title}</h3>
              <span className="text-xs text-neutral-500">
                {p.frontmatter.year}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-400">
              {p.frontmatter.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.frontmatter.tags?.map((t: string) => (
                <span
                  key={t}
                  className="rounded-md border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 text-sm">
              <Link
                href={`/work/${p.slug}`}
                className="text-neutral-300 underline underline-offset-4"
              >
                Read case study →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
