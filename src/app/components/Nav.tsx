"use client";
import Link from "next/link";

export default function Nav() {
  return (
    // inline nav (no fixed positioning)
    <nav className="text-sm md:text-base leading-none [&_*]:!text-white">
      <ul className="flex items-center gap-6">
        <li>
          <Link href="/work" className="hover:!text-gray-300 hover:underline">
            <b>work</b>
          </Link>
        </li>
        <li>
          <Link href="/about" className="hover:!text-gray-300 hover:underline">
            <b>about</b>
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className="hover:!text-gray-300 hover:underline"
          >
            <b>contact</b>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
