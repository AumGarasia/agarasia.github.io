export default function NotFound() {
  return (
    <main className="text-neutral-400">
      <h1 className="text-xl font-semibold">Project not found</h1>
      <p>
        Check the URL or go back to the{" "}
        <a className="underline" href="/work">
          Work
        </a>{" "}
        page.
      </p>
    </main>
  );
}
