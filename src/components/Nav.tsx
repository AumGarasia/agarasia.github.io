"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="mb-8 flex items-center justify-between">
      <Link href="/" className="font-semibold tracking-tight">
        Aum
      </Link>
      <ul className="flex gap-4 text-sm">
        {links.map(({ href, label }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  "rounded-lg px-3 py-1.5 transition",
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900",
                ].join(" ")}
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
