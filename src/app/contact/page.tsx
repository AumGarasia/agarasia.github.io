export default function ContactPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="text-neutral-400">
        Reach out via email:{" "}
        <a href="mailto:you@example.com" className="underline">
          you@example.com
        </a>
      </p>
      <p className="text-neutral-400">
        Or find me on{" "}
        <a
          href="https://linkedin.com/in/aumgarasia"
          target="_blank"
          className="underline"
        >
          LinkedIn
        </a>{" "}
        &{" "}
        <a
          href="https://github.com/aumgarasia"
          target="_blank"
          className="underline"
        >
          GitHub
        </a>
        .
      </p>
    </section>
  );
}
