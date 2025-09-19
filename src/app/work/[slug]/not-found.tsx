"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Not found</h1>
      <p className="mb-4">The page you’re looking for doesn’t exist.</p>
      <Link
        href="/work"
        className="text-blue-600 underline underline-offset-4 hover:no-underline"
      >
        Back to work
      </Link>
    </div>
  );
}
