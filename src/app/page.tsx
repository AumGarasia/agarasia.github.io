import { Section } from "@/components/Section";
import { H1, H2 } from "@/components/Heading";
import NowPlaying from "@/components/NowPlaying";
import HeroClient from "@/components/HeroClient";

export default function Home() {
  return (
    <main>
      <Section className="section-sm">
        <NowPlaying />
      </Section>

      <Section>
        <H1>Aum Garasia</H1>
        <p className="mt-3 max-w-2xl muted">
          Full-stack engineer obsessed with creative UX and scalable systems.
        </p>
        <div className="mt-4 flex gap-3">
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
      </Section>

      <Section>
        <HeroClient />
      </Section>

      <Section>
        <H2>Featured</H2>
        <ul className="mt-3 space-y-2">
          <li>
            <a className="underline" href="/work/gud">
              gud — a C++ VCS
            </a>
          </li>
          <li>
            <a className="underline" href="/work/metrics-calculator">
              Software Quality Metrics Calculator
            </a>
          </li>
        </ul>
      </Section>
    </main>
  );
}
