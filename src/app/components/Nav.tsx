"use client";
import Link from "next/link";

export default function Nav() {
  return (
    // inline nav (no fixed positioning)
    <nav className="text-sm md:text-base leading-none [&_*]:!text-white">
      <ul className="justify-end flex items-center gap-5 pr-3 text-sm">
        <li>
          <Link
            href="/work"
            className="px-2 py-1 rounded-md transition-colors duration-200 hover:bg-neutral-700"
          >
            work
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="px-2 py-1 rounded-md transition-colors duration-200 hover:bg-neutral-700"
          >
            about
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className="px-2 py-1 rounded-md transition-colors duration-200 hover:bg-neutral-700"
          >
            contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
