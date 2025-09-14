export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
      {children}
    </span>
  );
}
