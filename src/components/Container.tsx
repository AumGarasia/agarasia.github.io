export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 md:px-8">{children}</div>
  );
}
