import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWork, getWorkBySlug } from "@/lib/mdx";

export async function generateStaticParams() {
  return getAllWork().map((p) => ({ slug: p.slug }));
}

export default function WorkCaseStudy({
  params,
}: {
  params: { slug: string };
}) {
  const { frontmatter, content } = getWorkBySlug(params.slug);

  return (
    <main className="prose prose-invert max-w-none">
      <h1>{frontmatter.title}</h1>
      <p className="text-neutral-400">
        {frontmatter.year} • {frontmatter.tags?.join(", ")}
      </p>
      <MDXRemote source={content} />
    </main>
  );
}
