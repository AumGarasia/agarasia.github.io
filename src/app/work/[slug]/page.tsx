// src/app/work/[slug]/page.tsx
import { notFound } from "next/navigation";

// Type the params as a *Promise* in Next 15
type PageProps = {
  params: Promise<{ slug: string }>;
  // (optional) searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params; // ⬅️ await the Promise

  // ...fetch data
  // if (!data) return notFound();

  return (
    <main>
      <h1>Work: {slug}</h1>
    </main>
  );
}

// If you have this, update it too:
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params; // ⬅️ also await here
  return { title: `Work – ${slug}` };
}
