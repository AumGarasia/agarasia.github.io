"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="mb-10 flex items-center justify-between">
      <Link href="/" className="font-semibold tracking-tight">
        Aum
      </Link>
      <ul className="flex gap-1">
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
