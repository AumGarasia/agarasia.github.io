import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// Optionally map custom components here (Callout, Code, etc.)
const components = {} as any;

export default function MDXContent({ source }: { source: string }) {
  return (
    <article className="prose prose-invert max-w-none">
      {/* @ts-expect-error Async Server Component */}
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "append" }],
            ],
          },
        }}
      />
    </article>
  );
}
