import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex gap-6 text-sm font-medium text-neutral-400">
      <Link href="/" className="hover:text-neutral-100">
        Home
      </Link>
      <Link href="/work" className="hover:text-neutral-100">
        Work
      </Link>
      <Link href="/about" className="hover:text-neutral-100">
        About
      </Link>
      <Link href="/contact" className="hover:text-neutral-100">
        Contact
      </Link>
    </nav>
  );
}
