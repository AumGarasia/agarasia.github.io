"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="fixed right-6 top-6 z-40 text-sm">
      <ul className="flex gap-4">
        <li>
          <Link href="/work" className="hover:underline">
            work
          </Link>
        </li>
        <li>
          <Link href="/about" className="hover:underline">
            about
          </Link>
        </li>
        <li>
          <Link href="/contact" className="hover:underline">
            contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
